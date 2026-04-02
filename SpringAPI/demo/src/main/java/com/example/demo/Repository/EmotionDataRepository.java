
package com.example.demo.Repository;

import com.example.demo.Models.EmotionData;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmotionDataRepository extends JpaRepository<EmotionData, Long> {


}
