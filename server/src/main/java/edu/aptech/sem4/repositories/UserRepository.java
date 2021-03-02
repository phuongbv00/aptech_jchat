package edu.aptech.sem4.repositories;

import edu.aptech.sem4.models.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    User findByEmail(String email);
    Page<User> findAllByFullNameContains(String name, Pageable pageable);
    Page<User> findAllByFullNameContainsAndIdIsNot(String name, Long excludedUid, Pageable pageable);
    List<User> findByIdIn(List<Long> id);
}
