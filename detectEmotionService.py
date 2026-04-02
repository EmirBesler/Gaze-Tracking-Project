from fastapi import FastAPI, UploadFile
import cv2
import numpy as np
import mediapipe as mp
import math
import joblib
import os
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MEDIAPIPE AYARLARI ---
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True, static_image_mode=True, max_num_faces=1)

# --- MODELLERİ YÜKLE ---
model = None
scaler = None
label_encoder = None

try:
    if os.path.exists('emotion_model.pkl'):
        model = joblib.load('emotion_model.pkl')
        scaler = joblib.load('emotion_scaler.pkl')
        label_encoder = joblib.load('emotion_label_encoder.pkl')
        print("✅ Duygu Modeli Yüklendi!")
    else:
        print("⚠️ Model dosyaları bulunamadı! (Önce train_emotion.py çalıştır)")
except Exception as e:
    print(f"⚠️ Model Yükleme Hatası: {e}")

# --- MATEMATİK FONKSİYONLARI (Aynısı) ---
def euclidean_distance(point1, point2):
    x1, y1 = point1.ravel()
    x2, y2 = point2.ravel()
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

def get_aspect_ratio(points, w, h):
    p = []
    for lm in points:
        p.append(np.array([lm.x * w, lm.y * h]))
    v1 = euclidean_distance(p[1], p[5])
    v2 = euclidean_distance(p[2], p[4])
    hor = euclidean_distance(p[0], p[3])
    if hor == 0: return 0.0
    return (v1 + v2) / (2.0 * hor)

def get_normalized_distance(p1, p2, face_width, w, h):
    pt1 = np.array([p1.x * w, p1.y * h])
    pt2 = np.array([p2.x * w, p2.y * h])
    dist = euclidean_distance(pt1, pt2)
    if face_width == 0: return 0
    return dist / face_width

def extract_emotion_features(frame):
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = face_mesh.process(rgb)

    if not result.multi_face_landmarks: return None
    mesh = result.multi_face_landmarks[0].landmark

    left_cheek = np.array([mesh[234].x * w, mesh[234].y * h])
    right_cheek = np.array([mesh[454].x * w, mesh[454].y * h])
    face_width = euclidean_distance(left_cheek, right_cheek)

    mouth_points = [mesh[61], mesh[37], mesh[267], mesh[291], mesh[314], mesh[84]]
    mar = get_aspect_ratio(mouth_points, w, h)

    mouth_corner_dist = euclidean_distance(
        np.array([mesh[61].x * w, mesh[61].y * h]), 
        np.array([mesh[291].x * w, mesh[291].y * h])
    )
    mouth_width_norm = mouth_corner_dist / face_width if face_width > 0 else 0

    left_brow_dist = get_normalized_distance(mesh[66], mesh[159], face_width, w, h)
    right_brow_dist = get_normalized_distance(mesh[296], mesh[386], face_width, w, h)
    avg_brow_dist = (left_brow_dist + right_brow_dist) / 2.0

    l_ear_points = [mesh[33], mesh[160], mesh[158], mesh[133], mesh[153], mesh[144]]
    r_ear_points = [mesh[362], mesh[385], mesh[387], mesh[263], mesh[373], mesh[380]]
    ear = (get_aspect_ratio(l_ear_points, w, h) + get_aspect_ratio(r_ear_points, w, h)) / 2.0

    # DİKKAT: Sıralama train ederkenki ile AYNI olmalı
    return np.array([[mar, mouth_width_norm, avg_brow_dist, ear]])

# --- YENİ ENDPOINT: TAHMİN ET ---
@app.post("/predict-emotion")
async def predict_emotion_live(file: UploadFile):
    global model, scaler, label_encoder

    if model is None: return {"error": "Model Not Loaded", "emotion": "UNKNOWN"}

    image_bytes = await file.read()
    np_img = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    
    features = extract_emotion_features(frame)
    if features is None: return {"error": "No Face", "emotion": "UNKNOWN"}
    
    try:
        # Ölçekle ve Tahmin Et
        features_scaled = scaler.transform(features)
        prediction_index = model.predict(features_scaled)[0]
        emotion_name = label_encoder.inverse_transform([prediction_index])[0]
        
        return {
            "status": "success",
            "emotion": emotion_name
        }
    except Exception as e:
        print(f"Prediction Error: {e}")
        return {"error": str(e), "emotion": "ERROR"}

# Çalıştırma: uvicorn detectEmotionService:app --port 8001 --reload