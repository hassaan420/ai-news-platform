package com.newsplatform.auth.repository;

import com.newsplatform.auth.entity.RefreshToken;
import com.newsplatform.auth.entity.User;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

/**
 * Spring Data JPA repository for RefreshToken entity.
 */
@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {

  Optional<RefreshToken> findByToken(String token);

  @Modifying
  @Query("UPDATE RefreshToken r SET r.revoked = true WHERE r.user = :user")
  void revokeAllByUser(User user);
}
