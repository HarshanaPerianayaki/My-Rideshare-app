package com.ridesharing.dto;

import com.ridesharing.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private User user;
    private boolean requiresPasswordChange;
    private String role;

    public LoginResponse(String token, User user) {
        this.token = token;
        this.user = user;
        this.requiresPasswordChange = user != null
                && (Boolean.TRUE.equals(user.getIsTemporaryPassword()) || user.isNeedsPasswordChange());
        this.role = user != null && user.getRole() != null ? user.getRole().name() : null;
    }
}
