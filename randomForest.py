import pandas as pd
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import seaborn as sns
import matplotlib.pyplot as plt

# 1. VERİ ÇEKME
db_user = "root"
db_password = "12345" 
db_host = "localhost"
db_name = "gazetrack"

print(" Veritabanına bağlanılıyor...")
connection_str = f'mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}'
db_connection = create_engine(connection_str)
df = pd.read_sql("SELECT * FROM gaze_data", db_connection)
print(f" Toplam Veri: {len(df)}")

# 2. ÖZELLİK SEÇİMİ (YENİ SİSTEM
# Artık sadece gözler değil, kafa duruşu ve göz açıklığı da var.
# Veritabanındaki yeni sütun isimleriyle birebir aynı olmalı.
feature_columns = [
    'left_pupil_x', 'left_pupil_y', 
    'right_pupil_x', 'right_pupil_y', 
    'head_yaw', 'head_pitch', 'head_roll', # Kafa Hareketleri
    'left_ear', 'right_ear'                # Göz Kapağı Açıklığı (Aşağı bakış için kritik)
]

X = df[feature_columns]
y = df['target_grid']

# 3. ÖLÇEKLEME (SCALING)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
joblib.dump(scaler, 'gaze_scaler.pkl') # Scaler'ı kaydet (API bunu kullanacak)
print(" Veriler ölçeklendi ve Scaler kaydedildi.")

# Eğitim/Test Ayrımı (%20 Test, %80 Eğitim)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

# --- MODELLERİN TANIMLANMASI ---
print("\n MODEL SAVAŞI BAŞLIYOR (YENİ ÖZELLİKLERLE) ")
print("-" * 50)

models = {
    "SVM": SVC(probability=True, kernel='rbf', C=10), # SVM ayarları biraz güçlendirildi
    "Random Forest": RandomForestClassifier(n_estimators=200, max_depth=20, random_state=42),
    "Gradient Boosting": GradientBoostingClassifier(n_estimators=100, learning_rate=0.1, max_depth=5, random_state=42),
    "KNN": KNeighborsClassifier(n_neighbors=5)
}

best_model = None
best_accuracy = 0.0
best_name = ""

for name, model in models.items():
    print(f" {name} eğitiliyor...")
    model.fit(X_train, y_train)
    
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    
    print(f" {name} Başarısı: %{acc * 100:.2f}")
    
    if acc > best_accuracy:
        best_accuracy = acc
        best_model = model
        best_name = name

print("-" * 50)
print(f" KAZANAN MODEL: {best_name} (Başarı: %{best_accuracy * 100:.2f})")
print("-" * 50)


final_preds = best_model.predict(X_test)
print(classification_report(y_test, final_preds))


plt.figure(figsize=(10, 8))
cm = confusion_matrix(y_test, final_preds)
sns.heatmap(cm, annot=True, fmt='d', cmap='Blues')
plt.title(f"Hata Analizi - {best_name} \n(Yeni Özellikler: Head Pose + EAR)")
plt.xlabel("Modelin Tahmini")
plt.ylabel("Gerçek Hedef")
plt.show()


save_name = 'gaze_tracker_rf.pkl' 

joblib.dump(best_model, save_name)
print(f" Kazanan model '{save_name}' olarak kaydedildi.")
print(" Python servisini (detectIrısService.py) yeniden başlatmayı unutma!")