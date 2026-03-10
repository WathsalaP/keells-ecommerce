package lk.keells.dto;

import jakarta.validation.constraints.NotBlank;

public class CategoryCreateRequest {

    @NotBlank
    private String name;

    private String description;

    // NEW
    private String imageUrl;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}