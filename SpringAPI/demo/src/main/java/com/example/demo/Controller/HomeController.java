package com.example.demo.Controller;

import com.example.demo.Models.GazeData;
import com.example.demo.Repository.GazeDataRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.http.client.MultipartBodyBuilder;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
public class HomeController {
    @Autowired
    private GazeDataRepository repository;
    @Autowired
    private ObjectMapper mapper;





    @CrossOrigin(origins = "http://localhost:3000")//-->react tan isteği alacak.
    @PostMapping("/collect")
    public ResponseEntity<Map<String, Object>> trackEye(@RequestParam("file") MultipartFile file,@RequestParam("targetZone") int targetZone) {
        String pythonUrl = "http://localhost:8000/detect";

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", file.getResource());
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        RestTemplate restTemplate = new RestTemplate();

        // Python'dan cevabı al
        @SuppressWarnings("unchecked")
        Map<String, Object> response = restTemplate.postForObject(pythonUrl, requestEntity, Map.class);

        // --- HATA KONTROLÜ ---
        // Python "error" döndürdüyse (Kalibre edilmediyse veya yüz yoksa) kaydetme.
        if (response != null && response.containsKey("error")) {
            System.out.println("⚠️ Python Uyarısı: " + response.get("error"));
            return ResponseEntity.ok(response);
        }

        GazeData gazeData = mapper.convertValue(response, GazeData.class);

        if (gazeData != null) {
            // Sadece yüz koordinatları 0 değilse (yani yüz bulunduysa) kaydet
            boolean hasFace = gazeData.getLeftPupil_x() != 0.0 || gazeData.getRightPupil_x() != 0.0;

            if (hasFace) {
                // --- YENİ KAYIT METODU ---
                // Parametre sırası Repository'dekiyle BİREBİR AYNI olmalı
                int result = repository.insertGazeData(
                        gazeData.getLeftPupil_x(),
                        gazeData.getLeftPupil_y(),
                        gazeData.getRightPupil_x(),
                        gazeData.getRightPupil_y(),
                        gazeData.getHeadYaw(),     // Yeni: Kafa Sağa/Sola
                        gazeData.getHeadPitch(),   // Yeni: Kafa Yukarı/Aşağı
                        gazeData.getHeadRoll(),    // Yeni: Kafa Yatma
                        gazeData.getLeftEar(),     // Yeni: Sol Göz Açıklığı
                        gazeData.getRightEar(),    // Yeni: Sağ Göz Açıklığı
                        targetZone                 // Hedef Grid
                );

                if (result > 0) {
                    System.out.println("💾 DB'ye Kaydedildi -> Grid: " + targetZone);
                }
            } else {
                System.out.println("⚠️ Yüz Bulunamadı, Kaydedilmedi.");
            }
        }
        return ResponseEntity.ok(response);
    }



    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/predict-gaze")
    public ResponseEntity<Map<String, Object>> predictGaze(@RequestParam("file") MultipartFile file) {
        try {
            // 1. Python Servisindeki 'PREDICT' adresine gideceğiz
            String pythonUrl = "http://localhost:8000/predict";

            // 2. İsteği Hazırla (Dosyayı ekle)
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 3. İsteği Gönder ve Cevabı Al
            RestTemplate restTemplate = new RestTemplate();

            @SuppressWarnings("unchecked")
            Map<String, Object> response = restTemplate.postForObject(pythonUrl, requestEntity, Map.class);

            // 4. Cevabı direkt React'a dön (İçinde "predicted_zone" var)
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Tahmin servisine ulaşılamadı: " + e.getMessage()));
        }
    }


    // --- YENİ: Sadece Kalibrasyon İçin ---
    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/calibrate")
    public ResponseEntity<Map<String, Object>> calibrateSystem(@RequestParam("file") MultipartFile file) {
        try {
            String pythonUrl = "http://localhost:8000/calibrate";

            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("file", file.getResource());
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            RestTemplate restTemplate = new RestTemplate();
            Map<String, Object> response = restTemplate.postForObject(pythonUrl, requestEntity, Map.class);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("status", "error"));
        }
    }
}
