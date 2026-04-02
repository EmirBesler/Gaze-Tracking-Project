package com.example.demo.Controller;


import com.example.demo.Models.EmotionData;
import com.example.demo.Repository.EmotionDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/emotion")
@CrossOrigin(origins = "*") // React erişebilsin
public class EmotionController {

    @Autowired
    private EmotionDataRepository repository;

    @PostMapping("/collect")
    public ResponseEntity<?> collectEmotionData(
            @RequestParam("file") MultipartFile file,
            @RequestParam("label") String label // "MUTLU", "UZGUN" vs.
    ) {
        try {
            // 1. PYTHON SERVİSİNE HAZIRLIK (Resmi Python'a Gönderiyoruz)
            // Python Portu: 8001 (Emotion Servisi)
            String pythonUrl = "http://localhost:8001/extract-features";

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 2. PYTHON'DAN CEVABI AL
            // Python bize { "status": "success", "data": { "mar": 0.5, ... } } dönüyor
            ResponseEntity<Map> response = restTemplate.postForEntity(pythonUrl, requestEntity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody == null || !responseBody.get("status").equals("success")) {
                return ResponseEntity.status(500).body("Python servisi yüz bulamadı veya hata verdi.");
            }

            // 3. VERİLERİ AYIKLA (JSON Parsing)
            Map<String, Double> features = (Map<String, Double>) responseBody.get("data");

            // 4. VERİTABANINA KAYDET (Entity Oluştur)
            EmotionData data = new EmotionData(
                    features.get("mar"),
                    features.get("mouth_width"),
                    features.get("brow_distance"),
                    features.get("ear"),
                    label // React'tan gelen etiket (Örn: MUTLU)
            );

            repository.save(data);

            return ResponseEntity.ok(Map.of("message", "Veri başarıyla kaydedildi!", "id", data.getId()));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Hata: " + e.getMessage());
        }
    }
}
