import React, { useState } from "react";
import LoginScreen from "./LoginScreen";
import CalibrationOnly from "./CalibrationOnly";
import VideoTracker from "./VideoTracker";
import ResultHeatmap from "./ResultHeatmap";
import AdminDashboard from "./AdminDashBoard";
import VideoSelection from "./VideoSelection"; // <--- YENİ EKLENDİ

const styles = {
  container: {
    width: "100vw", height: "100vh", backgroundColor: "black", margin: 0, padding: 0, overflow: "hidden"
  }
};

function App() {
  // AKIŞ: 'login' -> 'video_select' -> 'calibration' -> 'video' -> 'report'
  const [step, setStep] = useState("login");
  
  // Veri State'leri
  const [username, setUsername] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [selectedVideo, setSelectedVideo] = useState(null); // <--- YENİ

  // --- KULLANICI AKIŞI ---
  const handleUserStart = (name) => {
    setUsername(name);
    setStep("video_select"); // Login bitince Video Seçmeye git
  };

  const handleVideoSelected = (videoObj) => {
    setSelectedVideo(videoObj);
    setStep("calibration"); // Video seçilince Kalibrasyona git
  };

  const handleCalibrationDone = () => {
    setStep("video"); // Kalibrasyon bitince Videoyu Oynat
  };

  const handleVideoFinished = (sessId) => {
    setSessionId(sessId);
    setStep("report");
  };

  const handleRestart = () => {
    setStep("login");
    setUsername("");
    setSessionId("");
    setSelectedVideo(null);
  };

  // --- ADMIN AKIŞI ---
  const handleAdminLogin = () => {
    setStep("admin_dashboard");
  };

  const handleAdminViewReport = (name, sessId) => {
    setUsername(name);
    setSessionId(sessId);
    setStep("admin_report");
  };

  const handleAdminBack = () => {
    setStep("admin_dashboard");
  };

  return (
    <div style={styles.container}>
      
      {/* 1. GİRİŞ EKRANI */}
      {step === "login" && (
        <LoginScreen onUserStart={handleUserStart} onAdminLogin={handleAdminLogin} />
      )}

      {/* 2. VİDEO SEÇİM EKRANI (YENİ) */}
      {step === "video_select" && (
        <VideoSelection onSelect={handleVideoSelected} />
      )}

      {/* 3. KALİBRASYON */}
      {step === "calibration" && (
        <CalibrationOnly onCalibrationComplete={handleCalibrationDone} />
      )}

      {/* 4. VİDEO İZLEME VE ANALİZ */}
      {step === "video" && (
        <VideoTracker 
            username={username} 
            videoSrc={selectedVideo.src}   // Dinamik Kaynak
            videoName={selectedVideo.name} // Dinamik İsim
            onVideoComplete={handleVideoFinished} 
        />
      )}

      {/* 5. RAPOR */}
      {step === "report" && (
        <ResultHeatmap username={username} sessionId={sessionId} onRestart={handleRestart} />
      )}

      {/* --- ADMIN SÜRECİ --- */}
      {step === "admin_dashboard" && (
        <AdminDashboard onViewReport={handleAdminViewReport} onLogout={() => setStep("login")} />
      )}

      {step === "admin_report" && (
        <ResultHeatmap 
          username={username} 
          sessionId={sessionId} 
          onRestart={handleAdminBack} 
        />
      )}
    </div>
  );
}

export default App;