package com.example.demo.Repository;

import com.example.demo.Models.GazeData;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GazeDataRepository extends JpaRepository<GazeData, Integer> {


    @Modifying
    @Transactional
    @Query(value = "INSERT INTO gaze_data " +
            "(left_pupil_x, left_pupil_y, right_pupil_x, right_pupil_y, " +
            "head_yaw, head_pitch, head_roll, " +
            "left_ear, right_ear, " +
            "target_grid) " +
            "VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)", nativeQuery = true)
    int insertGazeData(
            double leftPupil_x,
            double leftPupil_y,
            double rightPupil_x,
            double rightPupil_y,
            double headYaw,
            double headPitch,
            double headRoll,
            double leftEar,
            double rightEar,
            int target_grid);


    @Modifying
    @Transactional
    @Query(value = "select * from gaze_data",nativeQuery = true)
    List<GazeData> getAllGazeData();



    @Modifying
    @Transactional
    @Query(value = "select * from gaze_data where id = ?1",nativeQuery = true)
    GazeData getOneGazeData(int id);

}