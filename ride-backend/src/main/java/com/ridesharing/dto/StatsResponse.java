package com.ridesharing.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatsResponse {
    private List<String> labels;
    private List<Object> data;

    public StatsResponse limit(int n) {
        if (labels != null && labels.size() > n) {
            this.labels = labels.subList(0, n);
            this.data = data.subList(0, n);
        }
        return this;
    }
}
