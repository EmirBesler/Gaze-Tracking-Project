import React from "react";

const styles = {
  container: {
    width: "100vw", height: "100vh", backgroundColor: "black",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    color: "white", fontFamily: "Arial, sans-serif"
  },
  title: { marginBottom: "40px", fontSize: "2rem", color: "#00E676" },
  grid: { display: "flex", gap: "30px" },
  card: {
    width: "200px", padding: "20px",
    backgroundColor: "#1a1a1a", border: "2px solid #333", borderRadius: "15px",
    cursor: "pointer", textAlign: "center", transition: "transform 0.2s"
  },
  icon: { fontSize: "3rem", marginBottom: "15px", display: "block" },
  btnText: { fontSize: "1.2rem", fontWeight: "bold", color: "white" }
};

// DÜZELTME: Videolar 'public' klasöründe olduğu için başındaki '/videos' silindi.
const VIDEOS = [
  { id: 1, name: "Basket Videosu", src: "/video1.mp4", icon: "🏀" },
  { id: 2, name: "Komik Derleme Videosu",   src: "/video2.mp4", icon: "😆" },
  { id: 3, name: "Film Sahnesi",  src: "/video3.mp4", icon: "🎬" }
];

const VideoSelection = ({ onSelect }) => {
  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Hangi Videoyu Test Etmek İstersin?</h2>
      <div style={styles.grid}>
        {VIDEOS.map((video) => (
          <div 
            key={video.id} 
            style={styles.card}
            onMouseOver={(e) => { e.currentTarget.style.borderColor = "#00E676"; e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseOut={(e) => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.transform = "scale(1)"; }}
            onClick={() => onSelect(video)}
          >
            <span style={styles.icon}>{video.icon}</span>
            <span style={styles.btnText}>{video.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoSelection;