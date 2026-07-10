package com.example.unbind.service;

import com.example.unbind.domain.PushSubscription;
import com.example.unbind.mapper.PushSubscriptionMapper;
import lombok.RequiredArgsConstructor;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.Subscription;
import org.apache.http.HttpResponse;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;
import java.security.GeneralSecurityException;
import java.security.Security;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class PushNotificationService {

	private final PushSubscriptionMapper pushSubscriptionMapper;
	private final ObjectMapper objectMapper = new ObjectMapper();

	@Value("${vapid.public.key}")
	private String vapidPublicKey;

	@Value("${vapid.private.key}")
	private String vapidPrivateKey;

	@Value("${vapid.subject}")
	private String vapidSubject;

	private nl.martijndwars.webpush.PushService webPushService;

	@PostConstruct
	private void init() throws GeneralSecurityException {
		Security.addProvider(new BouncyCastleProvider());
		this.webPushService = new nl.martijndwars.webpush.PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
	}

	public void send(PushSubscription sub, String title, String body) {
		try {
			Subscription subscription = new Subscription(sub.getEndpoint(),
					new Subscription.Keys(sub.getP256dh(), sub.getAuth()));
			String payload = objectMapper.writeValueAsString(Map.of("title", title, "body", body));
			Notification notification = new Notification(subscription, payload);
			HttpResponse response = webPushService.send(notification);
			int status = response.getStatusLine().getStatusCode();
			if (status == 404 || status == 410) {
				pushSubscriptionMapper.deleteById(sub.getId());
			}
		} catch (Exception e) {
			// 발송 실패는 다음 주기에 재시도되므로 여기서는 무시
		}
	}
}
