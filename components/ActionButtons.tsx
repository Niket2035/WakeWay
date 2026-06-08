import React from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface Props {
  selectedDestination: any;
  isTracking: boolean;
  onStartTracking: () => void;
  onStopTracking: () => void;
  onClear: () => void;
}

const ActionButtons = ({
  selectedDestination,
  isTracking,
  onStartTracking,
  onStopTracking,
  onClear,
}: Props) => {
  return (
    <View style={styles.row}>
      <Pressable
        onPress={onStartTracking}
        disabled={
          !selectedDestination || isTracking
        }
        style={styles.startButton}
      >
        <Text style={styles.buttonText}>
          {isTracking
            ? "Tracking..."
            : "Start Tracking"}
        </Text>
      </Pressable>

      <Pressable
        onPress={
          isTracking ? onStopTracking : onClear
        }
        style={styles.clearButton}
      >
        <Text>
          {isTracking
            ? "Stop Tracking"
            : "Clear"}
        </Text>
      </Pressable>
    </View>
  );
};

export default ActionButtons;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 12,
    marginTop: 15,
  },
  startButton: {
    flex: 1,
    backgroundColor: "#0f766e",
    padding: 14,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
  },
  clearButton: {
    backgroundColor: "#e2e8f0",
    paddingHorizontal: 20,
    justifyContent: "center",
    borderRadius: 16,
  },
});