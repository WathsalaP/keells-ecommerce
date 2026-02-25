package lk.keells.controller;

import lk.keells.dto.LocationData;
import lk.keells.service.LocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService locationService;

    public LocationController(LocationService locationService) {
        this.locationService = locationService;
    }

    @GetMapping("/provinces")
    public ResponseEntity<List<String>> getProvinces() {
        return ResponseEntity.ok(locationService.getProvinces());
    }

    @GetMapping("/districts")
    public ResponseEntity<Map<String, List<String>>> getProvincesAndDistricts() {
        return ResponseEntity.ok(locationService.getProvincesWithDistricts());
    }

    @GetMapping("/districts/{province}")
    public ResponseEntity<List<String>> getDistrictsByProvince(@PathVariable String province) {
        return ResponseEntity.ok(locationService.getDistrictsByProvince(province));
    }

    @GetMapping("/all")
    public ResponseEntity<LocationData> getAllLocations() {
        return ResponseEntity.ok(locationService.getAllLocations());
    }
}
