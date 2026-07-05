package com.example.unbind.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import com.example.unbind.domain.User;
import com.example.unbind.service.AuthService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService service;

	
	@PostMapping("/signup")
	public User signup(@RequestBody User user) {
		return service.signup(user);
	}
	
	@PostMapping("/login")
	public String login(@RequestBody User loginRequest) {
		return service.login(loginRequest.getEmail(), loginRequest.getPassword());
	}
}
