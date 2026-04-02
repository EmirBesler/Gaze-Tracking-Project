import cv2
import joblib
import numpy as np
import mediapipe as mp
import math
import sys
import os

# --- AYARLAR ---
MODEL_PATH = 'emotion_model.pkl'
SCALER_PATH = 'emotion_scaler.pkl'
ENCODER_PATH = 'emotion_label_encoder.pkl'

# --- MEDIAPIPE KURULUMU ---
mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(
    static_image_mode=True, 
    max_num_faces=1, 
    refine_landmarks=True
)

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

# --- ÖZELLİK ÇIKARMA (Extract Features) ---
def extract_features(image_path):
    frame = cv2.imread(image_path)
    if frame is None:
        print(f" HATA: Resim okunamadı! Yolunu kontrol et: {image_path}")
        return None

    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = face_mesh.process(rgb)

    if not result.multi_face_landmarks:
        print(" HATA: Resimde yüz bulunamadı!")
        return None

    mesh = result.multi_face_landmarks[0].landmark

    # 1. YÜZ GENİŞLİĞİ (Referans)
    left_cheek = np.array([mesh[234].x * w, mesh[234].y * h])
    right_cheek = np.array([mesh[454].x * w, mesh[454].y * h])
    face_width = euclidean_distance(left_cheek, right_cheek)

    # 2. MAR (Mouth Aspect Ratio)
    mouth_points = [mesh[61], mesh[37], mesh[267], mesh[291], mesh[314], mesh[84]]
    mar = get_aspect_ratio(mouth_points, w, h)

    # 3. MOUTH WIDTH (Dudak Genişliği)
    mouth_corner_dist = euclidean_distance(
        np.array([mesh[61].x * w, mesh[61].y * h]), 
        np.array([mesh[291].x * w, mesh[291].y * h])
    )
    mouth_width_norm = mouth_corner_dist / face_width if face_width > 0 else 0

    # 4. BROW-EYE DISTANCE (Kaş-Göz)
    left_brow_dist = get_normalized_distance(mesh[66], mesh[159], face_width, w, h)
    right_brow_dist = get_normalized_distance(mesh[296], mesh[386], face_width, w, h)
    avg_brow_dist = (left_brow_dist + right_brow_dist) / 2.0

    # 5. EAR (Göz Açıklığı)
    l_ear_points = [mesh[33], mesh[160], mesh[158], mesh[133], mesh[153], mesh[144]]
    r_ear_points = [mesh[362], mesh[385], mesh[387], mesh[263], mesh[373], mesh[380]]
    ear = (get_aspect_ratio(l_ear_points, w, h) + get_aspect_ratio(r_ear_points, w, h)) / 2.0

    # Önemli: Eğitimdeki sırayla aynı olmalı!
    # ['mar', 'mouth_width', 'brow_distance', 'ear']
    return np.array([[mar, mouth_width_norm, avg_brow_dist, ear]])

# --- ANA PROGRAM ---
def predict_emotion(image_path):
    print("-" * 40)
    print(f"📸 Resim Analiz Ediliyor: {image_path}")
    
    # 1. Modelleri Yükle
    if not (os.path.exists(MODEL_PATH) and os.path.exists(SCALER_PATH) and os.path.exists(ENCODER_PATH)):
        print(" HATA: Model dosyaları (.pkl) bulunamadı! Önce 'train_emotion.py' çalıştır.")
        return

    model = joblib.load(MODEL_PATH)
    scaler = joblib.load(SCALER_PATH)
    le = joblib.load(ENCODER_PATH)

    # 2. Özellikleri Çıkar
    features = extract_features(image_path)
    if features is None: return

    # 3. Ölçekle (Scaling)
    features_scaled = scaler.transform(features)

    # 4. Tahmin Et
    prediction_index = model.predict(features_scaled)[0]
    probabilities = model.predict_proba(features_scaled)[0]
    
    emotion_name = le.inverse_transform([prediction_index])[0]
    confidence = np.max(probabilities) * 100

    # 5. Sonucu Yaz
    print("-" * 40)
    print(f" TAHMİN:  {emotion_name}")
    print(f" GÜVEN:   %{confidence:.2f}")
    print("-" * 40)
    
    # Detaylı Olasılıklar
    print("Olasılık Dağılımı:")
    for i, class_name in enumerate(le.classes_):
        print(f" - {class_name}: %{probabilities[i]*100:.2f}")

if __name__ == "__main__":
    # Kullanım: python test_single_photo.py deneme.jpg
    if len(sys.argv) > 1:
        image_path = sys.argv[1]
    else:
        # Eğer terminalden argüman vermezsen buraya dosya yolunu elle yazabilirsin
        image_path = "image_a87342.png" # <--- Buraya test etmek istediğin resmin adını yaz
    
    predict_emotion(image_path)