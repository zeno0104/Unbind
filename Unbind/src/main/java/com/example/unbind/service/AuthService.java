package com.example.unbind.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

import com.example.unbind.domain.PasswordResetToken;
import com.example.unbind.domain.User;
import com.example.unbind.exception.AppException;
import com.example.unbind.mapper.PasswordResetTokenMapper;
import com.example.unbind.mapper.UserMapper;
import com.example.unbind.util.JwtUtil;

import lombok.RequiredArgsConstructor;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HexFormat;

@Service
@RequiredArgsConstructor

public class AuthService {

	private static final String EMAIL_PATTERN = "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$";
	private static final String INVALID_CREDENTIALS_MESSAGE = "이메일 또는 비밀번호가 올바르지 않습니다.";
	private static final long RESET_TOKEN_TTL_MINUTES = 30;

	private final UserMapper mapper;
	private final PasswordEncoder passwordEncoder;
	private final JwtUtil jwtUtil;
	private final PasswordResetTokenMapper passwordResetTokenMapper;
	private final JavaMailSender mailSender;

	@Value("${mail.from}")
	private String mailFrom;

	@Value("${password-reset.frontend-uri}")
	private String passwordResetFrontendUri;

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

	public void requestPasswordReset(String email) {
		User user = mapper.findByEmail(email);
		if (user == null) {
			return;
		}

		String rawToken = generateRawToken();
		PasswordResetToken tokenEntity = new PasswordResetToken();
		tokenEntity.setUserId(user.getId());
		tokenEntity.setTokenHash(hashToken(rawToken));
		tokenEntity.setExpiresAt(LocalDateTime.now().plusMinutes(RESET_TOKEN_TTL_MINUTES));
		passwordResetTokenMapper.insert(tokenEntity);

		try {
			sendResetEmail(user.getEmail(), rawToken);
		} catch (Exception e) {
			// 메일 발송 실패를 클라이언트에 그대로 노출하면 "이 이메일이 가입돼 있는지" 여부가 상태코드로 새어나감 —
			// 발송 성공/실패와 무관하게 항상 동일한 응답을 반환해야 함
		}
	}

	public void confirmPasswordReset(String token, String newPassword) {
		if (newPassword == null || newPassword.length() < 8) {
			throw new AppException(HttpStatus.BAD_REQUEST, "비밀번호는 8자 이상이어야 해요.");
		}

		PasswordResetToken tokenEntity = passwordResetTokenMapper.findValidByTokenHash(hashToken(token));
		if (tokenEntity == null) {
			throw new AppException(HttpStatus.BAD_REQUEST, "유효하지 않거나 만료된 링크예요.");
		}

		mapper.updatePassword(tokenEntity.getUserId(), passwordEncoder.encode(newPassword));
		passwordResetTokenMapper.markUsed(tokenEntity.getId());
	}

	private void sendResetEmail(String toEmail, String rawToken) throws Exception {
		String link = passwordResetFrontendUri + "?token=" + rawToken;

		String html = """
				<!DOCTYPE html>
				<html>
				<body style="margin:0; padding:0; background-color:#f2f1e2; font-family:'Apple SD Gothic Neo','Malgun Gothic',sans-serif;">
				  <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="background-color:#f2f1e2; padding:40px 16px;">
				    <tr>
				      <td align="center">
				        <table role="presentation" width="100%%" cellpadding="0" cellspacing="0" style="max-width:480px; background-color:#fdfcf4; border-radius:16px; overflow:hidden;">
				          <tr>
				            <td style="padding:36px 32px 28px;">
				              <p style="margin:0 0 24px; font-size:15px; font-weight:700; color:#5e8567; letter-spacing:0.02em;">Unbind</p>
				              <h1 style="margin:0 0 16px; font-size:20px; color:#3b2a22;">비밀번호를 재설정해주세요</h1>
				              <p style="margin:0 0 28px; font-size:14.5px; line-height:1.7; color:#5c4c40;">
				                아래 버튼을 눌러 새 비밀번호를 설정해주세요.<br />
				                이 링크는 30분간만 유효해요.
				              </p>
				              <table role="presentation" cellpadding="0" cellspacing="0">
				                <tr>
				                  <td style="border-radius:8px; background-color:#5e8567;">
				                    <a href="%s" style="display:inline-block; padding:12px 28px; font-size:14.5px; font-weight:600; color:#ffffff; text-decoration:none;">비밀번호 재설정하기</a>
				                  </td>
				                </tr>
				              </table>
				              <p style="margin:32px 0 0; font-size:13px; line-height:1.6; color:#9c8f7f;">
				                본인이 요청하지 않았다면 이 메일을 무시하셔도 돼요.
				              </p>
				            </td>
				          </tr>
				        </table>
				      </td>
				    </tr>
				  </table>
				</body>
				</html>
				""".formatted(link);

		String text = "아래 링크에서 비밀번호를 재설정해주세요 (30분간 유효):\n\n" + link
				+ "\n\n본인이 요청하지 않았다면 이 메일을 무시하셔도 돼요.";

		MimeMessage message = mailSender.createMimeMessage();
		MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
		helper.setFrom(mailFrom);
		helper.setTo(toEmail);
		helper.setSubject("[Unbind] 비밀번호 재설정 안내");
		helper.setText(text, html);
		mailSender.send(message);
	}

	private String generateRawToken() {
		byte[] bytes = new byte[32];
		new SecureRandom().nextBytes(bytes);
		return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
	}

	private String hashToken(String rawToken) {
		try {
			MessageDigest digest = MessageDigest.getInstance("SHA-256");
			return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
		} catch (NoSuchAlgorithmException e) {
			throw new IllegalStateException(e);
		}
	}

}
