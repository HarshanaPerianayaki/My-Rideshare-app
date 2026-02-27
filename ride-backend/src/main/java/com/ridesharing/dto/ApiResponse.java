package com.ridesharing.dto;

import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Data;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ApiResponse {
    private boolean success;
    private String message;
    private Integer status;
    private String error;

    public ApiResponse(boolean success, String message) {
        this.success = success;
        this.message = message;
    }

    public ApiResponse(Integer status, String error, String message) {
        this.status = status;
        this.error = error;
        this.message = message;
        this.success = (status != null && status >= 200 && status < 300);
    }
}
