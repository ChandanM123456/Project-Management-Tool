import os
import sys
sys.path.append('c:\\Users\\DELL\\Desktop\\PM Tool Project\\backend')

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
import django
django.setup()

import pickle
import base64
from employees.views import MockFaceRecognition
from django.conf import settings

# Create a test encoding directory structure
media_root = getattr(settings, 'MEDIA_ROOT', 'media')
employee_encodings_dir = os.path.join(media_root, 'employee_encodings')
os.makedirs(employee_encodings_dir, exist_ok=True)

# Create a test employee directory and encoding file
test_employee_id = 'test_emp_123'
employee_dir = os.path.join(employee_encodings_dir, test_employee_id)
os.makedirs(employee_dir, exist_ok=True)

# Generate mock encodings
mock_fr = MockFaceRecognition()
test_encodings = [mock_fr.face_encodings(None)[0] for _ in range(3)]

# Save encodings to pickle file
encodings_path = os.path.join(employee_dir, 'encodings.pkl')
with open(encodings_path, 'wb') as f:
    pickle.dump(test_encodings, f)

print(f"Created test encodings at: {encodings_path}")
print(f"Number of encodings saved: {len(test_encodings)}")

# Test loading encodings
with open(encodings_path, 'rb') as f:
    loaded_encodings = pickle.load(f)
    print(f"Successfully loaded {len(loaded_encodings)} encodings")

# Test face comparison
test_encoding = mock_fr.face_encodings(None)[0]
result = mock_fr.compare_faces(loaded_encodings, test_encoding)
print(f"Face comparison result: {result[0]}")

print("\nFace verification system is ready!")
