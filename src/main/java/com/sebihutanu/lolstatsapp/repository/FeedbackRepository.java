package com.sebihutanu.lolstatsapp.repository;

import com.sebihutanu.lolstatsapp.entity.Feedback;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, UUID> {
    Page<Feedback> findByUserId(UUID userId, Pageable pageable);
}

