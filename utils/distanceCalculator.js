import { getDistance } from "geolib";

export const calculateDistance = (user, destination) => {
  return getDistance(
    {
      latitude: user.latitude,
      longitude: user.longitude,
    },
    {
      latitude: destination.latitude,
      longitude: destination.longitude,
    }
  );
};