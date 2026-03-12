import { getDistance } from "geolib";

export const calculateDistance = (user, destination) => {
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
