# Gaze & Emotion Tracking Analytics Platform

Bu proje, kullanıcıların video içeriklerini izlerken sergiledikleri **göz odaklanma noktalarını (Gaze Tracking)** ve **duygusal tepkilerini (Emotion Analysis)** yapay zeka destekli mikroservisler aracılığıyla analiz eden kapsamlı bir web platformudur.

Elde edilen veriler, **Isı Haritaları (Heatmaps)** ve **Duygu Grafikleri** ile görselleştirilerek pazarlama, UX araştırmaları ve davranış analizi için anlamlı raporlar sunar.

---

##  Mimari ve Çalışma Mantığı

Proje, **Microservices** benzeri bir mimari ile 3 ana katmandan oluşur. Veri akışı şu şekildedir:

1.  **Veri Toplama (Frontend):** React arayüzü, video oynarken arka planda gizli bir canvas üzerinden anlık kareler yakalar.
2.  **Veri İletimi:** Yakalanan kare, zaman damgası (`timestamp`) ve video bilgisiyle birlikte Spring Boot sunucusuna iletilir.
3.  **Yapay Zeka İşleme (AI Layer):** Spring Boot, görüntüyü asenkron olarak Python (FastAPI) servislerine dağıtır:
    * **Gaze Service:** Ekranı 3x3'lük (9 bölgeli) bir ızgaraya bölerek kullanıcının hangi bölgeye (`gridID`) baktığını tespit eder.
    * **Emotion Service:** Yüz ifadelerinden baskın duyguyu (Mutlu, Üzgün, Nötr vb.) analiz eder.
4.  **Raporlama:** Analiz sonuçları veritabanında saklanır ve Yönetici Paneli üzerinden görselleştirilir.

---

##  Teknik Detaylar ve Kod Mantığı

Projenin çekirdek işleyişi aşağıdaki ana fonksiyonlar ve servisler üzerinden yürütülür:

### 1. Frontend: Görüntü Yakalama (Capture Logic)
React tarafında `VideoTracker.js` bileşeni, performans optimizasyonu için görüntüyü ekrana yansıtmadan arka planda işler.
* **`captureAndAnalyze` Fonksiyonu:** Bu fonksiyon, video oynatıldığı sürece belirli milisaniye aralıklarıyla tetiklenir. Gizli bir `HTMLCanvasElement` oluşturur, kameradan o anki kareyi çizer ve görüntüyü `Blob` formatına dönüştürerek Backend API'ye `POST` isteği atar.

### 2. Backend: Veri İşleme ve Kayıt
Spring Boot tarafında `VideoAnalyticsController`, gelen veriyi karşılar ve dağıtır.
* **`processFrame` Endpoint'i:** Frontend'den gelen görüntü dosyasını alır. `RestTemplate` kullanarak bu görüntüyü sırasıyla Python Gaze ve Emotion servislerine gönderir. Dönen JSON cevaplarını (Grid ID ve Duygu Etiketi) birleştirerek veritabanı nesnesi oluşturur.
* **`findDistinctSessionsWithVideo` (Repository):** Admin paneli için kritik olan bu sorgu, veritabanındaki binlerce anlık veri arasından benzersiz oturumları ayıklar. `GROUP BY` mantığı kullanarak her oturum için kullanıcı adını, oturum tarihini ve izlenen **Video Adını** tek bir satırda özetler.

### 3. AI Servisleri (Python & FastAPI)
Yapay zeka katmanı iki ayrı mikroservis olarak çalışır:
* **`detectIrısService`:** MediaPipe Face Mesh kütüphanesini kullanır. Göz bebeği vektörlerinin yatay ve dikey konumlarına göre ekranı 9 parçalı bir ızgara (Grid 1-9) olarak haritalandırır.
* **`detectEmotionService`:** Derin öğrenme tabanlı bir model kullanarak yüzdeki mikro ifadeleri analiz eder ve baskın duygu durumunu metin olarak döndürür.

---

##  Temel Özellikler

* **Video Seçim Modülü:** Kullanıcı test öncesi dinamik listeden video seçebilir.
* **9 Noktalı Kalibrasyon:** Kişiye özel göz takibi hassasiyeti için kalibrasyon süreci.
* **Admin Dashboard:** Tüm testlerin listelendiği, "En Yeniden En Eskiye" sıralı yönetim paneli.
* **Detaylı Analiz:** Her oturum için ayrı Isı Haritası (Heatmap) ve Duygu Pasta Grafiği.

---

##  Teknoloji Yığını

| Katman | Teknolojiler |
| :--- | :--- |
| **Frontend** | React.js, Recharts, Axios |
| **Backend** | Spring Boot, Spring Data JPA |
| **AI / ML** | Python, FastAPI, OpenCV, MediaPipe |
| **Veritabanı** |MYSQL|
---

##  Kurulum ve Çalıştırma

Projeyi yerel ortamınızda ayağa kaldırmak için aşağıdaki adımları sırasıyla uygulayın.

### 1. Python AI Servisleri
Göz takibi ve duygu analizi yapan servisleri başlatın.

```bash
cd python-services
pip install -r requirements.txt
uvicorn detectEmotionService:app --port 8001 --reload
uvicorn detectIrısService:app --reload


cd backend
mvn spring-boot:run
cd frontend
cd gaze-project
npm install
npm start