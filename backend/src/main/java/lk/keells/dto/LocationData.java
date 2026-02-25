package lk.keells.dto;

import java.util.List;
import java.util.Map;

public class LocationData {
    private String country = "Sri Lanka";
    private List<String> provinces;
    private Map<String, List<String>> provinceDistricts;

    public String getCountry() { return country; }
    public void setCountry(String country) { this.country = country; }
    public List<String> getProvinces() { return provinces; }
    public void setProvinces(List<String> provinces) { this.provinces = provinces; }
    public Map<String, List<String>> getProvinceDistricts() { return provinceDistricts; }
    public void setProvinceDistricts(Map<String, List<String>> provinceDistricts) { this.provinceDistricts = provinceDistricts; }
}
