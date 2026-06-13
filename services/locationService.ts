import axios from "axios";
import * as Location from "expo-location";
import { Alert, Linking } from "react-native";

const LOCATION_SEARCH_URL = process.env.EXPO_PUBLIC_LOCATION_SEARCH_URL as
  | string
  | undefined;

type Coords = { latitude: number; longitude: number };

const normalizeCoordinates = (
  coords: { latitude?: number; longitude?: number } | null | undefined,
): Coords | null => {
  if (
    typeof coords?.latitude !== "number" ||
    typeof coords?.longitude !== "number"
  ) {
    return null;
  }

  return {
    latitude: coords.latitude as number,
    longitude: coords.longitude as number,
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
        "Please enable location permission to use this feature.",
      );
      return false;
    }

    // Check if device location services are enabled
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
        ],
      );
      return false;
    }

    return true;
  } catch (error) {
    console.log("Location permission error:", error);
    return false;
  }
};

export const getCurrentLocation = async (): Promise<Coords | null> => {
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

const formatLocationName = (location: Location.LocationGeocodedAddress) => {
  const parts = [
    location.name,
    location.city,
    location.region,
    location.country,
  ]
    .filter(
      (part): part is string =>
        typeof part === "string" && part.trim().length > 0,
    )
    .map((part) => part.trim());

  return parts.length > 0 ? parts.join(", ") : null;
};

// take an longitude and latitude and return a location name
export const getCurrentLocationName = async (
  coords: Coords,
): Promise<string | null> => {
  try {
    const result = await Location.reverseGeocodeAsync(coords);

    if (!result.length) {
      return null;
    }

    return formatLocationName(result[0]);
  } catch (error) {
    console.log("Error reverse geocoding location:", error);
    return null;
  }
};

export type SearchLocation = {
  place_id: number | string;
  display_name: string;
  latitude: number;
  longitude: number;
};

export const searchLocations = async (
  query: string,
): Promise<SearchLocation[]> => {
  if (!LOCATION_SEARCH_URL) {
    console.warn("LOCATION_SEARCH_URL is not configured");
    return [];
  }

  try {
    const response = await axios.get(LOCATION_SEARCH_URL, {
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
    });

    console.log("Location search results:", response.data);
    return response.data
      .map((location: any) => ({
        place_id: location.place_id,
        display_name: location.display_name,
        latitude: Number(location.lat),
        longitude: Number(location.lon),
      }))
      .filter(
        (location: SearchLocation) =>
          Number.isFinite(location.latitude) &&
          Number.isFinite(location.longitude),
      );
  } catch (error) {
    console.log("Location search error:", error);
    return [];
  }
};
