package com.example.demo.Models;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "session_analytics")
public class SessionAnalytics {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String sessionId;
    private int userId;
    private String username;

    @Column(name = "video_name")
    private String videoName; // Yeni eklediğimiz alan

    private Long videoTimestampMs;
    private int gazeGrid;
    private String emotionLabel;

    private LocalDateTime createdAt;

    // 1. Boş Constructor (JPA için şart)
    public SessionAnalytics() {
    }

    // 2. Dolu Constructor (İşini kolaylaştırmak için)
    public SessionAnalytics(String sessionId, int userId, String username, String videoName, Long videoTimestampMs, int gazeGrid, String emotionLabel) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.username = username;
        this.videoName = videoName;
        this.videoTimestampMs = videoTimestampMs;
        this.gazeGrid = gazeGrid;
        this.emotionLabel = emotionLabel;
    }

    // 3. Otomatik tarih atama
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // --- GETTER ve SETTER METOTLARI ---

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }

    public int getUserId() { return userId; }
    public void setUserId(int userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getVideoName() { return videoName; }
    public void setVideoName(String videoName) { this.videoName = videoName; }

    public Long getVideoTimestampMs() { return videoTimestampMs; }
    public void setVideoTimestampMs(Long videoTimestampMs) { this.videoTimestampMs = videoTimestampMs; }

    public int getGazeGrid() { return gazeGrid; }
    public void setGazeGrid(int gazeGrid) { this.gazeGrid = gazeGrid; }

    public String getEmotionLabel() { return emotionLabel; }
    public void setEmotionLabel(String emotionLabel) { this.emotionLabel = emotionLabel; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}