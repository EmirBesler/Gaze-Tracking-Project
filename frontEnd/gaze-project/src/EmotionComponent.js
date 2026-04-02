import React, { useRef, useState, useEffect } from "react";

const EmotionComponent = () => {
  const videoRef = useRef(null);
  const [selectedEmotion, setSelectedEmotion] = useState("MUTLU");
  const [status, setStatus] = useState(""); // Kullanıcıya mesaj göstermek için

  // Duygu Listesi
  const emotions = ["MUTLU", "UZGUN", "KIZGIN", "SASKIN", "NOTR"];

  // 1. KAMERAYI BAŞLAT
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    });
  }, []);

  // 2. FOTOĞRAF ÇEK VE GÖNDER
  const captureAndSend = () => {
    const video = videoRef.current;
    if (!video) return;

    setStatus("⏳ İşleniyor...");

    // Canvas ile anlık görüntü al
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    // Resmi Blob'a çevir ve gönder
    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("label", selectedEmotion); // Seçilen duyguyu gönder

      try {
        // Spring Controller Adresi
        const res = await fetch("http://localhost:8085/api/emotion/collect", {
          method: "POST",
          body: formData,
        });

        if (res.ok) {
          setStatus(`✅ Kaydedildi: ${selectedEmotion}`);
          setTimeout(() => setStatus(""), 2000); // 2 sn sonra mesajı sil
        } else {
          setStatus("❌ Hata oluştu!");
        }
      } catch (err) {
        console.error(err);
        setStatus("❌ Sunucuya ulaşılamadı.");
      }
    }, "image/jpeg", 0.9);
  };

  return (
    <div style={styles.container}>
      <h2 style={{ color: "white" }}>🎭 Duygu Verisi Toplama</h2>

      {/* Kamera */}
      <div style={styles.videoWrapper}>
        <video ref={videoRef} style={styles.video} muted />
        {status && <div style={styles.statusBadge}>{status}</div>}
      </div>

      {/* Kontroller */}
      <div style={styles.controls}>
        <label style={{ color: "#aaa", marginRight: "10px" }}>Hangi Duygu?</label>
        
        <select 
          value={selectedEmotion} 
          onChange={(e) => setSelectedEmotion(e.target.value)}
          style={styles.select}
        >
          {emotions.map((em) => (
            <option key={em} value={em}>{em}</option>
          ))}
        </select>

        <button onClick={captureAndSend} style={styles.btn}>
          📸 KAYDET
        </button>
      </div>
    </div>
  );
};

// --- STİLLER ---
const styles = {
  container: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", height: "100vh", backgroundColor: "#1e1e1e",
  },
  videoWrapper: {
    position: "relative", border: "5px solid #333", borderRadius: "10px",
    overflow: "hidden", marginBottom: "20px", width: "640px", height: "480px"
  },
  video: {
    width: "100%", height: "100%", objectFit: "cover"
  },
  statusBadge: {
    position: "absolute", top: "10px", right: "10px",
    backgroundColor: "rgba(0,0,0,0.7)", color: "#00E676",
    padding: "5px 10px", borderRadius: "5px", fontWeight: "bold"
  },
  controls: {
    display: "flex", alignItems: "center", gap: "10px",
    backgroundColor: "#333", padding: "20px", borderRadius: "15px"
  },
  select: {
    padding: "10px", fontSize: "16px", borderRadius: "5px", border: "none"
  },
  btn: {
    padding: "10px 25px", fontSize: "16px", fontWeight: "bold",
    backgroundColor: "#2196F3", color: "white", border: "none",
    borderRadius: "5px", cursor: "pointer", transition: "0.2s"
  }
};

export default EmotionComponent;