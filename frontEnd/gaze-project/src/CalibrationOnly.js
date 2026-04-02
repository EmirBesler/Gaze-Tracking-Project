import React, { useRef, useEffect, useState } from "react";

// onCalibrationComplete: Kalibrasyon bitince videoyu başlatmak için tetiklenecek fonksiyon
const CalibrationOnly = ({ onCalibrationComplete }) => {
  const videoRef = useRef(null);
  const [loading, setLoading] = useState(false);

  // 1. KAMERAYI BAŞLAT
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    });
  }, []);

  // 2. KALİBRASYON İSTEĞİ (Python'a)
  const handleCalibrate = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    setLoading(true);

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob);

      try {
        // Python Gaze Servisi (Port 8000)
        // Not: Eğer Spring üzerinden proxy yapmadıysan direkt Python'a atıyoruz.
        const res = await fetch("http://localhost:8000/calibrate", { 
            method: "POST", 
            body: formData 
        });

        if (res.ok) {
            // BAŞARILI! -> Üst bileşene haber ver
            console.log("✅ Kalibrasyon Başarılı!");
            if (onCalibrationComplete) {
                onCalibrationComplete(); 
            }
        } else {
            alert("Kalibrasyon başarısız oldu. Python loglarına bak.");
        }

      } catch (err) {
        console.error("Kalibrasyon hatası:", err);
        alert("Python sunucusuna ulaşılamadı (Port 8000).");
      } finally {
        setLoading(false);
      }
    }, "image/jpeg", 0.7);
  };

  return (
    <div style={styles.container}>
      {/* Gizli Video (Sadece görüntü almak için) */}
      <video ref={videoRef} style={{ display: "none" }} />
      
      <h1 style={{color: "white", marginBottom: "10px"}}>ADIM 1: KALİBRASYON</h1>
      <p style={{color: "#aaa", marginBottom: "30px"}}>
        Lütfen aşağıdaki kırmızı noktaya odaklan ve butona bas.
      </p>
      
      {/* Kırmızı Referans Noktası */}
      <div style={{
          width: "30px", height: "30px", backgroundColor: "red", 
          borderRadius: "50%", marginBottom: "40px",
          boxShadow: "0 0 30px red, 0 0 10px white"
      }}></div>

      <button 
        onClick={handleCalibrate} 
        disabled={loading}
        style={{
            ...styles.btn,
            backgroundColor: loading ? "#555" : "#2196F3",
            cursor: loading ? "wait" : "pointer"
        }}
      >
        {loading ? "Kalibre Ediliyor..." : "KALİBRE ET VE VİDEOYA GEÇ 🎬"}
      </button>
    </div>
  );
};

const styles = {
  container: {
    width: "100vw", height: "100vh", backgroundColor: "#111",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center"
  },
  btn: {
      padding: "15px 30px", fontSize: "20px",
      color: "white", border: "none", borderRadius: "10px",
      fontWeight: "bold", transition: "0.2s"
  }
};

export default CalibrationOnly;