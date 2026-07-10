package com.example.unbind.mapper;

import com.example.unbind.domain.PasswordResetToken;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface PasswordResetTokenMapper {
	void insert(PasswordResetToken token);

	PasswordResetToken findValidByTokenHash(@Param("tokenHash") String tokenHash);

	void markUsed(@Param("id") Long id);

	void deleteAllByUserId(@Param("userId") Long userId);
}
