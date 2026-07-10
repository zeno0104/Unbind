package com.example.unbind.service;

import com.example.unbind.domain.PushSubscription;
import com.example.unbind.mapper.PushSubscriptionMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class ReminderScheduler {

	private final PushSubscriptionMapper pushSubscriptionMapper;
	private final PushNotificationService pushNotificationService;

	@Value("${reminder.stale-days}")
	private int staleDays;

	@Scheduled(cron = "0 0 20 * * *")
	public void sendPendingKnotReminders() {
		List<PushSubscription> subscriptions = pushSubscriptionMapper.findForPendingReminders(staleDays);
		for (PushSubscription subscription : subscriptions) {
			pushNotificationService.send(subscription, "Unbind", "아직 풀지 않은 매듭이 있어요. 오늘 하나만 풀어볼까요?");
		}
	}
}
