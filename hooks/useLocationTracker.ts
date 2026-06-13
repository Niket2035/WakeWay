import * as Location from "expo-location";
import { useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { prepareAlarm, triggerAlarm } from "../services/alarmService";
import {
    getCurrentLocation,
    requestLocationPermission,
} from "../services/locationService";
import { DestinationResult, TrackerLocation } from "../types/location";
import { calculateDistance } from "../utils/distanceCalculator";

export const DESTINATION_RADIUS_METERS = 300;

type UseLocationTrackerOptions = {
  radius?: number;
  onReach?: (event: {
    location: TrackerLocation;
    distance: number;
    destination: DestinationResult | null;
  }) => void;
};

type UseLocationTrackerReturn = {
  currentLocation: TrackerLocation | null;
  distance: number | null;
  error: string;
  hasReachedDestination: boolean;
  isTracking: boolean;
  radius: number;
  startTracking: () => Promise<boolean | "reached" | "tracking">;
  stopTracking: () => void;
  syncCurrentLocation: () => Promise<TrackerLocation | null>;
};

/**
 * Hook to track device location and notify when user reaches a destination.
 */
export const useLocationTracker = (
  destination: DestinationResult | null,
  options: UseLocationTrackerOptions = {},
): UseLocationTrackerReturn => {
  const radius = options.radius ?? DESTINATION_RADIUS_METERS;
  const onReachRef = useRef(options.onReach);
  const destinationRef = useRef<DestinationResult | null>(destination);
  const watcherRef = useRef<any>(null);
  const hasTriggeredRef = useRef(false);

  const [currentLocation, setCurrentLocation] =
    useState<TrackerLocation | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [hasReachedDestination, setHasReachedDestination] = useState(false);
  const [error, setError] = useState("");

  onReachRef.current = options.onReach;
  destinationRef.current = destination;

  const clearWatcher = () => {
    const activeWatcher = watcherRef.current;
    watcherRef.current = null;

    if (activeWatcher?.type === "web") {
      if (typeof navigator !== "undefined" && navigator.geolocation) {
        navigator.geolocation.clearWatch(activeWatcher.watchId);
      }
    } else {
      activeWatcher?.subscription?.remove?.();
    }

    setIsTracking(false);
  };

  const updateDistanceFromLocation = (location: TrackerLocation) => {
    setCurrentLocation(location);

    if (!destinationRef.current) {
      setDistance(null);
      return null;
    }

    const remainingDistance = calculateDistance(location, {
      latitude: destinationRef.current.latitude,
      longitude: destinationRef.current.longitude,
    });
    setDistance(remainingDistance);

    return remainingDistance;
  };

  const syncCurrentLocation = async (): Promise<TrackerLocation | null> => {
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

  const handleLocationUpdate = (coords: {
    latitude: number;
    longitude: number;
  }) => {
    const userLocation: TrackerLocation = {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    const remainingDistance = updateDistanceFromLocation(userLocation);

    if (
      remainingDistance !== null &&
      remainingDistance <= radius &&
      !hasTriggeredRef.current
    ) {
      void handleDestinationReached(userLocation, remainingDistance);
    }
  };

  const handleDestinationReached = async (
    location: TrackerLocation,
    remainingDistance: number,
  ) => {
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

  const startTracking = async (): Promise<boolean | "reached" | "tracking"> => {
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
      if (Platform.OS === "web") {
        if (typeof navigator === "undefined" || !navigator.geolocation) {
          setError("Live location tracking is not supported in this browser.");
          return false;
        }

        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            handleLocationUpdate(position.coords as any);
          },
          (trackingError) => {
            // eslint-disable-next-line no-console
            console.log("Web location tracking error:", trackingError);
            clearWatcher();
            setError(
              "Unable to continue live location tracking in this browser.",
            );
          },
          {
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 15000,
          },
        );

        watcherRef.current = {
          type: "web",
          watchId,
        };
      } else {
        const subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (locationUpdate) => {
            handleLocationUpdate(locationUpdate.coords as any);
          },
        );

        watcherRef.current = {
          type: "expo",
          subscription,
        };
      }

      setError("");
      setIsTracking(true);
      return "tracking";
    } catch (trackingError) {
      // eslint-disable-next-line no-console
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
