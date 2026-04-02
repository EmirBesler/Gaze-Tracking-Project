from fastapi import FastAPI, UploadFile
import cv2
import numpy as np
import mediapipe as mp
import joblib 
import pandas as pd 
from fastapi.middleware.cors import CORSMiddleware
import math
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- GLOBAL DEĞİŞKENLER (Hata Buradaydı, Düzeltildi) ---
CENTER_OFFSET = None
model = None
scaler = None  # <-- Artık tanımlı, hata vermez.

# --- MODEL VE SCALER YÜKLEME ---
try:
    if os.path.exists('gaze_tracker_rf.pkl'):
        model = joblib.load('gaze_tracker_rf.pkl') 
        print("✅ Model (RF) Yüklendi!")
    else:
        print("⚠️ Model dosyası bulunamadı! (Önce eğitim yapmalısın)")

    if os.path.exists('gaze_scaler.pkl'):
        scaler = joblib.load('gaze_scaler.pkl')
        print("✅ Scaler Yüklendi!")
    else:
        print("⚠️ Scaler dosyası bulunamadı! (Önce eğitim yapmalısın)")
        
except Exception as e:
    print(f"⚠️ Dosya Yükleme Hatası: {e}")

mp_face_mesh = mp.solutions.face_mesh
face_mesh = mp_face_mesh.FaceMesh(refine_landmarks=True, static_image_mode=True, max_num_faces=1)

# --- 3D NOKTALAR ---
face_3d = np.array([
    [0.0, 0.0, 0.0], [0.0, -330.0, -65.0], [-225.0, 170.0, -135.0],
    [225.0, 170.0, -135.0], [-150.0, -150.0, -125.0], [150.0, -150.0, -125.0]
], dtype=np.float64)

# --- MATEMATİK FONKSİYONLARI ---
def euclidean_distance(point1, point2):
    x1, y1 = point1.ravel()
    x2, y2 = point2.ravel()
    return math.sqrt((x2 - x1)**2 + (y2 - y1)**2)

def get_eye_aspect_ratio(eye_points, w, h):
    p = []
    for lm in eye_points:
        p.append(np.array([lm.x * w, lm.y * h]))
    v1 = euclidean_distance(p[0], p[2]) 
    v2 = euclidean_distance(p[1], p[3]) 
    hor = euclidean_distance(p[4], p[5]) 
    if hor == 0: return 0.0
    return (v1 + v2) / (2.0 * hor)

def get_iris_ratio(iris, inner, outer, w, h):
    pi = np.array([iris.x * w, iris.y * h])
    p_in = np.array([inner.x * w, inner.y * h])
    p_out = np.array([outer.x * w, outer.y * h])
    dist_total = euclidean_distance(p_in, p_out)
    dist_iris = euclidean_distance(pi, p_in) 
    if dist_total == 0: return 0.5
    return dist_iris / dist_total

def normalize_angle(angle):
    while angle > 180: angle -= 360
    while angle < -180: angle += 360
    return angle

def get_head_pose(mesh, w, h):
    face_2d = []
    points_idx = [1, 199, 33, 263, 61, 291] 
    for idx in points_idx:
        lm = mesh[idx]
        face_2d.append([lm.x * w, lm.y * h])
    
    face_2d = np.array(face_2d, dtype=np.float64)
    focal_length = 1 * w
    cam_matrix = np.array([[focal_length, 0, h/2], [0, focal_length, w/2], [0, 0, 1]])
    dist_matrix = np.zeros((4, 1), dtype=np.float64)

    success, rot_vec, trans_vec = cv2.solvePnP(face_3d, face_2d, cam_matrix, dist_matrix)
    rmat, jac = cv2.Rodrigues(rot_vec)
    proj_matrix = np.hstack((rmat, trans_vec))
    euler_angles = cv2.decomposeProjectionMatrix(proj_matrix)[6]
    return euler_angles[0][0], euler_angles[1][0], euler_angles[2][0]

