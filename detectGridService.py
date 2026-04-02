import pandas as pd
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, accuracy_score
import joblib

# 1. VERİTABANI BAĞLANTISI
db_user = "root"
db_password = "12345" # Şifreni kontrol et
db_host = "localhost"
db_name = "gazetrack"

print("Veritabanına bağlanılıyor...")
connection_str = f'mysql+pymysql://{db_user}:{db_password}@{db_host}/{db_name}'
db_connection = create_engine(connection_str)

df = pd.read_sql("SELECT * FROM gaze_data", db_connection)
print(f"Toplam {len(df)} veri çekildi.")

# 2. FEATURE SELECTION (ÖZELLİK SEÇİMİ) - BURASI DEĞİŞTİ! 🛠️
# Artık "pupil - center" diye bir çıkarma işlemi yapmıyoruz.
# Çünkü veritabanındaki 'left_pupil_x' artık koordinat değil, direkt ORAN (0.45 gibi).

# Modelin kullanacağı sütunlar:
# Sol ve Sağ göz oranları (0.0 - 1.0 arası) + Burun Konumu (Kafa hareketi için)
feature_columns = [
    'left_pupil_x', 'left_pupil_y', 
    'right_pupil_x', 'right_pupil_y', 
    'nose_x', 'nose_y'
]

X = df[feature_columns]
y = df['target_grid']

# Sütun isimlerini daha anlaşılır yapalım (Opsiyonel ama iyi olur)
X.columns = ['lx_ratio', 'ly_ratio', 'rx_ratio', 'ry_ratio', 'nose_x', 'nose_y']

# 3. ÖLÇEKLEME (SCALING)
# Burun (1920 piksel) ile Oran (0.5) arasında uçurum olduğu için Scaler ŞART.
print("Veriler ölçekleniyor...")
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

joblib.dump(scaler, 'gaze_scaler.pkl') 

# 4. EĞİTİM (Random Forest genelde Ratio yönteminde daha stabil çalışır, ama SVM de olur)
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)

print("Model eğitiliyor...")
# SVM deniyoruz (Eğer sonuç düşük gelirse RandomForestClassifier kullanabilirsin)
model = SVC(kernel='rbf', C=10.0, gamma='scale', probability=True, class_weight='balanced')

model.fit(X_train, y_train)

# 5. TEST
y_pred = model.predict(X_test)
accuracy = accuracy_score(y_test, y_pred)

print("-" * 30)
print(f" YENİ MODEL BAŞARISI (Ratio): %{accuracy * 100:.2f}")
print("-" * 30)
print(classification_report(y_test, y_pred))

joblib.dump(model, 'gaze_tracker_svm.pkl')
print("Yeni model kaydedildi.")