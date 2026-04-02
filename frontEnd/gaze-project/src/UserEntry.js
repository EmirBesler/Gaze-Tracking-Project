import React, { useState } from "react";

const UserEntry = ({ onStart }) => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (name.trim().length > 0) {
      onStart(name);
    } else {
      alert("Lütfen başlamadan önce bir isim girin! 😊");
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Nöro-Analiz Testi 🧠</h1>
      <p style={styles.subtitle}>Test boyunca kameranız açık olacak.</p>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <input 
          type="text" 
          placeholder="Adınız Soyadınız" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={styles.input}
        />
        <button type="submit" style={styles.btn}>BAŞLA 🚀</button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    width: "100vw", height: "100vh", backgroundColor: "#111",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    color: "white"
  },
  title: { fontSize: "3rem", marginBottom: "10px", color: "#2196F3", textShadow: "0 0 10px rgba(33, 150, 243, 0.5)" },
  subtitle: { fontSize: "1.2rem", color: "#aaa", marginBottom: "40px" },
  form: { display: "flex", flexDirection: "column", gap: "20px", width: "320px" },
  input: {
    padding: "15px", borderRadius: "10px", border: "2px solid #333",
    backgroundColor: "#222", color: "white", fontSize: "1.2rem", outline: "none",
    textAlign: "center"
  },
  btn: {
    padding: "15px", borderRadius: "10px", border: "none",
    backgroundColor: "#00E676", color: "white", fontSize: "1.2rem", fontWeight: "bold",
    cursor: "pointer", transition: "0.2s", boxShadow: "0 5px 15px rgba(0, 230, 118, 0.4)"
  }
};

export default UserEntry;