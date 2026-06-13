import { getDistance } from "geolib";
import { TrackerLocation } from "../types/location";

/**
 * Calculate distance (in meters) between user and destination.
 * Returns `null` when inputs are invalid.
 */
export const calculateDistance = (
  user: TrackerLocation | null,
  destination: TrackerLocation | null,
): number | null => {
  if (
    typeof user?.latitude !== "number" ||
    typeof user?.longitude !== "number" ||
    typeof destination?.latitude !== "number" ||
    typeof destination?.longitude !== "number"
  ) {
    return null;
  }

  return getDistance(
    {
      latitude: user.latitude,
      longitude: user.longitude,
    },
    {
      latitude: destination.latitude,
      longitude: destination.longitude,
    },
  );
};
