package com.example.unbind.service;

import com.example.unbind.domain.PushSubscription;
import com.example.unbind.domain.User;
import com.example.unbind.mapper.PushSubscriptionMapper;
import com.example.unbind.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PushSubscriptionService {

	private final PushSubscriptionMapper pushSubscriptionMapper;
	private final UserMapper userMapper;

	public void subscribe(String email, String endpoint, String p256dh, String auth) {
		User user = userMapper.findByEmail(email);
		PushSubscription subscription = new PushSubscription();
		subscription.setUserId(user.getId());
		subscription.setEndpoint(endpoint);
		subscription.setP256dh(p256dh);
		subscription.setAuth(auth);
		pushSubscriptionMapper.upsert(subscription);
	}

	public void unsubscribe(String endpoint) {
		pushSubscriptionMapper.deleteByEndpoint(endpoint);
	}
}
