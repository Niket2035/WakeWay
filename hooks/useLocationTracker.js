import * as Location from "expo-location";
import { calculateDistance } from "../utils/distanceCalculator";

export const startTracking = async (destination, onReach) => {
  await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: 5000,
      distanceInterval: 10,
    },
    (location) => {
      const user = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      const distance = calculateDistance(user, destination);

      console.log("Distance:", distance);

      if (distance < 300) {
        onReach();
      }
    }
  );
};