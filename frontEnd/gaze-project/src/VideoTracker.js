import React, { useRef, useState, useEffect } from "react";

const styles = {
  container: {
    width: "100vw", height: "100vh", backgroundColor: "black", position: "relative", overflow: "hidden"
  },
  fullScreenVideo: {
    position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "fill", zIndex: 1 
  },
  overlay: {
    position: "absolute", top: 0, left: 0, width: "100%", height: "100%", zIndex: 2, 
    display: "flex", flexDirection: "column", justifyContent: "space-between", alignItems: "center", pointerEvents: "none"
  },
  header: {
    marginTop: "20px", padding: "10px 20px", backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: "20px", color: "white", fontSize: "1.2rem", backdropFilter: "blur(5px)"
  },
  playBtn: {
    pointerEvents: "auto", fontSize: "2rem", padding: "20px 50px", cursor: "pointer",
    backgroundColor: "#00E676", color: "white", border: "none", borderRadius: "50px",
    boxShadow: "0 0 30px rgba(0, 230, 118, 0.6)", fontWeight: "bold", transition: "transform 0.2s"
  },
  debugPanel: { marginBottom: "30px", display: "flex", gap: "20px" },
  badge: {
     padding: "10px 20px", backgroundColor: "rgba(0,0,0,0.7)", color: "#00E676",
     borderRadius: "10px", fontWeight: "bold", fontSize: "1.2rem", border: "1px solid rgba(255,255,255,0.2)"
  }
};

// PROPS GÜNCELLENDİ: videoSrc ve videoName eklendi
const VideoTracker = ({ username, videoSrc, videoName, onVideoComplete }) => {
  const videoRef = useRef(null);
  const cameraRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [sessionId] = useState(`session-${Date.now()}`);
  const [lastData, setLastData] = useState({ grid: 0, emotion: "..." });

  // 1. GİZLİ KAMERA
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
        cameraRef.current.play();
      }
    });
  }, []);

  // 2. VERİ TOPLAMA
  useEffect(() => {
    let intervalId;
    if (isPlaying) {
      intervalId = setInterval(() => {
        captureAndAnalyze();
      }, 400); 
    }
    return () => clearInterval(intervalId);
  }, [isPlaying]);

  const captureAndAnalyze = () => {
    const camera = cameraRef.current;
    const video = videoRef.current;

    if (!camera || !video || camera.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = camera.videoWidth;
    canvas.height = camera.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(camera, 0, 0);

    const currentTimestamp = Math.floor(video.currentTime * 1000);

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append("file", blob);
      formData.append("sessionId", sessionId);
      formData.append("timestamp", currentTimestamp);
      formData.append("username", username);
      
      // YENİ: VİDEO İSMİNİ BACKEND'E EKLİYORUZ
      formData.append("videoName", videoName);

      try {
        const res = await fetch("http://localhost:8085/api/analytics/process-frame", {
            method: "POST",
            body: formData
        });
        
        const data = await res.json();
        setLastData({ grid: data.grid, emotion: data.emotion || "..." });

      } catch (err) {
        console.error("Analiz hatası:", err);
      }
    }, "image/jpeg", 0.5);
  };

  const handleVideoEnd = () => {
      setIsPlaying(false);
      if (onVideoComplete) {
          onVideoComplete(sessionId); 
      }
  };

  return (
    <div style={styles.container}>
      {/* Gizli Kamera */}
      <video ref={cameraRef} style={{ display: "none" }} />

      {/* --- TAM EKRAN VİDEO (DİNAMİK SRC) --- */}
      <video 
          ref={videoRef}
          src={videoSrc} // DİNAMİK KAYNAK BURAYA GELDİ
          style={styles.fullScreenVideo}
          controls={false}
          onEnded={handleVideoEnd}
      />

      {/* --- ARAYÜZ KATMANI --- */}
      <div style={styles.overlay}>
          
          <div style={styles.header}>
            <span>Kullanıcı: <b>{username}</b></span> | <span>Video: <b>{videoName}</b></span>
          </div>

          {!isPlaying && (
              <button 
                onClick={() => { videoRef.current.play(); setIsPlaying(true); }} 
                style={styles.playBtn}
              >
                  ▶ TESTİ BAŞLAT
              </button>
          )}

          <div style={styles.debugPanel}>
              <div style={styles.badge}>
                 Grid: {lastData.grid}
              </div>
              <div style={{...styles.badge, backgroundColor: "#FFC107", color: "black"}}>
                 Duygu: {lastData.emotion}
              </div>
          </div>
      </div>
    </div>
  );
};

export default VideoTracker;