package com.example.unbind.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.unbind.domain.User;
import com.example.unbind.mapper.UserMapper;
import com.example.unbind.util.JwtUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor

public class AuthService {

	private final UserMapper mapper;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;
	
	public User signup(User user) {
		user.setPassword(passwordEncoder.encode(user.getPassword()));
		mapper.insert(user);
		return user;
	}

	public String login(String email, String password) {
		User user = mapper.findByEmail(email);
		
		if(user == null) {
			throw new RuntimeException("존재하지 않는 이메일 입니다.");
		}
		
		if(!passwordEncoder.matches(password, user.getPassword())) {
			throw new RuntimeException("비밀번호가 일치하지 않습니다.");

		}
		
		return jwtUtil.generateToken(user.getEmail());
	}

}
