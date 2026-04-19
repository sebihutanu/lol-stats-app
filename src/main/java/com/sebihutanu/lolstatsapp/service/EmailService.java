package com.sebihutanu.lolstatsapp.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendWatchlistAddedEmail(String toEmail, String userName, String playerName, String tagLine, String region, String note) {
        String subject = "Player added to your watchlist!";
        String body = String.format(
                """
                Hi %s,
                
                You just added a new player to your watchlist!
                
                Player: %s#%s
                Region: %s
                Note: %s
                
                You can view your watchlist anytime in the LeagueTracker.
                
                Happy tracking!
                — LeagueTracker
                """,
                userName, playerName, tagLine, region.toUpperCase(),
                (note != null && !note.isBlank()) ? note : "No note"
        );

        sendEmail(toEmail, subject, body);
    }

    @Async
    public void sendFeedbackConfirmationEmail(String toEmail, String userName, String category, int rating, String message) {
        String subject = "Your feedback has been submitted!";
        String body = String.format(
                """
                Hi %s,
                
                Thank you for your feedback! We've received the following:
                
                Category: %s
                Rating: %d/5
                Message: %s
                
                We appreciate your input and will use it to improve the app.
                
                — LoeagueTracker Team
                """,
                userName, category, rating, message
        );

        sendEmail(toEmail, subject, body);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("noreply@leaguetracker.com");
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);

            mailSender.send(message);
            log.info("Email sent to {} with subject: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }
}