def analyze_face_features(frame):
    h, w, _ = frame.shape
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    result = face_mesh.process(rgb)

    if not result.multi_face_landmarks: return None
    mesh = result.multi_face_landmarks[0].landmark

    pitch, yaw, roll = get_head_pose(mesh, w, h)
    l_ear = get_eye_aspect_ratio([mesh[160], mesh[158], mesh[144], mesh[153], mesh[33], mesh[133]], w, h)
    r_ear = get_eye_aspect_ratio([mesh[385], mesh[387], mesh[373], mesh[380], mesh[362], mesh[263]], w, h)
    lx_ratio = get_iris_ratio(mesh[468], mesh[33], mesh[133], w, h)
    rx_ratio = get_iris_ratio(mesh[473], mesh[362], mesh[263], w, h)
    ly_ratio = (mesh[468].y - mesh[159].y) * h 
    ry_ratio = (mesh[473].y - mesh[386].y) * h

    return {
        "lx": lx_ratio, "ly": ly_ratio,
        "rx": rx_ratio, "ry": ry_ratio,
        "yaw": yaw, "pitch": pitch, "roll": roll,
        "l_ear": l_ear, "r_ear": r_ear
    }

# --- ENDPOINTLER ---

@app.post("/calibrate")
async def calibrate_now(file: UploadFile):
    global CENTER_OFFSET
    image_bytes = await file.read()
    np_img = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    
    raw = analyze_face_features(frame)
    if raw is None: return {"status": "fail"}
    
    CENTER_OFFSET = raw
    print("✅ Kalibrasyon Alındı!")
    return {"status": "success"}

@app.post("/detect")
async def detect_delta(file: UploadFile):
    if CENTER_OFFSET is None: return {"error": "Not Calibrated", "leftPupil_x": 0.0}

    image_bytes = await file.read()
    np_img = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    
    curr = analyze_face_features(frame)
    if curr is None: return {"error": "No Face", "leftPupil_x": 0.0}

    d_yaw = normalize_angle(curr["yaw"] - CENTER_OFFSET["yaw"])
    d_pitch = normalize_angle(curr["pitch"] - CENTER_OFFSET["pitch"])
    d_roll = normalize_angle(curr["roll"] - CENTER_OFFSET["roll"])

    return {
        "leftPupil_x": curr["lx"] - CENTER_OFFSET["lx"], 
        "leftPupil_y": curr["ly"] - CENTER_OFFSET["ly"],
        "rightPupil_x": curr["rx"] - CENTER_OFFSET["rx"], 
        "rightPupil_y": curr["ry"] - CENTER_OFFSET["ry"],
        "head_yaw": d_yaw, "head_pitch": d_pitch, "head_roll": d_roll,
        "left_ear": curr["l_ear"] - CENTER_OFFSET["l_ear"],
        "right_ear": curr["r_ear"] - CENTER_OFFSET["r_ear"]
    }

@app.post("/predict")
async def predict_live(file: UploadFile):
    global model, scaler, CENTER_OFFSET
    
    # 1. Kontroller (Buradaki hata UI'a yansıyor)
    if CENTER_OFFSET is None: return {"error": "Not Calibrated", "grid": 0}
    if model is None or scaler is None: return {"error": "Model Not Loaded", "grid": 0}

    image_bytes = await file.read()
    np_img = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_img, cv2.IMREAD_COLOR)
    
    curr = analyze_face_features(frame)
    if curr is None: return {"error": "No Face", "grid": 0}

    d_yaw = normalize_angle(curr["yaw"] - CENTER_OFFSET["yaw"])
    d_pitch = normalize_angle(curr["pitch"] - CENTER_OFFSET["pitch"])
    d_roll = normalize_angle(curr["roll"] - CENTER_OFFSET["roll"])
    
    features = np.array([[
        curr["lx"] - CENTER_OFFSET["lx"], 
        curr["ly"] - CENTER_OFFSET["ly"],
        curr["rx"] - CENTER_OFFSET["rx"], 
        curr["ry"] - CENTER_OFFSET["ry"],
        d_yaw, d_pitch, d_roll,
        curr["l_ear"] - CENTER_OFFSET["l_ear"],
        curr["r_ear"] - CENTER_OFFSET["r_ear"]
    ]])

    try:
        features_scaled = scaler.transform(features)
        prediction = model.predict(features_scaled)
        
        confidence = 0
        if hasattr(model, "predict_proba"):
            probs = model.predict_proba(features_scaled)
            confidence = np.max(probs) * 100

        return {
            "status": "success",
            "grid": int(prediction[0]),
            "confidence": f"{confidence:.2f}"
        }
    except Exception as e:
        print(f"Prediction Error: {e}")
        return {"error": str(e), "grid": 0}
    

#uvicorn detectIrısService:app --reload