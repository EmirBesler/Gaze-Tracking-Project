package com.example.demo.Controller;

import com.example.demo.Models.SessionAnalytics;
import com.example.demo.Repository.SessionAnalyticsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
@CrossOrigin(origins = "*")
public class VideoAnalyticsController {

    @Autowired
    private SessionAnalyticsRepository repository;

    @PostMapping("/process-frame")
    public ResponseEntity<?> processFrame(
            @RequestParam("file") MultipartFile file,
            @RequestParam("sessionId") String sessionId,
            @RequestParam("timestamp") Long timestamp,
            @RequestParam("username") String username,
            @RequestParam("videoName") String videoName
    ) {
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 1. GAZE (Göz) Servisi
            String gazeUrl = "http://localhost:8000/predict";
            Integer detectedGrid = 0;
            try {
                Map gazeResponse = restTemplate.postForObject(gazeUrl, requestEntity, Map.class);
                if (gazeResponse != null && gazeResponse.containsKey("grid")) {
                    detectedGrid = (Integer) gazeResponse.get("grid");
                }
            } catch (Exception e) {
                System.out.println("Gaze Error: " + e.getMessage());
            }

            // 2. EMOTION (Duygu) Servisi
            String emotionUrl = "http://localhost:8001/predict-emotion";
            String emotionLabel = "UNKNOWN";
            try {
                Map emotionResponse = restTemplate.postForObject(emotionUrl, requestEntity, Map.class);
                if (emotionResponse != null && emotionResponse.containsKey("emotion")) {
                    emotionLabel = (String) emotionResponse.get("emotion");
                }
            } catch (Exception e) {
                System.out.println("Emotion Error: " + e.getMessage());
            }

            // 3. KAYIT (Lomboksuz Yöntem)
            if (detectedGrid != 0) {
                int generatedUserId = Math.abs(username.hashCode());

                // --- DEĞİŞEN KISIM BURASI ---
                // Builder yerine 'new' ve 'setter' kullanıyoruz.
                SessionAnalytics data = new SessionAnalytics();
                data.setSessionId(sessionId);
                data.setUserId(generatedUserId);
                data.setUsername(username);
                data.setVideoTimestampMs(timestamp);
                data.setGazeGrid(detectedGrid);
                data.setEmotionLabel(emotionLabel);
                data.setVideoName(videoName);
                // -----------------------------

                repository.save(data);
            }

            return ResponseEntity.ok(Map.of(
                    "status", "processed",
                    "grid", detectedGrid,
                    "emotion", emotionLabel
            ));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }
}