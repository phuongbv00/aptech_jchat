package edu.aptech.sem4.repositories;

import edu.aptech.sem4.models.ChatMessage;
import edu.aptech.sem4.models.ChatTopic;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByTopicAndIdLessThanOrderByCreatedAtDesc(ChatTopic topic, Long id, Pageable pageable);
    List<ChatMessage> findByTopicOrderByCreatedAtDesc(ChatTopic topic, Pageable pageable);
}
