package com.example.demo.Models;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*; // Veya javax.persistence

@Entity
@Table(name = "gaze_data")
public class GazeData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    // --- 1. GÖZ BEBEKLERİ ---
    @JsonProperty("leftPupil_x")
    private double leftPupil_x;

    @JsonProperty("leftPupil_y")
    private double leftPupil_y;

    @JsonProperty("rightPupil_x")
    private double rightPupil_x;

    @JsonProperty("rightPupil_y")
    private double rightPupil_y;

    // --- 2. KAFA POZU (YENİ) ---
    @JsonProperty("head_yaw")
    private double headYaw;

    @JsonProperty("head_pitch")
    private double headPitch;

    @JsonProperty("head_roll")
    private double headRoll;

    // --- 3. GÖZ AÇIKLIĞI (YENİ) ---
    @JsonProperty("left_ear")
    private double leftEar;

    @JsonProperty("right_ear")
    private double rightEar;

    // --- HEDEF ---
    @Column(name = "target_grid")
    private int target_grid;

    // --- Getter ve Setter Metodları ---
    // (IDE'den otomatik oluşturabilirsin ama isimlere dikkat et)

    public double getLeftPupil_x() { return leftPupil_x; }
    public void setLeftPupil_x(double leftPupil_x) { this.leftPupil_x = leftPupil_x; }

    public double getLeftPupil_y() { return leftPupil_y; }
    public void setLeftPupil_y(double leftPupil_y) { this.leftPupil_y = leftPupil_y; }

    public double getRightPupil_x() { return rightPupil_x; }
    public void setRightPupil_x(double rightPupil_x) { this.rightPupil_x = rightPupil_x; }

    public double getRightPupil_y() { return rightPupil_y; }
    public void setRightPupil_y(double rightPupil_y) { this.rightPupil_y = rightPupil_y; }

    public double getHeadYaw() { return headYaw; }
    public void setHeadYaw(double headYaw) { this.headYaw = headYaw; }

    public double getHeadPitch() { return headPitch; }
    public void setHeadPitch(double headPitch) { this.headPitch = headPitch; }

    public double getHeadRoll() { return headRoll; }
    public void setHeadRoll(double headRoll) { this.headRoll = headRoll; }

    public double getLeftEar() { return leftEar; }
    public void setLeftEar(double leftEar) { this.leftEar = leftEar; }

    public double getRightEar() { return rightEar; }
    public void setRightEar(double rightEar) { this.rightEar = rightEar; }

    public int getTarget_grid() { return target_grid; }
    public void setTarget_grid(int target_grid) { this.target_grid = target_grid; }
}