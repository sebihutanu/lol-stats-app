package com.sebihutanu.lolstatsapp.service;

import com.sebihutanu.lolstatsapp.dto.FeedbackRequest;
import com.sebihutanu.lolstatsapp.dto.FeedbackResponse;
import com.sebihutanu.lolstatsapp.entity.Feedback;
import com.sebihutanu.lolstatsapp.entity.User;
import com.sebihutanu.lolstatsapp.exception.ResourceNotFoundException;
import com.sebihutanu.lolstatsapp.repository.FeedbackRepository;
import com.sebihutanu.lolstatsapp.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final UserRepository userRepository;

    public FeedbackService(FeedbackRepository feedbackRepository, UserRepository userRepository) {
        this.feedbackRepository = feedbackRepository;
        this.userRepository = userRepository;
    }

    public FeedbackResponse create(UUID userId, FeedbackRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Feedback feedback = Feedback.builder()
                .user(user)
                .category(request.getCategory())
                .rating(request.getRating())
                .allowContact(request.getAllowContact())
                .message(request.getMessage())
                .build();

        feedback = feedbackRepository.save(feedback);
        return mapToResponse(feedback);
    }

    public Page<FeedbackResponse> getMyFeedback(UUID userId, Pageable pageable) {
        return feedbackRepository.findByUserId(userId, pageable).map(this::mapToResponse);
    }

    public Page<FeedbackResponse> getAllFeedback(Pageable pageable) {
        return feedbackRepository.findAll(pageable).map(this::mapToResponse);
    }

    public void delete(UUID feedbackId) {
        if (!feedbackRepository.existsById(feedbackId)) {
            throw new ResourceNotFoundException("Feedback not found");
        }
        feedbackRepository.deleteById(feedbackId);
    }

    private FeedbackResponse mapToResponse(Feedback feedback) {
        return FeedbackResponse.builder()
                .id(feedback.getId())
                .category(feedback.getCategory())
                .rating(feedback.getRating())
                .allowContact(feedback.getAllowContact())
                .message(feedback.getMessage())
                .userName(feedback.getUser().getName())
                .userEmail(feedback.getUser().getEmail())
                .createdAt(feedback.getCreatedAt())
                .build();
    }
}

