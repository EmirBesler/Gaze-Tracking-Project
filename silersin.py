import pandas as pd
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, confusion_matrix
import joblib
import matplotlib.pyplot as plt
import seaborn as sns

# 1. VERİ ÇEKME
print("📡 Veriler çekiliyor...")
db_connection = create_engine('mysql+pymysql://root:12345@localhost/gazetrack')
df = pd.read_sql("SELECT * FROM gaze_data", db_connection)

feature_columns = [
    'left_pupil_x', 'left_pupil_y', 
    'right_pupil_x', 'right_pupil_y', 
    'head_yaw', 'head_pitch', 'head_roll', 
    'left_ear', 'right_ear'
]

X = df[feature_columns]
y = df['target_grid']

# 2. ÖLÇEKLEME
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42, stratify=y)

print(f" {len(df)} veri üzerinde 'Grid Search' (İnce Ayar) başlatılıyor...")

# --- SVM TUNING ---
print(" SVM Modifiye Ediliyor...")
svm_params = {
    'C': [1, 10, 50, 100],
    'gamma': [0.1, 0.01, 0.001],
    'kernel': ['rbf']
}
svm_grid = GridSearchCV(SVC(probability=True), svm_params, cv=5, n_jobs=-1, verbose=1)
svm_grid.fit(X_train, y_train)
svm_acc = accuracy_score(y_test, svm_grid.predict(X_test))
print(f" En İyi SVM: %{svm_acc*100:.2f} (Ayarlar: {svm_grid.best_params_})")

# --- RANDOM FOREST TUNING ---
print("🔧 Random Forest Modifiye Ediliyor...")
rf_params = {
    'n_estimators': [100, 200, 300],
    'max_depth': [None, 10, 20],
    'min_samples_split': [2, 5]
}
rf_grid = GridSearchCV(RandomForestClassifier(random_state=42), rf_params, cv=5, n_jobs=-1, verbose=1)
rf_grid.fit(X_train, y_train)
rf_acc = accuracy_score(y_test, rf_grid.predict(X_test))
print(f" En İyi Random Forest: %{rf_acc*100:.2f}")

# --- KAZANANI KAYDET ---
if svm_acc > rf_acc:
    winner = svm_grid.best_estimator_
    print(f" ŞAMPİYON: SVM (%{svm_acc*100:.2f})")
else:
    winner = rf_grid.best_estimator_
    print(f" ŞAMPİYON: Random Forest (%{rf_acc*100:.2f})")

joblib.dump(winner, 'gaze_tracker_rf.pkl')
joblib.dump(scaler, 'gaze_scaler.pkl')
print(" Model güncellendi!")

# --- NEREDE HATA YAPIYOR? (GÖRSEL) ---
plt.figure(figsize=(8, 6))
sns.heatmap(confusion_matrix(y_test, winner.predict(X_test)), annot=True, fmt='d', cmap='Greens')
plt.title("Hata Haritası (Koyu Yeşiller Doğru)")
plt.xlabel("Tahmin")
plt.ylabel("Gerçek")
plt.show()