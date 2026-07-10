package com.example.unbind.controller;

import com.example.unbind.service.PushSubscriptionService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/push")
@RequiredArgsConstructor
public class PushSubscriptionController {

	private final PushSubscriptionService pushSubscriptionService;

	@PostMapping("/subscribe")
	public void subscribe(@RequestBody SubscribeRequest request, Authentication authentication) {
		pushSubscriptionService.subscribe(authentication.getName(), request.getEndpoint(), request.getP256dh(),
				request.getAuth());
	}

	@DeleteMapping("/subscribe")
	public void unsubscribe(@RequestBody UnsubscribeRequest request) {
		pushSubscriptionService.unsubscribe(request.getEndpoint());
	}

	@Data
	public static class SubscribeRequest {
		private String endpoint;
		private String p256dh;
		private String auth;
	}

	@Data
	public static class UnsubscribeRequest {
		private String endpoint;
	}
}
