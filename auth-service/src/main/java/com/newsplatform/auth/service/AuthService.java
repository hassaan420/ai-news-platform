package com.newsplatform.auth.service;

import com.newsplatform.auth.dto.request.LoginRequestDto;
import com.newsplatform.auth.dto.request.RefreshTokenRequestDto;
import com.newsplatform.auth.dto.request.RegisterRequestDto;
import com.newsplatform.auth.dto.response.LoginResponseDto;
import com.newsplatform.auth.dto.response.TokenResponseDto;
import com.newsplatform.auth.dto.response.UserResponseDto;
import com.newsplatform.auth.dto.request.UpdateProfileRequestDto;

/**
 * Service interface for authentication operations.
 */
public interface AuthService {

  UserResponseDto register(RegisterRequestDto request);

  LoginResponseDto login(LoginRequestDto request);

  LoginResponseDto refreshToken(RefreshTokenRequestDto request);

  UserResponseDto getCurrentUser(Long userId);

  UserResponseDto updateProfile(Long userId, UpdateProfileRequestDto request);

  void logout(RefreshTokenRequestDto request);
}
