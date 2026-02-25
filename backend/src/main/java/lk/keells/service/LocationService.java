package lk.keells.service;

import lk.keells.dto.LocationData;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class LocationService {

    // Sri Lanka - 9 Provinces and 25 Districts (Official data)
    private static final Map<String, List<String>> PROVINCE_DISTRICTS = new LinkedHashMap<>();

    static {
        PROVINCE_DISTRICTS.put("Western Province", Arrays.asList("Colombo", "Gampaha", "Kalutara"));
        PROVINCE_DISTRICTS.put("Central Province", Arrays.asList("Kandy", "Matale", "Nuwara Eliya"));
        PROVINCE_DISTRICTS.put("Southern Province", Arrays.asList("Galle", "Hambantota", "Matara"));
        PROVINCE_DISTRICTS.put("Northern Province", Arrays.asList("Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya"));
        PROVINCE_DISTRICTS.put("Eastern Province", Arrays.asList("Ampara", "Batticaloa", "Trincomalee"));
        PROVINCE_DISTRICTS.put("North Western Province", Arrays.asList("Kurunegala", "Puttalam"));
        PROVINCE_DISTRICTS.put("North Central Province", Arrays.asList("Anuradhapura", "Polonnaruwa"));
        PROVINCE_DISTRICTS.put("Uva Province", Arrays.asList("Badulla", "Monaragala"));
        PROVINCE_DISTRICTS.put("Sabaragamuwa Province", Arrays.asList("Kegalle", "Ratnapura"));
    }

    public List<String> getProvinces() {
        return new ArrayList<>(PROVINCE_DISTRICTS.keySet());
    }

    public Map<String, List<String>> getProvincesWithDistricts() {
        return new LinkedHashMap<>(PROVINCE_DISTRICTS);
    }

    public List<String> getDistrictsByProvince(String province) {
        List<String> districts = PROVINCE_DISTRICTS.get(province);
        return districts != null ? new ArrayList<>(districts) : Collections.emptyList();
    }

    public LocationData getAllLocations() {
        LocationData data = new LocationData();
        data.setProvinces(getProvinces());
        data.setProvinceDistricts(getProvincesWithDistricts());
        return data;
    }
}
