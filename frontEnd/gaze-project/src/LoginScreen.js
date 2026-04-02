import React, { useState } from "react";

const LoginScreen = ({ onUserStart, onAdminLogin }) => {
  const [activeTab, setActiveTab] = useState("user"); // 'user' veya 'admin'
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleUserSubmit = (e) => {
    e.preventDefault();
    if (username.trim()) onUserStart(username);
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    // --- ADMİN ŞİFRESİ BURADA BELİRLENİYOR ---
    if (password === "1234") { 
      onAdminLogin();
    } else {
      alert("Hatalı Parola! 🚫");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Nöro-Analiz Sistemi 🧠</h1>

      {/* TAB BUTONLARI */}
      <div style={styles.tabContainer}>
        <button 
          style={activeTab === "user" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("user")}
        >
          👤 Kullanıcı Girişi
        </button>
        <button 
          style={activeTab === "admin" ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab("admin")}
        >
          🛡️ Admin Girişi
        </button>
      </div>

      {/* FORM ALANI */}
      <div style={styles.formCard}>
        {activeTab === "user" ? (
          <form onSubmit={handleUserSubmit} style={styles.form}>
            <p style={{color: "#aaa"}}>Teste başlamak için isminizi girin.</p>
            <input 
              type="text" placeholder="Adınız Soyadınız" 
              value={username} onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.btnUser}>TESTE BAŞLA 🚀</button>
          </form>
        ) : (
          <form onSubmit={handleAdminSubmit} style={styles.form}>
            <p style={{color: "#aaa"}}>Yönetici parolasını girin.</p>
            <input 
              type="password" placeholder="Parola" 
              value={password} onChange={(e) => setPassword(e.target.value)}
              style={styles.input}
            />
            <button type="submit" style={styles.btnAdmin}>GİRİŞ YAP 🔐</button>
          </form>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: "100vw", height: "100vh", backgroundColor: "#111",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    color: "white"
  },
  title: { fontSize: "2.5rem", marginBottom: "30px", color: "#fff" },
  tabContainer: { display: "flex", gap: "20px", marginBottom: "20px" },
  tab: {
    padding: "10px 20px", backgroundColor: "transparent", border: "1px solid #555",
    color: "#555", cursor: "pointer", borderRadius: "20px", fontSize: "1rem"
  },
  activeTab: {
    padding: "10px 20px", backgroundColor: "#fff", border: "1px solid #fff",
    color: "#000", cursor: "pointer", borderRadius: "20px", fontSize: "1rem", fontWeight: "bold"
  },
  formCard: {
    backgroundColor: "#222", padding: "40px", borderRadius: "20px",
    boxShadow: "0 0 30px rgba(0,0,0,0.5)", width: "350px", textAlign: "center"
  },
  form: { display: "flex", flexDirection: "column", gap: "20px" },
  input: {
    padding: "15px", borderRadius: "10px", border: "1px solid #444",
    backgroundColor: "#333", color: "white", fontSize: "1.1rem", outline: "none", textAlign: "center"
  },
  btnUser: {
    padding: "15px", borderRadius: "10px", border: "none",
    backgroundColor: "#2196F3", color: "white", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer"
  },
  btnAdmin: {
    padding: "15px", borderRadius: "10px", border: "none",
    backgroundColor: "#E91E63", color: "white", fontSize: "1.1rem", fontWeight: "bold", cursor: "pointer"
  }
};

export default LoginScreen;