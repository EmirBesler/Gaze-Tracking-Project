package com.example.demo.Models;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "emotion_data")
public class EmotionData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- PYTHON'DAN GELECEK VERİLER ---

    // Mouth Aspect Ratio (Ağız Açıklığı) -> Şaşırma ve Bağırma
    @Column(name = "mar")
    private Double mar;

    // Mouth Width (Ağız Genişliği) -> Gülümseme (Mutluluk)
    @Column(name = "mouth_width")
    private Double mouthWidth;

    // Brow-Eye Distance (Kaş-Göz Mesafesi) -> Kızgınlık/Şaşırma
    @Column(name = "brow_distance")
    private Double browDistance;

    // Eye Aspect Ratio (Göz Açıklığı) -> Şaşırma
    @Column(name = "ear")
    private Double ear;

    // --- EĞİTİM VERİSİ ---

    // Kullanıcının o anki hissi: "MUTLU", "UZGUN", "KIZGIN", "NOTR"
    @Column(name = "emotion_label")
    private String emotionLabel;

    // --- ZAMAN DAMGASI ---

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ==========================================
    // CONSTRUCTORLAR (Yapıcı Metotlar)
    // ==========================================

    // 1. Boş Constructor (JPA/Hibernate için ZORUNLUDUR)
    public EmotionData() {
    }

    // 2. Veri Girişi İçin Constructor (ID ve Tarih hariç - Pratik kullanım için)
    public EmotionData(Double mar, Double mouthWidth, Double browDistance, Double ear, String emotionLabel) {
        this.mar = mar;
        this.mouthWidth = mouthWidth;
        this.browDistance = browDistance;
        this.ear = ear;
        this.emotionLabel = emotionLabel;
    }

    // 3. Tam Constructor (Tüm alanlar dahil)
    public EmotionData(Long id, Double mar, Double mouthWidth, Double browDistance, Double ear, String emotionLabel, LocalDateTime createdAt) {
        this.id = id;
        this.mar = mar;
        this.mouthWidth = mouthWidth;
        this.browDistance = browDistance;
        this.ear = ear;
        this.emotionLabel = emotionLabel;
        this.createdAt = createdAt;
    }

    // ==========================================
    // GETTER ve SETTER METOTLARI
    // ==========================================

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Double getMar() {
        return mar;
    }

    public void setMar(Double mar) {
        this.mar = mar;
    }

    public Double getMouthWidth() {
        return mouthWidth;
    }

    public void setMouthWidth(Double mouthWidth) {
        this.mouthWidth = mouthWidth;
    }

    public Double getBrowDistance() {
        return browDistance;
    }

    public void setBrowDistance(Double browDistance) {
        this.browDistance = browDistance;
    }

    public Double getEar() {
        return ear;
    }

    public void setEar(Double ear) {
        this.ear = ear;
    }

    public String getEmotionLabel() {
        return emotionLabel;
    }

    public void setEmotionLabel(String emotionLabel) {
        this.emotionLabel = emotionLabel;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    // ==========================================
    // TOSTRING METODU (Loglarda okunaklı görünsün diye)
    // ==========================================

    @Override
    public String toString() {
        return "EmotionData{" +
                "id=" + id +
                ", mar=" + mar +
                ", mouthWidth=" + mouthWidth +
                ", browDistance=" + browDistance +
                ", ear=" + ear +
                ", emotionLabel='" + emotionLabel + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}