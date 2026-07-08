package com.example.unbind.config;

import com.example.unbind.domain.User;
import com.example.unbind.mapper.UserMapper;
import com.example.unbind.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

	private final UserMapper userMapper;
	private final JwtUtil jwtUtil;
	private final PasswordEncoder passwordEncoder;

	@Value("${oauth2.frontend-redirect-uri}")
	private String frontendRedirectUri;

	@Override
	@SuppressWarnings("unchecked")
	public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
			Authentication authentication) throws IOException {
		OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
		OAuth2User oAuth2User = oauthToken.getPrincipal();
		String registrationId = oauthToken.getAuthorizedClientRegistrationId();

		String email;
		String name;

		if ("kakao".equals(registrationId)) {
			Object kakaoId = oAuth2User.getAttribute("id");

			Map<String, Object> properties = oAuth2User.getAttribute("properties");
			name = properties != null ? (String) properties.get("nickname") : null;

			Map<String, Object> kakaoAccount = oAuth2User.getAttribute("kakao_account");
			String accountEmail = null;
			if (kakaoAccount != null) {
				accountEmail = (String) kakaoAccount.get("email");
				if (name == null) {
					Map<String, Object> profile = (Map<String, Object>) kakaoAccount.get("profile");
					name = profile != null ? (String) profile.get("nickname") : null;
				}
			}

			// 카카오는 개인 개발자 앱에 이메일 동의항목을 기본 제공하지 않는 경우가 많아,
			// 이메일을 못 받으면 카카오 고유 ID로 계정을 식별합니다.
			email = accountEmail != null ? accountEmail : "kakao_" + kakaoId + "@kakao.local";
		} else {
			email = oAuth2User.getAttribute("email");
			name = oAuth2User.getAttribute("name");
		}

		if (email == null || email.isBlank()) {
			response.sendRedirect(frontendRedirectUri + "?error=이메일 정보를 가져올 수 없어요.");
			return;
		}

		User user = userMapper.findByEmail(email);
		if (user == null) {
			user = new User();
			user.setEmail(email);
			user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
			user.setName(name != null && !name.isBlank() ? name : "새로운 사용자");
			userMapper.insert(user);
		}

		String token = jwtUtil.generateToken(user.getEmail());
		String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUri).queryParam("token", token)
				.build().toUriString();
		response.sendRedirect(redirectUrl);
	}
}
