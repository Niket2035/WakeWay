import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { formatDistance } from "../utils/formatters";

interface Props {
  currentLocation: {
    latitude: number;
    longitude: number;
  } | null;
  currentLocationName: string | null;

  distance: number | null;
  hasReachedDestination: boolean;
  isTracking: boolean;
  selectedDestination: any;
  radius: number;
}

const TrackingCard = ({
  currentLocation,
  currentLocationName,
  distance,
  hasReachedDestination,
  isTracking,
  selectedDestination,
  radius,
}: Props) => {
  return (
    <>
      <Text style={styles.title}>Tracking</Text>

      <View style={styles.row}>
        <View style={styles.metric}>
          <Text>Current Location</Text>

          <Text>{currentLocationName ?? "Searching current place..."}</Text>
        </View>

        <View style={styles.metric}>
          <Text>Distance Left</Text>

          <Text>{formatDistance(distance)}</Text>
        </View>
      </View>

      <Text>
        {hasReachedDestination
          ? "You are already inside destination radius."
          : isTracking
            ? "Live tracking active."
            : selectedDestination
              ? `Alert triggers within ${radius} meters`
              : "Select destination first"}
      </Text>
    </>
  );
};

export default TrackingCard;

const styles = StyleSheet.create({
  title: {
    fontSize: 18,
    fontWeight: "700",
  },
  row: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 12,
  },
  metric: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 14,
    borderRadius: 16,
  },
});
