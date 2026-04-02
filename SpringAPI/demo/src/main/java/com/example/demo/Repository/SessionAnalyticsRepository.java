package com.example.demo.Repository;

import com.example.demo.Models.SessionAnalytics;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Map;

public interface SessionAnalyticsRepository extends JpaRepository<SessionAnalytics,Long> {
    @Query("SELECT s.gazeGrid, COUNT(s) FROM SessionAnalytics s WHERE s.username = :username AND s.sessionId = :sessionId GROUP BY s.gazeGrid")
    List<Object[]> countByGridAndSession(@Param("username") String username, @Param("sessionId") String sessionId);


    // 2. Duygu Sayımı (İŞTE EKSİK OLAN METOT BU) 🔥
    @Query("SELECT s.emotionLabel, COUNT(s) FROM SessionAnalytics s WHERE s.username = :username AND s.sessionId = :sessionId GROUP BY s.emotionLabel")
    List<Object[]> countByEmotionAndSession(@Param("username") String username, @Param("sessionId") String sessionId);

    @Query("SELECT s.username, s.sessionId FROM SessionAnalytics s WHERE s.id IN (SELECT MAX(s2.id) FROM SessionAnalytics s2 GROUP BY s2.username)")
    List<Object[]> findLatestUserSessions();
    // 3. 🔥 YENİ EKLENEN KISIM: Admin Paneli Listesi
    // Bu sorgu; SessionID, Kullanıcı Adı ve VİDEO ADINI gruplayıp getirir.
    // 'MAX(s.videoName)' kullanmamızın sebebi her satırda aynı video isminin tekrar etmesidir.
    @Query("SELECT s.sessionId as sessionId, s.username as username, MAX(s.videoName) as videoName " +
            "FROM SessionAnalytics s " +
            "GROUP BY s.sessionId, s.username")
    List<Map<String, Object>> findDistinctSessionsWithVideo();

}

