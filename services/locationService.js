import * as Location from "expo-location";
import { Alert, Linking } from "react-native";
import axios from "axios";

const LOCATION_SEARCH_URL = "https://nominatim.openstreetmap.org/search";

const normalizeCoordinates = (coords) => {
  if (
    typeof coords?.latitude !== "number" ||
    typeof coords?.longitude !== "number"
  ) {
    return null;
  }

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
  };
};

export const requestLocationPermission = async () => {
  try {
    let { status } = await Location.getForegroundPermissionsAsync();

    if (status !== "granted") {
      const permission = await Location.requestForegroundPermissionsAsync();
      status = permission.status;
    }

    if (status !== "granted") {
      Alert.alert(
        "Location Permission Required",
        "Please enable location permission to use this feature."
      );
      return false;
    }

    // Check if device location is enabled
    const enabled = await Location.hasServicesEnabledAsync();

    if (!enabled) {
      Alert.alert(
        "Location Disabled",
        "Please turn on your device location services.",
        [
          {
            text: "Open Settings",
            onPress: () => Linking.openSettings(),
          },
          { text: "Cancel" },
        ]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.log("Location permission error:", error);
    return false;
  }
};

export const getCurrentLocation = async () => {
  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return normalizeCoordinates(location.coords);
  } catch (error) {
    console.log("Error getting location:", error);
    return null;
  }
};

export const searchLocations = async (query) => {
  try {
    const response = await axios.get(
      LOCATION_SEARCH_URL,
      {
        params: {
          q: query.trim(),
          format: "json",
          addressdetails: 1,
          limit: 5,
        },
        headers: {
          "User-Agent": "destination-alarm-app",
        },
        timeout: 10000,
      }
    );

    return response.data
      .map((location) => ({
        place_id: location.place_id,
        display_name: location.display_name,
        latitude: Number(location.lat),
        longitude: Number(location.lon),
      }))
      .filter(
        (location) =>
          Number.isFinite(location.latitude) &&
          Number.isFinite(location.longitude)
      );
  } catch (error) {
    console.log("Location search error:", error);
    return [];
  }
};
