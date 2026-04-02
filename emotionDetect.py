import pandas as pd
from sqlalchemy import create_engine
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.svm import SVC
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
import joblib
import seaborn as sns
import matplotlib.pyplot as plt

# 1. VERİTABANI BAĞLANTISI
print("📡 Veriler çekiliyor...")
# Şifreni ve kullanıcı adını kontrol et
db_connection = create_engine('mysql+pymysql://root:12345@localhost/gazetrack')
df = pd.read_sql("SELECT * FROM emotion_data", db_connection)

print(f"📊 Toplam Veri Sayısı: {len(df)}")
print("Örnek Veri:\n", df.head(3))

# 2. VERİ HAZIRLIĞI
# Girdi Özellikleri (Senin 'az' dediğin ama çok güçlü olan 4 silahşör)
X = df[['mar', 'mouth_width', 'brow_distance', 'ear']]

# Hedef (MUTLU, UZGUN, KIZGIN...)
y = df['emotion_label']

# Etiketleri Sayıya Çevir (MUTLU -> 0, UZGUN -> 1 gibi)
le = LabelEncoder()
y_encoded = le.fit_transform(y)

# Bu "Sözlüğü" kaydetmemiz lazım ki sonra tahmin yaparken 0'ın MUTLU olduğunu bilelim
joblib.dump(le, 'emotion_label_encoder.pkl')
print(f"🏷️ Sınıflar: {list(le.classes_)}")

# 3. ÖLÇEKLEME (SCALING)
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)
joblib.dump(scaler, 'emotion_scaler.pkl') # Scaler'ı kaydet

# 4. EĞİTİM / TEST AYRIMI
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y_encoded, test_size=0.2, random_state=42)

# 5. MODEL SAVAŞI 🥊
print("\n MODELLER EĞİTİLİYOR... ")

models = {
    "SVM": SVC(probability=True, kernel='rbf', C=10),
    "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42)
}

best_model = None
best_acc = 0.0
best_name = ""

for name, model in models.items():
    model.fit(X_train, y_train)
    preds = model.predict(X_test)
    acc = accuracy_score(y_test, preds)
    print(f"✅ {name} Başarısı: %{acc*100:.2f}")
    
    if acc > best_acc:
        best_acc = acc
        best_model = model
        best_name = name

print("-" * 40)
print(f" ŞAMPİYON: {best_name} (%{best_acc*100:.2f})")

# 6. KAYDET
joblib.dump(best_model, 'emotion_model.pkl')
print("💾 Model 'emotion_model.pkl' olarak kaydedildi!")

# 7. ANALİZ (Hangi Duyguyu Karıştırıyor?)
plt.figure(figsize=(8,6))
cm = confusion_matrix(y_test, best_model.predict(X_test))
sns.heatmap(cm, annot=True, fmt='d', cmap='Reds', xticklabels=le.classes_, yticklabels=le.classes_)
plt.title("Hata Analizi (Kim Kimi Karıştırıyor?)")
plt.ylabel("Gerçek")
plt.xlabel("Tahmin")
plt.show()