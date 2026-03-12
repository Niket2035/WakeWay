import * as Location from "expo-location";
import { Alert, Linking } from "react-native";
import axios from "axios";

export const requestLocationPermission = async () => {
  try {
    // Check existing permission
    let { status } = await Location.getForegroundPermissionsAsync();

    // If not granted, ask user
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

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.log("Error getting location:", error);
    return null;
  }
};


export const searchLocations = async (query) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: query,
          format: "json",
          addressdetails: 1,
          limit: 5,
        },
        headers: {
          "User-Agent": "destination-alarm-app",
        },
      }
    );

    return response.data;
    
  } catch (error) {
    console.log("Location search error:", error);
    return [];
  }
};