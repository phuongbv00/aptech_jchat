package edu.aptech.sem4.repositories;

import edu.aptech.sem4.models.ChatTopic;
import edu.aptech.sem4.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatTopicRepository extends JpaRepository<ChatTopic, Long> {
    List<ChatTopic> findChatTopicByParticipantsContainsOrderByUpdatedAtDesc(User participant);
}
