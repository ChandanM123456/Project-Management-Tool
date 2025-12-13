import os
import uuid
import base64
import pickle
import numpy as np
import json
import re
import io
from datetime import timedelta, datetime

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status

from .models import Employee, InviteToken, EmotionData
from .serializers import EmployeeSerializer, InviteTokenSerializer

from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

# Resume processing imports
try:
    import fitz  # PyMuPDF
    import docx  # python-docx
    RESUME_PROCESSING_AVAILABLE = True
except ImportError:
    RESUME_PROCESSING_AVAILABLE = False

# Face recognition imports
try:
    import face_recognition
    from PIL import Image
    FACE_RECOGNITION_AVAILABLE = True
except ImportError:
    FACE_RECOGNITION_AVAILABLE = False

# Emotion detection imports
try:
    from fer import FER
    EMOTION_DETECTION_AVAILABLE = True
    emotion_detector = FER(mtcnn=True)
except ImportError:
    EMOTION_DETECTION_AVAILABLE = False
    emotion_detector = None

# Utility: generate random token
def random_token():
    return uuid.uuid4().hex

@api_view(['POST'])
@permission_classes([AllowAny])
def create_invite(request):
    """Create an invite token for a company.
    Accepts either an authenticated manager user OR a company token in Authorization header.
    Header example: Authorization: Bearer company_<id>_<email>
    """
    company = None
    # try django authenticated user
    if hasattr(request, 'user') and getattr(request.user, 'is_authenticated', False):
        try:
            company = request.user.manager.company
        except Exception:
            company = None

    # if not authenticated via Django user, check Authorization header for company or manager token
    if not company:
        auth = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
        if auth and auth.startswith('Bearer '):
            token = auth.split(' ', 1)[1]
            if token.startswith('company_'):
                rest = token.split('company_', 1)[1]
                # rest expected like: '<id>_email...'
                parts = rest.split('_', 1)
                try:
                    cid = int(parts[0])
                    from company.models import Company
                    company = Company.objects.filter(id=cid).first()
                except Exception:
                    company = None
            elif token.startswith('manager_'):
                # token format: manager_<manager_id>_<email>
                rest = token.split('manager_', 1)[1]
                parts = rest.split('_', 1)
                try:
                    mid = int(parts[0])
                    from managers.models import Manager as ManagerModel
                    mgr = ManagerModel.objects.filter(id=mid).first()
                    if mgr:
                        company = mgr.company
                except Exception:
                    company = None

    if not company:
        return Response({"detail":"Company authentication required (manager user or company token)."}, status=403)

    token = random_token()
    it = InviteToken.objects.create(company=company, token=token, created_by=(request.user if getattr(request.user, 'is_authenticated', False) else None))
    url = request.build_absolute_uri(f"/onboard/{it.token}/")  # for frontend to show share link
    return Response({"invite_token": it.token, "url": url})

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def onboard_public(request, token):
    """
    Public onboarding endpoint.
    Expected multipart form-data:
      - name, email, phone, designation, experience
      - resume (file)
      - face_images[] (multiple files)
    """
    invite = get_object_or_404(InviteToken, token=token)
    # optional: check expiry
    data = request.data
    name = data.get('name')
    email = data.get('email')
    phone = data.get('phone')
    designation = data.get('designation')
    experience = data.get('experience')
    password = data.get('password')

    # basic validation
    if not name or not email:
        return Response({"detail":"name and email required"}, status=400)

    # create employee
    emp = Employee.objects.create(
        company=invite.company,
        name=name,
        email=email,
        phone=phone or "",
        designation=designation or "",
        experience=experience or ""
    )

    # set password if provided (hashed)
    if password:
        from django.contrib.auth.hashers import make_password
        emp.password = make_password(password)
        emp.save()

    # save resume if provided
    resume = request.FILES.get('resume')
    if resume:
        emp.resume.save(resume.name, resume, save=True)

    # save face images
    files = request.FILES.getlist('face_images')
    images_saved = 0
    if files:
        fm_dir = os.path.join(settings.MEDIA_ROOT, 'faces', str(emp.id))
        os.makedirs(fm_dir, exist_ok=True)
        for f in files:
            path = os.path.join('faces', str(emp.id), f.name)
            emp_path = default_storage.save(path, f)
            images_saved += 1
    emp.face_images_count = images_saved
    emp.save()

    # trigger encoding update (synchronously for now)
    try:
        from .utils import update_encodings_for_employee
        update_encodings_for_employee(emp.id)
    except Exception as e:
        # log error; return success so user isn't blocked
        print("Encoding error:", e)

    ser = EmployeeSerializer(emp)
    return Response(ser.data, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
def employee_password_login(request):
    """Employee login via email + password."""
    data = request.data
    email = data.get('email')
    password = data.get('password')
    if not email or not password:
        return Response({"detail":"email and password required"}, status=400)
    try:
        emp = Employee.objects.get(email=email)
        from django.contrib.auth.hashers import check_password
        if emp.password and check_password(password, emp.password):
            token = f"employee_{emp.id}_{emp.email}"
            return Response({"success": True, "token": token, "employee_id": str(emp.id), "name": emp.name})
        else:
            return Response({"detail":"Invalid credentials"}, status=401)
    except Employee.DoesNotExist:
        return Response({"detail":"Employee not found"}, status=404)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def face_login(request):
    """
    Accepts JSON: { "image": "<data:image/jpeg;base64,...>" }
    Returns matched employee info with voice greeting and project details.
    """
    data = request.data
    img_b64 = data.get('image')
    if not img_b64:
        return Response({"detail":"image required"}, status=400)

    # Load employee encodings from individual files
    employee_encodings_dir = os.path.join(settings.MEDIA_ROOT, 'employee_encodings')
    if not os.path.exists(employee_encodings_dir):
        return Response({"detail":"no encodings available"}, status=404)

    # Load all employee encodings
    enc_db = {}
    for emp_id in os.listdir(employee_encodings_dir):
        emp_dir = os.path.join(employee_encodings_dir, emp_id)
        if os.path.isdir(emp_dir):
            encodings_file = os.path.join(emp_dir, 'encodings.pkl')
            if os.path.exists(encodings_file):
                try:
                    with open(encodings_file, 'rb') as f:
                        enc_db[emp_id] = pickle.load(f)
                except:
                    continue

    # Decode incoming image base64 (strip header)
    if ',' in img_b64:
        img_b64 = img_b64.split(',',1)[1]
    img_bytes = base64.b64decode(img_b64)
    
    # Use face_recognition to compute encoding
    import face_recognition
    import io
    from PIL import Image
    img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
    img_arr = np.array(img)
    encs = face_recognition.face_encodings(img_arr)
    if not encs:
        return Response({"detail":"no face detected"}, status=400)
    qenc = encs[0]

    # Detect emotion from the face
    detected_emotion = "neutral"
    emotion_confidence = 0.0
    if EMOTION_DETECTION_AVAILABLE and emotion_detector:
        try:
            # Detect emotions
            emotions = emotion_detector.detect_emotions(img_arr)
            if emotions and len(emotions) > 0:
                # Get the dominant emotion
                emotion_data = emotions[0]
                if 'emotions' in emotion_data:
                    emotions_dict = emotion_data['emotions']
                    # Find the emotion with highest confidence
                    detected_emotion = max(emotions_dict, key=emotions_dict.get)
                    emotion_confidence = emotions_dict[detected_emotion]
        except Exception as e:
            print(f"Emotion detection error: {e}")

    # Compare distances
    best = {"emp_id": None, "dist": 999}
    for emp_id, enc in enc_db.items():
        enc_arr = np.array(enc)
        dist = np.linalg.norm(enc_arr - qenc)
        if dist < best["dist"]:
            best = {"emp_id": emp_id, "dist": float(dist)}
    
    # Threshold — tune as needed
    THRESH = 0.48
    if best["dist"] < THRESH:
        try:
            emp = Employee.objects.get(id=best["emp_id"])
            
            # Get employee's current projects
            current_projects = []
            projects = emp.projects.filter(status='active')
            for project in projects:
                current_projects.append({
                    'name': project.name,
                    'description': project.description,
                    'status': project.status,
                    'progress': project.progress_percentage,
                    'deadline': project.deadline.strftime('%Y-%m-%d') if project.deadline else None,
                    'role': 'Team Member'  # You can enhance this with EmployeeProject model
                })
            
            # Generate emotion-based greeting
            def get_emotion_based_greeting(emotion, confidence, emp_name, designation, projects):
                """Generate greeting based on detected emotion"""
                greetings = {
                    'happy': {
                        'greeting': f"Great to see you smiling, {emp_name}! {designation}. Welcome back!",
                        'voice_params': {'rate': 1.1, 'pitch': 1.2, 'volume': 1.0}
                    },
                    'sad': {
                        'greeting': f"Hello {emp_name}. {designation}. I hope you're doing okay. Welcome to the system.",
                        'voice_params': {'rate': 0.8, 'pitch': 0.9, 'volume': 0.9}
                    },
                    'angry': {
                        'greeting': f"Welcome {emp_name}. {designation}. Take a deep breath, let's have a productive day.",
                        'voice_params': {'rate': 0.9, 'pitch': 0.8, 'volume': 0.8}
                    },
                    'surprise': {
                        'greeting': f"Well hello there, {emp_name}! {designation}. Nice to see you!",
                        'voice_params': {'rate': 1.0, 'pitch': 1.1, 'volume': 1.0}
                    },
                    'fear': {
                        'greeting': f"Welcome {emp_name}. {designation}. Everything is alright, you're safe here.",
                        'voice_params': {'rate': 0.8, 'pitch': 0.9, 'volume': 0.8}
                    },
                    'disgust': {
                        'greeting': f"Hello {emp_name}. {designation}. Hope you're having a better day now.",
                        'voice_params': {'rate': 0.9, 'pitch': 0.8, 'volume': 0.8}
                    },
                    'neutral': {
                        'greeting': f"Hello {emp_name}. {designation}. Welcome to the system!",
                        'voice_params': {'rate': 0.9, 'pitch': 1.0, 'volume': 1.0}
                    }
                }
                
                # Default to neutral if emotion not recognized
                emotion_key = emotion.lower() if emotion.lower() in greetings else 'neutral'
                greeting_data = greetings[emotion_key]
                
                # Add project information
                if projects:
                    project_names = [p['name'] for p in projects[:2]]  # Limit to 2 projects
                    if len(project_names) == 1:
                        greeting_data['greeting'] += f" Currently working on {project_names[0]} project."
                    elif len(project_names) > 1:
                        greeting_data['greeting'] += f" Currently working on {', '.join(project_names)} projects."
                
                return greeting_data
            
            # Get emotion-based greeting
            greeting_data = get_emotion_based_greeting(
                detected_emotion, 
                emotion_confidence, 
                emp.first_name or emp.name, 
                emp.designation or '', 
                current_projects
            )
            
            # Update last login
            emp.last_login = timezone.now()
            emp.save()
            
            # Store emotion data in database
            emotion_data = {
                'emotion': detected_emotion,
                'confidence': emotion_confidence,
                'timestamp': timezone.now().isoformat()
            }
            
            # Save emotion data to database
            try:
                # Save the captured image for emotion analysis
                emotion_image_path = None
                if img_bytes:
                    emotion_filename = f"emotion_{emp.id}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.jpg"
                    emotion_image_path = default_storage.save(f"emotions/{emotion_filename}", ContentFile(img_bytes))
                
                EmotionData.objects.create(
                    employee=emp,
                    emotion=detected_emotion,
                    confidence=emotion_confidence,
                    image=emotion_image_path,
                    context='login'
                )
                
                print(f"Emotion data saved: {detected_emotion} with {emotion_confidence:.2f} confidence")
                
            except Exception as e:
                print(f"Failed to save emotion data: {e}")
                # Continue with login even if emotion saving fails
            
            # Prepare response
            payload = {
                "success": True,
                "employee_id": str(emp.id),
                "name": emp.name,
                "first_name": emp.first_name,
                "last_name": emp.last_name,
                "email": emp.email,
                "designation": emp.designation,
                "department": emp.department,
                "company": emp.company.name,
                "greeting": greeting_data['greeting'],
                "voice_greeting": greeting_data['greeting'],  # For text-to-speech
                "voice_params": greeting_data['voice_params'],  # For dynamic voice settings
                "current_projects": current_projects,
                "skills": emp.get_skills_list(),
                "experience": emp.experience,
                "photo_url": emp.photo.url if emp.photo else None,
                "login_time": emp.last_login.isoformat() if emp.last_login else None,
                "token": f"employee_{emp.id}_{emp.email}",  # Simple token for session
                "emotion_detection": {
                    "detected_emotion": detected_emotion,
                    "confidence": emotion_confidence,
                    "available": EMOTION_DETECTION_AVAILABLE
                }
            }
            
            return Response(payload, status=200)
            
        except Employee.DoesNotExist:
            return Response({"detail":"employee not found"}, status=404)
    else:
        return Response({"detail":"no match found", "distance": best["dist"]}, status=401)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def employee_emotion_analytics(request, employee_id):
    """Get emotion analytics for an employee"""
    try:
        employee = get_object_or_404(Employee, id=employee_id)
        
        # Get emotion data for the last 30 days
        from datetime import datetime, timedelta
        thirty_days_ago = timezone.now() - timedelta(days=30)
        
        emotion_data = EmotionData.objects.filter(
            employee=employee,
            created_at__gte=thirty_days_ago
        ).order_by('-created_at')
        
        # Calculate emotion statistics
        emotion_counts = {}
        emotion_confidence = {}
        
        for data in emotion_data:
            emotion = data.emotion
            if emotion not in emotion_counts:
                emotion_counts[emotion] = 0
                emotion_confidence[emotion] = []
            
            emotion_counts[emotion] += 1
            emotion_confidence[emotion].append(data.confidence)
        
        # Calculate average confidence for each emotion
        emotion_stats = {}
        for emotion, count in emotion_counts.items():
            avg_confidence = sum(emotion_confidence[emotion]) / len(emotion_confidence[emotion])
            emotion_stats[emotion] = {
                'count': count,
                'average_confidence': round(avg_confidence, 2),
                'percentage': round((count / len(emotion_data)) * 100, 1) if emotion_data else 0
            }
        
        # Get recent emotions (last 10)
        recent_emotions = []
        for data in emotion_data[:10]:
            recent_emotions.append({
                'emotion': data.emotion,
                'confidence': round(data.confidence, 2),
                'context': data.context,
                'created_at': data.created_at.isoformat(),
                'image_url': data.image.url if data.image else None
            })
        
        # Get daily emotion trends for the last 7 days
        daily_trends = []
        for i in range(7):
            date = timezone.now().date() - timedelta(days=i)
            day_emotions = EmotionData.objects.filter(
                employee=employee,
                created_at__date=date
            )
            
            if day_emotions.exists():
                # Get most common emotion for this day
                day_emotion_counts = {}
                for data in day_emotions:
                    emotion = data.emotion
                    day_emotion_counts[emotion] = day_emotion_counts.get(emotion, 0) + 1
                
                dominant_emotion = max(day_emotion_counts, key=day_emotion_counts.get)
                avg_confidence = sum(data.confidence for data in day_emotions) / len(day_emotions)
                
                daily_trends.append({
                    'date': date.isoformat(),
                    'dominant_emotion': dominant_emotion,
                    'confidence': round(avg_confidence, 2),
                    'total_detections': len(day_emotions)
                })
        
        return Response({
            'success': True,
            'emotion_stats': emotion_stats,
            'recent_emotions': recent_emotions,
            'daily_trends': daily_trends,
            'total_detections': len(emotion_data),
            'date_range': {
                'start': thirty_days_ago.isoformat(),
                'end': timezone.now().isoformat()
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def capture_emotion(request, employee_id):
    """Capture emotion during task updates or other interactions"""
    try:
        employee = get_object_or_404(Employee, id=employee_id)
        
        img_b64 = request.data.get('image')
        context = request.data.get('context', 'task_update')  # login, task_update, break, etc.
        
        if not img_b64:
            return Response({'success': False, 'message': 'image required'}, status=400)
        
        # Decode image
        if ',' in img_b64:
            img_b64 = img_b64.split(',',1)[1]
        img_bytes = base64.b64decode(img_b64)
        
        # Detect emotion
        detected_emotion = "neutral"
        emotion_confidence = 0.0
        
        if EMOTION_DETECTION_AVAILABLE and emotion_detector:
            try:
                import face_recognition
                from PIL import Image
                img = Image.open(io.BytesIO(img_bytes)).convert('RGB')
                img_arr = np.array(img)
                
                # Detect emotions
                emotions = emotion_detector.detect_emotions(img_arr)
                if emotions and len(emotions) > 0:
                    emotion_data = emotions[0]
                    if 'emotions' in emotion_data:
                        emotions_dict = emotion_data['emotions']
                        detected_emotion = max(emotions_dict, key=emotions_dict.get)
                        emotion_confidence = emotions_dict[detected_emotion]
            except Exception as e:
                print(f"Emotion detection error: {e}")
        
        # Save emotion data
        emotion_image_path = None
        if img_bytes:
            emotion_filename = f"emotion_{employee.id}_{context}_{timezone.now().strftime('%Y%m%d_%H%M%S')}.jpg"
            emotion_image_path = default_storage.save(f"emotions/{emotion_filename}", ContentFile(img_bytes))
        
        EmotionData.objects.create(
            employee=employee,
            emotion=detected_emotion,
            confidence=emotion_confidence,
            image=emotion_image_path,
            context=context
        )
        
        return Response({
            'success': True,
            'emotion': detected_emotion,
            'confidence': round(emotion_confidence, 2),
            'context': context,
            'message': f'Emotion captured: {detected_emotion} with {emotion_confidence:.2f} confidence'
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


# New AI-powered endpoints

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def analyze_resume(request):
    """
    Analyze uploaded resume and extract information using AI
    """
    if not RESUME_PROCESSING_AVAILABLE:
        return Response({
            'success': False,
            'message': 'Resume processing libraries not installed. Please install PyMuPDF and python-docx.'
        }, status=500)
    
    try:
        if 'resume' not in request.FILES:
            return Response({'success': False, 'message': 'No resume file uploaded'}, status=400)
        
        resume_file = request.FILES['resume']
        token = request.POST.get('token')
        
        # Validate token
        if not token:
            return Response({'success': False, 'message': 'Invalid token'}, status=400)
        
        # Extract text from resume
        text_content = extract_text_from_resume(resume_file)
        
        # Analyze the extracted text
        analysis = analyze_resume_text(text_content)
        
        return Response({
            'success': True,
            'analysis': analysis
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Resume analysis failed: {str(e)}'
        }, status=500)

def extract_text_from_resume(resume_file):
    """
    Extract text from PDF or Word document
    """
    try:
        file_extension = resume_file.name.split('.')[-1].lower()
        
        if file_extension == 'pdf':
            # Extract text from PDF
            pdf_document = fitz.open(stream=resume_file.read(), filetype="pdf")
            text_content = ""
            for page_num in range(pdf_document.page_count):
                page = pdf_document.load_page(page_num)
                text_content += page.get_text()
            pdf_document.close()
            
        elif file_extension in ['doc', 'docx']:
            # Extract text from Word document
            if file_extension == 'docx':
                doc = docx.Document(io.BytesIO(resume_file.read()))
                text_content = '\n'.join([paragraph.text for paragraph in doc.paragraphs])
            else:
                # For .doc files, you might need to use python-docx2txt or other library
                raise ValueError("DOC files not supported. Please convert to DOCX or PDF.")
        else:
            raise ValueError("Unsupported file format")
        
        return text_content
        
    except Exception as e:
        raise Exception(f"Text extraction failed: {str(e)}")

def analyze_resume_text(text):
    """
    Analyze resume text and extract structured information
    """
    analysis = {
        'personal_info': {},
        'professional_info': {},
        'education': {},
        'contact_info': {},
        'additional_info': {}
    }
    
    # Extract personal information
    analysis['personal_info'] = extract_personal_info(text)
    
    # Extract professional information
    analysis['professional_info'] = extract_professional_info(text)
    
    # Extract education information
    analysis['education'] = extract_education_info(text)
    
    # Extract contact information
    analysis['contact_info'] = extract_contact_info(text)
    
    # Extract additional information
    analysis['additional_info'] = extract_additional_info(text)
    
    return analysis

def extract_personal_info(text):
    """
    Extract personal information from resume text
    """
    personal_info = {}
    
    # Extract name (improved logic)
    lines = text.split('\n')
    for i, line in enumerate(lines[:8]):  # Check first 8 lines
        line = line.strip()
        if line and len(line.split()) >= 2 and len(line.split()) <= 4:
            # Skip lines with emails, phones, or common header words
            if not any(char.isdigit() for char in line) and \
               not re.search(r'\b(email|phone|contact|address|resume|cv)\b', line, re.IGNORECASE) and \
               '@' not in line and \
               not re.search(r'\b\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b', line):
                
                # Look for capitalized name patterns
                words = line.split()
                if len(words) >= 2 and all(word[0].isupper() for word in words if word):
                    personal_info['first_name'] = words[0]
                    personal_info['last_name'] = ' '.join(words[1:])
                    break
    
    # Extract email (improved pattern)
    email_pattern = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b'
    emails = re.findall(email_pattern, text, re.IGNORECASE)
    if emails:
        personal_info['email'] = emails[0]
    
    # Extract phone number (improved patterns)
    phone_patterns = [
        r'\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}',
        r'\b[0-9]{10}\b',
        r'\b[0-9]{3}[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}\b',
        r'Phone[:\s]*([+]?\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4})',
        r'Mobile[:\s]*([+]?\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4})'
    ]
    
    for pattern in phone_patterns:
        phones = re.findall(pattern, text, re.IGNORECASE)
        if phones:
            # Clean up the phone number
            phone = re.sub(r'[^\d+]', '', phones[0])
            if len(phone) >= 10:
                personal_info['phone'] = phone
                break
    
    return personal_info

def extract_professional_info(text):
    """
    Extract professional information from resume text
    """
    professional_info = {}
    
    # Extract experience (improved patterns)
    experience_patterns = [
        r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:work|professional|total)?\s*experience',
        r'experience[:\s]*(\d+)\+?\s*(?:years?|yrs?)',
        r'total\s*experience[:\s]*(\d+)\+?\s*(?:years?|yrs?)',
        r'(\d+)\s*(?:years?|yrs?)\s*(?:of\s*)?(?:work|professional)?\s*experience',
        r'worked\s*for\s*(\d+)\+?\s*(?:years?|yrs?)'
    ]
    
    for pattern in experience_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            years = match.group(1)
            professional_info['experience'] = f"{years} years"
            break
    
    # Extract skills (expanded list with better matching)
    common_skills = [
        # Programming Languages
        'Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'C#', '.NET', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin', 'Scala',
        # Web Technologies
        'React', 'Angular', 'Vue.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', 'Laravel', 'Rails', 'Next.js',
        # Frontend
        'HTML', 'CSS', 'SASS', 'LESS', 'Bootstrap', 'TailwindCSS', 'Material UI', 'jQuery',
        # Databases
        'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Oracle', 'SQLite', 'Cassandra',
        # Cloud & DevOps
        'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitLab CI', 'Terraform', 'Ansible',
        # Tools & Technologies
        'Git', 'GitHub', 'GitLab', 'Jira', 'Confluence', 'Slack', 'Trello', 'Asana',
        # Data Science & ML
        'Machine Learning', 'Data Science', 'TensorFlow', 'PyTorch', 'Keras', 'Scikit-learn', 'Pandas', 'NumPy', 'R',
        # Testing
        'Jest', 'Mocha', 'Selenium', 'Cypress', 'JUnit', 'TestNG', 'RSpec',
        # Other
        'REST API', 'GraphQL', 'Microservices', 'Agile', 'Scrum', 'CI/CD', 'DevOps'
    ]
    
    found_skills = []
    text_lower = text.lower()
    
    # Better skill matching - avoid partial matches
    for skill in common_skills:
        skill_lower = skill.lower()
        # Use word boundaries to avoid partial matches
        if re.search(r'\b' + re.escape(skill_lower) + r'\b', text_lower):
            found_skills.append(skill)
    
    if found_skills:
        professional_info['skills'] = found_skills[:15]  # Increased to top 15 skills
    
    # Extract role/designation (improved patterns)
    role_patterns = [
        r'(?:senior|lead|principal|staff)?\s*(?:software|web|full[-\s]?stack|front[-\s]?end|back[-\s]?end)\s*(?:developer|engineer|architect)',
        r'(?:senior|lead|principal)?\s*(?:project|product|program)\s*manager',
        r'(?:senior|lead|principal)?\s*(?:data\s*)?(?:scientist|analyst|engineer)',
        r'(?:senior|lead|principal)?\s*(?:ui|ux)\s*(?:designer|developer)',
        r'(?:senior|lead|principal)?\s*(?:business)\s*(?:analyst|intelligence)',
        r'(?:senior|lead|principal)?\s*(?:quality\s*)?(?:assurance|qa)\s*(?:engineer|tester|analyst)',
        r'(?:senior|lead|principal)?\s*(?:devops|site\s*reliability)\s*engineer',
        r'(?:senior|lead|principal)?\s*(?:system|network|security)\s*(?:administrator|engineer)',
        r'(?:senior|lead|principal)?\s*(?:mobile)\s*(?:developer|engineer)',
        r'(?:senior|lead|principal)?\s*(?:cloud)\s*(?:architect|engineer)',
        r'(?:senior|lead|principal)?\s*(?:machine\s*learning)\s*(?:engineer|scientist)',
        r'(?:full\s*stack|front\s*end|back\s*end)\s*(?:developer|engineer)',
        r'software\s*(?:developer|engineer|architect)',
        r'web\s*(?:developer|designer)',
        r'mobile\s*(?:developer|engineer)',
        r'data\s*(?:scientist|analyst|engineer)',
        r'product\s*(?:manager|designer)',
        r'project\s*manager'
    ]
    
    for pattern in role_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            role = match.group(0).title()
            # Clean up the role title
            role = re.sub(r'\s+', ' ', role).strip()
            professional_info['role'] = role
            break
    
    # Extract previous company
    company_patterns = [
        r'(?:worked at|previous company|formerly at|ex-)\s*([A-Z][a-zA-Z\s&]+)',
        r'([A-Z][a-zA-Z\s&]+)\s*(?:Inc|Corp|LLC|Ltd|Technologies|Solutions)'
    ]
    
    companies = []
    for pattern in company_patterns:
        matches = re.findall(pattern, text)
        companies.extend(matches)
    
    if companies:
        professional_info['previous_company'] = companies[0].strip()
    
    return professional_info

def extract_education_info(text):
    """
    Extract education information from resume text
    """
    education = {}
    
    # Extract degree (improved patterns)
    degree_patterns = [
        r'(?:Bachelor\s*of\s*(?:Science|Arts|Engineering|Technology|Business|Computer\s*Science)|B\.?S\.?|B\.?A\.?|B\.?Tech|B\.?E\.?)',
        r'(?:Master\s*of\s*(?:Science|Arts|Engineering|Technology|Business|Computer\s*Science|MBA|M\.?S\.?|M\.?A\.?|M\.?Tech|M\.?E\.?)',
        r'(?:Ph\.?D\.?|Doctorate|Doctor\s*of\s*Philosophy)',
        r'(?:Associate\s*of\s*(?:Science|Arts)|A\.?S\.?|A\.?A\.?)',
        r'(?:High\s*School\s*Diploma|GED|Secondary\s*Education)',
        r'(?:B\.Com|M\.Com|B\.Sc|M\.Sc)',
        r'(?:BCA|MCA|BBA|MBA)'
    ]
    
    for pattern in degree_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            degree = match.group(0)
            # Clean up the degree format
            degree = re.sub(r'\s+', ' ', degree).title()
            education['degree'] = degree
            break
    
    # Extract university (improved patterns)
    university_patterns = [
        r'(?:University|College|Institute|School)\s+of\s+([A-Z][a-zA-Z\s&]+)',
        r'([A-Z][a-zA-Z\s&]+(?:University|College|Institute|School|Polytechnic))',
        r'(?:Graduated\s*from|Studied\s*at|Education\s*at)\s+([A-Z][a-zA-Z\s&]+)',
        r'([A-Z][a-zA-Z\s&]+(?:University|College|Institute|School))\s*',
        r'(?:from\s+)?([A-Z][a-zA-Z\s&]+)(?:\s*\(|\s*in|\s*-\s*)(?:\d{4})',
    ]
    
    for pattern in university_patterns:
        matches = re.findall(pattern, text, re.IGNORECASE)
        for match in matches:
            university = match.strip()
            # Filter out common non-university words
            if not re.search(r'\b(the|and|of|in|at|with|for|to|from)\b', university, re.IGNORECASE) and len(university) > 3:
                education['university'] = university.title()
                break
        if 'university' in education:
            break
    
    return education

def extract_contact_info(text):
    """
    Extract contact information from resume text
    """
    contact_info = {}
    
    # Extract LinkedIn
    linkedin_patterns = [
        r'linkedin\.com/in/([\w\-]+)',
        r'linkedin[:\s]+([\w\-]+)'
    ]
    
    for pattern in linkedin_patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            contact_info['linkedin'] = f"https://linkedin.com/in/{match.group(1)}"
            break
    
    # Extract portfolio/website
    website_patterns = [
        r'(?:portfolio|website|github|behance)\s*[:\s]*([^\s]+\.[^\s]+)',
        r'([a-zA-Z0-9.-]+\.(?:com|org|net|io|dev|github\.io))'
    ]
    
    websites = []
    for pattern in website_patterns:
        matches = re.findall(pattern, text)
        websites.extend(matches)
    
    if websites:
        contact_info['portfolio'] = websites[0]
    
    return contact_info

def extract_additional_info(text):
    """
    Extract additional information from resume text
    """
    additional_info = {}
    
    # Extract languages
    languages = [
        'English', 'Spanish', 'French', 'German', 'Chinese', 'Japanese',
        'Korean', 'Hindi', 'Arabic', 'Portuguese', 'Russian', 'Italian',
        'Dutch', 'Swedish', 'Norwegian', 'Danish', 'Finnish', 'Polish'
    ]
    
    found_languages = []
    text_lower = text.lower()
    for language in languages:
        if language.lower() in text_lower:
            found_languages.append(language)
    
    if found_languages:
        additional_info['languages'] = found_languages[:5]  # Limit to top 5 languages
    
    return additional_info

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def generate_encodings(request):
    """
    Generate face encodings from captured images
    """
    if not FACE_RECOGNITION_AVAILABLE:
        return Response({
            'success': False,
            'message': 'Face recognition library not installed. Please install face-recognition and pillow.'
        }, status=500)
    
    try:
        images = []
        image_files = []
        
        # Collect all uploaded images
        for key in request.FILES:
            if key.startswith('image_'):
                image_file = request.FILES[key]
                image_files.append(image_file)
                
                # Load image
                try:
                    image = face_recognition.load_image_file(image_file)
                    images.append(image)
                    print(f"Successfully loaded image: {key}")
                except Exception as e:
                    print(f"Failed to load image {key}: {e}")
                    continue
        
        print(f"Total images loaded: {len(images)}")
        
        if len(images) == 0:
            return Response({
                'success': False,
                'message': 'No valid images found. Please capture photos with your camera.'
            }, status=400)
        
        # Generate encodings from all images
        all_encodings = []
        successful_images = 0
        
        for idx, image in enumerate(images):
            try:
                face_locations = face_recognition.face_locations(image)
                print(f"Image {idx}: Found {len(face_locations)} face(s)")
                
                if len(face_locations) == 0:
                    print(f"No face found in image {idx}")
                    continue  # No face found in this image
                
                face_encodings = face_recognition.face_encodings(image, face_locations)
                
                if len(face_encodings) > 0:
                    # Use the first face found
                    all_encodings.append(face_encodings[0])
                    successful_images += 1
                    print(f"Successfully generated encoding for image {idx}")
            except Exception as e:
                print(f"Error processing image {idx}: {e}")
                continue
        
        if len(all_encodings) == 0:
            return Response({
                'success': False,
                'message': 'No faces detected in the uploaded images. Please ensure your face is clearly visible in the photos.'
            }, status=400)
        
        # Average the encodings to get a more robust representation
        avg_encoding = np.mean(all_encodings, axis=0)
        
        # Store encodings in pickle file
        token = request.POST.get('token')
        if token:
            encodings_filename = f"encodings_{token}.pkl"
            encodings_path = os.path.join(settings.MEDIA_ROOT, 'encodings', encodings_filename)
            
            # Create directory if it doesn't exist
            os.makedirs(os.path.dirname(encodings_path), exist_ok=True)
            
            # Save encodings
            with open(encodings_path, 'wb') as f:
                pickle.dump(avg_encoding, f)
            
            print(f"Encodings saved to: {encodings_path}")
        
        return Response({
            'success': True,
            'message': f'Face encodings generated successfully from {successful_images} image(s)',
            'encodings_count': len(all_encodings),
            'successful_images': successful_images
        })
        
    except Exception as e:
        print(f"Face encoding generation error: {e}")
        return Response({
            'success': False,
            'message': f'Face encoding generation failed: {str(e)}'
        }, status=500)

@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def onboard_employee(request):
    """
    Complete employee onboarding with all data
    """
    try:
        token = request.POST.get('token')
        if not token:
            return Response({'success': False, 'message': 'Invalid token'}, status=400)
        
        # Get invite token
        try:
            invite = get_object_or_404(InviteToken, token=token)
        except:
            return Response({'success': False, 'message': 'Invalid invite token'}, status=400)
        
        # Extract form data
        employee_data = {}
        for key in request.POST:
            if key not in ['token', 'encodings_generated', 'resume_uploaded', 'resume_analysis']:
                employee_data[key] = request.POST.get(key)
        
        # Handle resume analysis if available
        resume_analysis = None
        if 'resume_analysis' in request.POST:
            try:
                resume_analysis = json.loads(request.POST.get('resume_analysis'))
            except:
                resume_analysis = None
        
        # Create employee with all fields
        emp = Employee.objects.create(
            company=invite.company,
            # Personal Information
            first_name=employee_data.get('first_name', '').strip(),
            last_name=employee_data.get('last_name', '').strip(),
            email=employee_data.get('email', '').strip(),
            phone=employee_data.get('phone', '').strip(),
            
            # Professional Information
            designation=employee_data.get('designation', '').strip(),
            role=employee_data.get('role', '').strip(),
            department=employee_data.get('department', '').strip(),
            experience=employee_data.get('experience', '').strip(),
            skills=employee_data.get('skills', '[]'),  # Store as JSON array
            previous_company=employee_data.get('previous_company', '').strip(),
            
            # Additional Information
            date_of_birth=employee_data.get('date_of_birth') or None,
            gender=employee_data.get('gender', '').strip(),
            address=employee_data.get('address', '').strip(),
            emergency_contact=employee_data.get('emergency_contact', '').strip(),
            blood_group=employee_data.get('blood_group', '').strip(),
            marital_status=employee_data.get('marital_status', '').strip(),
            nationality=employee_data.get('nationality', '').strip(),
            languages=employee_data.get('languages', '[]'),  # Store as JSON array
            
            # Education
            education=employee_data.get('education', '').strip(),
            university=employee_data.get('university', '').strip(),
            
            # Contact & Social
            linkedin_profile=employee_data.get('linkedin_profile', '').strip(),
            portfolio=employee_data.get('portfolio', '').strip(),
            
            # Employment Details
            expected_salary=employee_data.get('expected_salary', '').strip(),
            work_mode=employee_data.get('work_mode', '').strip(),
            start_date=employee_data.get('start_date') or None,
            reference=employee_data.get('reference', '').strip(),
        )
        
        # Handle password if provided
        password = request.POST.get('password')
        if password:
            from django.contrib.auth.hashers import make_password
            emp.password = make_password(password)
        
        # Handle photo upload
        if 'photo' in request.FILES:
            emp.photo = request.FILES['photo']
        
        # Handle resume upload
        if 'resume' in request.FILES:
            emp.resume = request.FILES['resume']
        
        # Handle face encodings - create proper encodings.pkl file
        if request.POST.get('encodings_generated') == 'true':
            encodings_filename = f"encodings_{token}.pkl"
            encodings_path = os.path.join(settings.MEDIA_ROOT, 'encodings', encodings_filename)
            
            if os.path.exists(encodings_path):
                # Create employee-specific directory
                employee_dir = os.path.join(settings.MEDIA_ROOT, 'employee_encodings', str(emp.id))
                os.makedirs(employee_dir, exist_ok=True)
                
                # Create the final encodings.pkl file
                final_encodings_path = os.path.join(employee_dir, 'encodings.pkl')
                
                import shutil
                shutil.move(encodings_path, final_encodings_path)
                emp.face_encodings_path = final_encodings_path
                
                # Also save a copy with employee ID for easy lookup
                backup_encodings_path = os.path.join(
                    settings.MEDIA_ROOT, 
                    'employee_encodings', 
                    f"employee_{emp.id}_encodings.pkl"
                )
                shutil.copy2(final_encodings_path, backup_encodings_path)
        
        # Store resume analysis as JSON string
        if resume_analysis:
            import json
            emp.resume_analysis = json.dumps(resume_analysis)
        
        # Save the employee
        emp.save()
        
        # Create a default project for the employee if none exists
        from employees.models import Project
        existing_projects = Project.objects.filter(company=invite.company).count()
        if existing_projects == 0:
            # Create a default project
            default_project = Project.objects.create(
                company=invite.company,
                name="Onboarding Project",
                description="Default project for new employee onboarding",
                status="active",
                start_date=timezone.now().date(),
                deadline=timezone.now().date() + timezone.timedelta(days=90)
            )
            # Add employee to the project
            default_project.employees.add(emp)
        
        return Response({
            'success': True,
            'message': 'Employee onboarded successfully',
            'employee_id': str(emp.id)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'message': f'Onboarding failed: {str(e)}'
        }, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
@csrf_exempt
def employee_register(request):
    """
    Direct employee registration with face verification
    Accepts JSON with employee details and face images
    """
    from django.core.validators import validate_email
    from django.core.exceptions import ValidationError
    from django.contrib.auth.hashers import make_password
    import logging
    
    logger = logging.getLogger(__name__)
    
    try:
        data = request.data
        
        # Validate required fields
        required_fields = ["first_name", "last_name", "email", "password", "face_images"]
        missing_fields = [field for field in required_fields if not data.get(field)]
        
        if missing_fields:
            return Response({
                "success": False,
                "error": "Missing required fields",
                "errors": {field: f"{field.replace('_', ' ').title()} is required" for field in missing_fields}
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate email format
        try:
            validate_email(data["email"])
        except ValidationError:
            return Response({
                "success": False,
                "error": "Invalid email format",
                "errors": {"email": "Please enter a valid email address"}
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate password strength
        password = data["password"]
        if len(password) < 8:
            return Response({
                "success": False,
                "error": "Password too short",
                "errors": {"password": "Password must be at least 8 characters long"}
            }, status=status.HTTP_400_BAD_REQUEST)

        # Check if employee already exists
        if Employee.objects.filter(email=data["email"].lower()).exists():
            return Response({
                "success": False,
                "error": "Employee with this email already exists",
                "errors": {"email": "An employee with this email is already registered"}
            }, status=status.HTTP_400_BAD_REQUEST)

        # Validate face images
        face_images = data.get("face_images", [])
        if not isinstance(face_images, list) or len(face_images) != 3:
            return Response({
                "success": False,
                "error": "Invalid face images",
                "errors": {"face_images": "Exactly 3 face images are required"}
            }, status=status.HTTP_400_BAD_REQUEST)

        # Handle company association - either provided or create default
        from company.models import Company
        company = None
        
        # Check if company_id is provided (for manager-invited registrations)
        if data.get("company_id"):
            try:
                company = Company.objects.get(id=data["company_id"])
            except Company.DoesNotExist:
                return Response({
                    "success": False,
                    "error": "Company not found",
                    "errors": {"company_id": "The specified company does not exist"}
                }, status=status.HTTP_400_BAD_REQUEST)
        else:
            # Create a default company for direct registrations
            company, created = Company.objects.get_or_create(
                email=data["email"].lower().strip(),
                defaults={
                    'name': f"{data['first_name']} {data['last_name']}'s Company",
                    'password': make_password('default123'),  # Should be changed later
                    'industry': 'Technology',
                    'size': '1-10',
                    'website': '',
                    'description': 'Default company for employee registration'
                }
            )
            if created:
                logger.info(f"Created default company for employee: {data['email']}")

        # Create employee with company association
        employee = Employee.objects.create(
            first_name=data["first_name"].strip(),
            last_name=data["last_name"].strip(),
            email=data["email"].lower().strip(),
            password=make_password(password),
            phone=data.get("phone", "").strip(),
            designation=data.get("designation", "").strip(),
            department=data.get("department", "").strip(),
            experience=data.get("experience", "").strip(),
            skills=data.get("skills", "").strip(),
            education=data.get("education", "").strip(),
            university=data.get("university", "").strip(),
            date_of_birth=data.get("date_of_birth") or None,
            gender=data.get("gender", "P"),
            address=data.get("address", "").strip(),
            emergency_contact=data.get("emergency_contact", "").strip(),
            linkedin_profile=data.get("linkedin_profile", "").strip(),
            portfolio=data.get("portfolio", "").strip(),
            company=company,  # Associate with company
            is_active=True
        )

        # Process face images and create encodings
        if FACE_RECOGNITION_AVAILABLE and len(face_images) == 3:
            try:
                face_encodings = []
                
                for i, image_data in enumerate(face_images):
                    # Decode base64 image
                    image_data = image_data.split(',')[1] if ',' in image_data else image_data
                    image_bytes = base64.b64decode(image_data)
                    
                    # Save face photo
                    face_filename = f"employee_{employee.id}_face_{i+1}.jpg"
                    face_path = os.path.join(settings.MEDIA_ROOT, 'faces', face_filename)
                    
                    # Ensure directory exists
                    os.makedirs(os.path.dirname(face_path), exist_ok=True)
                    
                    with open(face_path, 'wb') as f:
                        f.write(image_bytes)
                    
                    # Load image and find face encodings
                    image = face_recognition.load_image_file(face_path)
                    encodings = face_recognition.face_encodings(image)
                    
                    if encodings:
                        face_encodings.append(encodings[0])
                    else:
                        # Clean up created employee if no face found
                        employee.delete()
                        return Response({
                            "success": False,
                            "error": f"No face detected in image {i+1}",
                            "errors": {"face_images": f"No face detected in image {i+1}"}
                        }, status=status.HTTP_400_BAD_REQUEST)

                # Save face encodings
                if len(face_encodings) == 3:
                    encodings_filename = f"employee_{employee.id}_encodings.pkl"
                    encodings_path = os.path.join(settings.MEDIA_ROOT, 'faces', encodings_filename)
                    
                    with open(encodings_path, 'wb') as f:
                        pickle.dump(face_encodings, f)
                    
                    # Update employee with face photo path
                    employee.face_photo = f"faces/{face_filename}"
                    employee.save()
                    
                    logger.info(f"Face encodings saved for employee: {employee.email}")
                else:
                    # Clean up created employee if not all faces processed
                    employee.delete()
                    return Response({
                        "success": False,
                        "error": "Could not process all face images",
                        "errors": {"face_images": "Failed to process all face images"}
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            except Exception as e:
                # Clean up created employee on error
                employee.delete()
                logger.error(f"Face processing error for employee registration: {e}")
                return Response({
                    "success": False,
                    "error": "Face processing failed",
                    "message": "An error occurred while processing face images"
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        else:
            # Clean up created employee if face recognition not available
            employee.delete()
            return Response({
                "success": False,
                "error": "Face recognition not available",
                "message": "Face recognition service is not available"
            }, status=status.HTTP_503_SERVICE_UNAVAILABLE)

        # Generate authentication token
        token = f"employee_{employee.id}_{employee.email}"
        
        logger.info(f"Employee registration successful: {employee.email}")
        
        return Response({
            "success": True,
            "token": token,
            "employee_id": str(employee.id),
            "employee_name": f"{employee.first_name} {employee.last_name}",
            "employee_designation": employee.designation,
            "employee_email": employee.email,
            "company_id": str(company.id),
            "company_name": company.name,
            "message": "Registration successful"
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        logger.error(f"Employee registration error: {e}")
        return Response({
            "success": False,
            "error": "Registration failed",
            "message": "An error occurred during registration. Please try again."
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([AllowAny])
def get_company_employees(request, company_id):
    """
    Get all employees for a company with their details and assigned tasks.
    """
    try:
        from company.models import Company
        from tasks.models import Task

        # Authorize: accept Django-authenticated manager OR Bearer tokens like 'company_<id>_...' or 'manager_<id>_...'
        company = None
        if hasattr(request, 'user') and getattr(request.user, 'is_authenticated', False):
            try:
                company = request.user.manager.company
            except Exception:
                company = None

        if not company:
            auth = request.headers.get('Authorization') or request.META.get('HTTP_AUTHORIZATION')
            if auth and auth.startswith('Bearer '):
                token = auth.split(' ', 1)[1]
                if token.startswith('company_'):
                    rest = token.split('company_', 1)[1]
                    parts = rest.split('_', 1)
                    try:
                        cid = int(parts[0])
                        company = Company.objects.filter(id=cid).first()
                    except Exception:
                        company = None
                elif token.startswith('manager_'):
                    rest = token.split('manager_', 1)[1]
                    parts = rest.split('_', 1)
                    try:
                        mid = int(parts[0])
                        from managers.models import Manager as ManagerModel
                        mgr = ManagerModel.objects.filter(id=mid).first()
                        if mgr:
                            company = mgr.company
                    except Exception:
                        company = None

        # final check: ensure requested company exists and matches
        company_obj = Company.objects.filter(id=company_id).first()
        if not company_obj:
            return Response({'success': False, 'error': 'Company not found'}, status=status.HTTP_404_NOT_FOUND)

        # ensure requester is allowed to view this company's employees
        if not company or (company and company.id != company_obj.id):
            return Response({'detail':'Authentication required to access company employees.'}, status=403)

        company = company_obj
        employees = Employee.objects.filter(company=company)
        
        employees_data = []
        for emp in employees:
            # Parse skills from JSON if available
            skills = []
            if emp.skills:
                try:
                    skills = json.loads(emp.skills) if isinstance(emp.skills, str) else emp.skills
                except:
                    skills = [emp.skills] if emp.skills else []
            
            # Get assigned tasks
            tasks = Task.objects.filter(assigned_to=emp)
            tasks_data = [{
                'id': str(task.id),
                'title': task.title,
                'status': task.status,
                'priority': task.priority,
                'due_date': str(task.due_date) if task.due_date else None
            } for task in tasks]
            
            employees_data.append({
                'id': str(emp.id),
                'first_name': emp.first_name,
                'last_name': emp.last_name,
                'email': emp.email,
                'phone': emp.phone,
                'designation': emp.designation,
                'role': emp.role,
                'department': emp.department,
                'experience': emp.experience,
                'skills': skills,
                'tasks': tasks_data,
                'tasks_count': len(tasks_data),
                'work_mode': emp.work_mode,
                'start_date': str(emp.start_date) if emp.start_date else None
            })
        
        return Response({
            'success': True,
            'company_id': company_id,
            'employees': employees_data,
            'total_count': len(employees_data)
        })
    
    except Exception as e:
        logger.error(f"Error fetching company employees: {e}")
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)