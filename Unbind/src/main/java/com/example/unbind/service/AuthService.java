package com.example.unbind.service;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.unbind.domain.User;
import com.example.unbind.exception.AppException;
import com.example.unbind.mapper.UserMapper;
import com.example.unbind.util.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class AuthService {

	private static final String EMAIL_PATTERN = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
	private static final String INVALID_CREDENTIALS_MESSAGE = "이메일 또는 비밀번호가 올바르지 않습니다.";

	private final UserMapper mapper;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;

	public User signup(User user) {
		if (user.getName() == null || user.getName().isBlank() || user.getEmail() == null
				|| user.getEmail().isBlank() || user.getPassword() == null || user.getPassword().isBlank()) {
			throw new AppException(HttpStatus.BAD_REQUEST, "이름, 이메일, 비밀번호를 모두 입력해주세요.");
		}
		if (!user.getEmail().matches(EMAIL_PATTERN)) {
			throw new AppException(HttpStatus.BAD_REQUEST, "올바른 이메일 형식이 아니에요.");
		}
		if (user.getPassword().length() < 8) {
			throw new AppException(HttpStatus.BAD_REQUEST, "비밀번호는 8자 이상이어야 해요.");
		}
		if (mapper.findByEmail(user.getEmail()) != null) {
			throw new AppException(HttpStatus.CONFLICT, "이미 가입된 이메일이에요.");
		}

		user.setPassword(passwordEncoder.encode(user.getPassword()));
		mapper.insert(user);
		return user;
	}

	public String login(String email, String password) {
		User user = mapper.findByEmail(email);

		if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
			throw new AppException(HttpStatus.UNAUTHORIZED, INVALID_CREDENTIALS_MESSAGE);
		}

		return jwtUtil.generateToken(user.getEmail());
	}

}
