package lk.keells.dto;

import java.time.LocalDateTime;

public class OrderTrackingDto {
    private String status;
    private String description;
    private LocalDateTime timestamp;

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
