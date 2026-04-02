import React, { useState, useRef, useEffect } from "react";

const LivePrediction = () => {
  const videoRef = useRef(null);
  const [activeGrid, setActiveGrid] = useState(null);
  const [confidence, setConfidence] = useState(0);
  const [isLooping, setIsLooping] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 

  const grids = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    });
    return () => setIsLooping(false);
  }, []);

  const captureImage = (callback) => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0);
    canvas.toBlob(callback, "image/jpeg", 0.7);
  };

  useEffect(() => {
    let intervalId;
    if (isLooping) {
      intervalId = setInterval(() => {
        captureImage(async (blob) => {
            if (!blob) return;
            const formData = new FormData();
            formData.append("file", blob);

            try {
                const res = await fetch("http://localhost:8085/predict-gaze", {
                    method: "POST",
                    body: formData,
                });
                const data = await res.json();

                // Hata veya Kalibrasyon sorunu varsa
                if (data.grid === 0 || data.error) {
                    setErrorMsg("⚠️ Kalibrasyon Yapılmadı!");
                    setActiveGrid(null);
                } 
                // Başarılı tahmin
                else if (data.status === "success") {
                    setErrorMsg("");
                    setActiveGrid(data.grid);
                    setConfidence(data.confidence);
                }
            } catch (err) {
                console.error(err);
            }
        });
      }, 100); 
    }
    return () => clearInterval(intervalId);
  }, [isLooping]);

  return (
    <div style={styles.fullScreenContainer}>
      <video ref={videoRef} style={{ display: "none" }} />

      {/* Kontrol Paneli (Üstte Yüzer) */}
      <div style={styles.overlayPanel}>
        <h2 style={{ margin: "5px", color: confidence > 70 ? "#00E676" : "white", textShadow: "1px 1px 2px black" }}>
          Göz Takibi {confidence > 0 && `(Güven: %${confidence})`}
        </h2>
        
        {errorMsg && <div style={styles.errorBox}>{errorMsg}</div>}
        
        <button 
          onClick={() => setIsLooping(!isLooping)} 
          style={{
            ...styles.btn, 
            backgroundColor: isLooping ? "#f44336" : "#2196F3"
          }}
        >
          {isLooping ? "TESTİ DURDUR" : "BAŞLAT"}
        </button>
      </div>

      {/* TAM EKRAN IZGARA */}
      <div style={styles.fullGrid}>
        {grids.map((id) => {
          const isActive = activeGrid === id;
          return (
            <div 
              key={id} 
              style={{
                ...styles.gridCell,
                backgroundColor: isActive ? "rgba(0, 230, 118, 0.4)" : "transparent",
                border: isActive ? "5px solid #00E676" : "1px solid rgba(255,255,255,0.1)",
                boxShadow: isActive ? "inset 0 0 50px #00E676" : "none",
                transform: isActive ? "scale(0.98)" : "scale(1)",
              }}
            >
              <span style={{
                  fontSize: "5rem", 
                  fontWeight: "bold", 
                  color: isActive ? "white" : "rgba(255,255,255,0.1)"
              }}>
                {id}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles = {
  fullScreenContainer: {
    width: "100vw", height: "100vh",
    backgroundColor: "#121212",
    position: "relative",
    overflow: "hidden" // Kaydırma çubuklarını gizle
  },
  overlayPanel: {
    position: "absolute", top: "10px", left: "0", right: "0",
    display: "flex", flexDirection: "column", alignItems: "center",
    zIndex: 10, pointerEvents: "none" // Tıklamalar arkaya geçsin
  },
  btn: {
    pointerEvents: "auto",
    padding: "10px 30px", fontSize: "16px", marginTop: "10px",
    border: "none", borderRadius: "20px", cursor: "pointer", 
    color: "white", fontWeight: "bold", boxShadow: "0 4px 10px rgba(0,0,0,0.5)"
  },
  errorBox: {
    backgroundColor: "rgba(255, 0, 0, 0.9)", color: "white",
    padding: "8px 15px", borderRadius: "5px", fontSize: "14px", fontWeight: "bold"
  },
  fullGrid: {
    display: "grid",
    width: "100vw", height: "100vh",
    gridTemplateColumns: "1fr 1fr 1fr", 
    gridTemplateRows: "1fr 1fr 1fr",    
  },
  gridCell: {
    display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all 0.1s ease-out"
  }
};

export default LivePrediction;