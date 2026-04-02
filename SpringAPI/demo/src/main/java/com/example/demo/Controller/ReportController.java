package com.example.demo.Controller;

import com.example.demo.Repository.SessionAnalyticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/report") // Adres burası
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private SessionAnalyticsRepository repository;

    @GetMapping("/get")
    public ResponseEntity<Map<String, Object>> getSessionReport(
            @RequestParam("username") String username,
            @RequestParam("sessionId") String sessionId
    ) {
        // 1. GRID ORANLARI
        Map<Integer, Double> gridPercentages = calculatePercentages(
                repository.countByGridAndSession(username, sessionId)
        );

        // 2. DUYGU ORANLARI
        Map<Object, Double> emotionPercentages = calculatePercentages(
                repository.countByEmotionAndSession(username, sessionId)
        );

        Map<String, Object> response = new HashMap<>();
        response.put("grid", gridPercentages);
        response.put("emotion", emotionPercentages);

        return ResponseEntity.ok(response);
    }

    private <K> Map<K, Double> calculatePercentages(List<Object[]> results) {
        long total = 0;
        Map<K, Long> counts = new HashMap<>();

        for (Object[] row : results) {
            K key = (K) row[0];
            Long count = (Long) row[1];
            counts.put(key, count);
            total += count;
        }

        Map<K, Double> percentages = new HashMap<>();
        if (total == 0) return percentages;

        for (Map.Entry<K, Long> entry : counts.entrySet()) {
            double percent = (entry.getValue().doubleValue() / total) * 100.0;
            percentages.put(entry.getKey(), percent);
        }
        return percentages;
    }

    // --- BURASI GÜNCELLENDİ 🔥 ---
    // Artık 'Map<String, String>' değil 'Map<String, Object>' döndürüyoruz.
    // Çünkü Repository'den hazır Map listesi geliyor (Video Adı dahil).
    @GetMapping("/users")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        try {
            // Repository'deki yeni metodu çağırıyoruz
            List<Map<String, Object>> users = repository.findDistinctSessionsWithVideo();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }
}