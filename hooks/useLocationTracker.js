import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";
import {
  getCurrentLocation,
  requestLocationPermission,
} from "../services/locationService";
import { prepareAlarm, triggerAlarm } from "../services/alarmService";
import { calculateDistance } from "../utils/distanceCalculator";

export const DESTINATION_RADIUS_METERS = 300;

export const useLocationTracker = (destination, options = {}) => {
  const radius = options.radius ?? DESTINATION_RADIUS_METERS;
  const onReachRef = useRef(options.onReach);
  const destinationRef = useRef(destination);
  const watcherRef = useRef(null);
  const hasTriggeredRef = useRef(false);

  const [currentLocation, setCurrentLocation] = useState(null);
  const [distance, setDistance] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [hasReachedDestination, setHasReachedDestination] = useState(false);
  const [error, setError] = useState("");

  onReachRef.current = options.onReach;
  destinationRef.current = destination;

  const clearWatcher = () => {
    watcherRef.current?.remove();
    watcherRef.current = null;
    setIsTracking(false);
  };

  const updateDistanceFromLocation = (location) => {
    setCurrentLocation(location);

    if (!destinationRef.current) {
      setDistance(null);
      return null;
    }

    const remainingDistance = calculateDistance(location, destinationRef.current);
    setDistance(remainingDistance);

    return remainingDistance;
  };

  const syncCurrentLocation = async () => {
    const permissionGranted = await requestLocationPermission();

    if (!permissionGranted) {
      setError("Location access is required to track your destination.");
      return null;
    }

    const location = await getCurrentLocation();

    if (!location) {
      setError("Unable to read your current location.");
      return null;
    }

    setError("");
    updateDistanceFromLocation(location);

    return location;
  };

  const stopTracking = () => {
    clearWatcher();
  };

  const handleDestinationReached = async (location, remainingDistance) => {
    if (hasTriggeredRef.current) {
      return;
    }

    hasTriggeredRef.current = true;
    setHasReachedDestination(true);
    clearWatcher();

    await triggerAlarm();
    onReachRef.current?.({
      location,
      distance: remainingDistance,
      destination: destinationRef.current,
    });
  };

  const startTracking = async () => {
    if (!destinationRef.current) {
      setError("Select a destination before starting tracking.");
      return false;
    }

    const latestLocation = await syncCurrentLocation();

    if (!latestLocation) {
      return false;
    }

    await prepareAlarm();

    hasTriggeredRef.current = false;
    setHasReachedDestination(false);
    clearWatcher();

    const initialDistance = updateDistanceFromLocation(latestLocation);

    if (initialDistance !== null && initialDistance <= radius) {
      await handleDestinationReached(latestLocation, initialDistance);
      return "reached";
    }

    try {
      watcherRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000,
          distanceInterval: 10,
        },
        (locationUpdate) => {
          const userLocation = {
            latitude: locationUpdate.coords.latitude,
            longitude: locationUpdate.coords.longitude,
          };

          const remainingDistance = updateDistanceFromLocation(userLocation);

          if (
            remainingDistance !== null &&
            remainingDistance <= radius &&
            !hasTriggeredRef.current
          ) {
            void handleDestinationReached(userLocation, remainingDistance);
          }
        }
      );

      setError("");
      setIsTracking(true);
      return "tracking";
    } catch (trackingError) {
      console.log("Location tracking error:", trackingError);
      clearWatcher();
      setError("Unable to start live location tracking.");
      return false;
    }
  };

  useEffect(() => {
    void syncCurrentLocation();

    return () => {
      clearWatcher();
    };
  }, []);

  useEffect(() => {
    hasTriggeredRef.current = false;
    setHasReachedDestination(false);

    if (!destination) {
      clearWatcher();
      setDistance(null);
      return;
    }

    if (currentLocation) {
      updateDistanceFromLocation(currentLocation);
    }
  }, [destination]);

  return {
    currentLocation,
    distance,
    error,
    hasReachedDestination,
    isTracking,
    radius,
    startTracking,
    stopTracking,
    syncCurrentLocation,
  };
};
