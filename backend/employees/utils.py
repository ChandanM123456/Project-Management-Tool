import os
import pickle
import numpy as np
import face_recognition
from django.conf import settings

def _list_face_paths(emp_id):
    folder = os.path.join(settings.MEDIA_ROOT, 'faces', str(emp_id))
    if not os.path.exists(folder):
        return []
    files = [os.path.join(folder, f) for f in os.listdir(folder) if f.lower().endswith(('jpg','jpeg','png'))]
    return files

def update_encodings_for_employee(emp_id):
    """
    Compute encoding(s) from files and update encoding.pkl
    """
    enc_path = os.path.join(settings.BASE_DIR, 'encoding.pkl')
    face_files = _list_face_paths(emp_id)
    encs = []
    for p in face_files:
        img = face_recognition.load_image_file(p)
        e = face_recognition.face_encodings(img)
        if e:
            encs.append(e[0])
    if not encs:
        raise ValueError("No valid face encodings for employee")

    # average encoding
    avg = np.mean(encs, axis=0).tolist()

    # load existing db mapping
    mapping = {}
    if os.path.exists(enc_path):
        with open(enc_path,'rb') as f:
            mapping = pickle.load(f)

    mapping[str(emp_id)] = avg
    with open(enc_path,'wb') as f:
        pickle.dump(mapping, f)
    return True
