import React, { useEffect, useState } from "react";

const styles = {
  container: {
    padding: "40px",
    color: "white",
    fontFamily: "Arial, sans-serif",
    width: "100vw",
    height: "100vh",
    backgroundColor: "#121212",
    boxSizing: "border-box",
    overflowY: "auto"
  },
  header: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", borderBottom: "1px solid #333", paddingBottom: "20px"
  },
  title: { margin: 0, color: "#00E676" },
  logoutBtn: {
    padding: "10px 20px", backgroundColor: "#d32f2f", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold"
  },
  table: {
    width: "100%", borderCollapse: "collapse", backgroundColor: "#1e1e1e", borderRadius: "8px", overflow: "hidden"
  },
  th: {
    textAlign: "left", padding: "15px", backgroundColor: "#333", color: "#aaa", borderBottom: "1px solid #444"
  },
  td: {
    padding: "15px", borderBottom: "1px solid #2a2a2a"
  },
  row: {
    cursor: "pointer", transition: "0.2s"
  },
  viewBtn: {
    padding: "8px 15px", backgroundColor: "#007BFF", color: "white", border: "none", borderRadius: "4px", cursor: "pointer"
  }
};

const AdminDashboard = ({ onViewReport, onLogout }) => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    // Postman'de çalışan doğru adresi kullanıyoruz
    fetch("http://localhost:8085/api/report/users") 
      .then((res) => res.json())
      .then((data) => {
        // En yeni testi (Session ID'si büyük olanı) en başa alıyoruz
        const sorted = data.sort((a, b) => {
             if (b.sessionId > a.sessionId) return 1;
             if (b.sessionId < a.sessionId) return -1;
             return 0;
        });
        setSessions(sorted);
      })
      .catch((err) => console.error("Veri çekme hatası:", err));
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>📊 Yönetici Paneli ({sessions.length} Kayıt)</h1>
        <button style={styles.logoutBtn} onClick={onLogout}>Çıkış Yap</button>
      </div>

      {sessions.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777" }}>Yükleniyor veya kayıt yok...</p>
      ) : (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Session ID</th>
              <th style={styles.th}>Kullanıcı</th>
              <th style={styles.th}>Video</th>
              <th style={styles.th}>İşlem</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr 
                key={session.sessionId} 
                style={styles.row} 
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#2a2a2a"}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                {/* DÜZELTME: İki style objesini tek bir style içinde birleştirdim */}
                <td style={{ ...styles.td, fontSize: "0.9rem", color: "#888" }}>
                  {session.sessionId}
                </td>
                <td style={{ ...styles.td, fontWeight: "bold", color: "#fff", fontSize: "1.1rem" }}>
                  {session.username}
                </td>
                <td style={{ ...styles.td, color: "#00E676" }}>
                   {session.videoName ? `🎬 ${session.videoName}` : "-"}
                </td>
                <td style={styles.td}>
                  <button 
                    style={styles.viewBtn} 
                    onClick={() => onViewReport(session.username, session.sessionId)}
                  >
                    Raporu Gör ➝
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminDashboard;