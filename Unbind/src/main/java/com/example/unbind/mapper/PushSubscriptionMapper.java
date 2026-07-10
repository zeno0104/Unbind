package com.example.unbind.mapper;

import com.example.unbind.domain.PushSubscription;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface PushSubscriptionMapper {
	void upsert(PushSubscription subscription);

	void deleteByEndpoint(@Param("endpoint") String endpoint);

	void deleteById(@Param("id") Long id);

	void deleteAllByUserId(@Param("userId") Long userId);

	List<PushSubscription> findForPendingReminders(@Param("days") int days);
}
