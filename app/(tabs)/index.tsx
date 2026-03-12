import { useLocationTracker } from "@/hooks/useLocationTracker";
import { searchLocations } from "@/services/locationService";
import {
  startTransition,
  useDeferredValue,
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

interface DestinationResult {
  place_id: number;
  display_name: string;
  latitude: number;
  longitude: number;
}

interface TrackerLocation {
  latitude: number;
  longitude: number;
}

interface TrackerReachEvent {
  destination: DestinationResult | null;
}

interface LocationTrackerResult {
  currentLocation: TrackerLocation | null;
  distance: number | null;
  error: string;
  hasReachedDestination: boolean;
  isTracking: boolean;
  radius: number;
  startTracking: () => Promise<false | "reached" | "tracking">;
  stopTracking: () => void;
}

const formatDistance = (distance: number | null) => {
  if (distance === null) {
    return "--";
  }

  if (distance < 1000) {
    return `${distance} m`;
  }

  return `${(distance / 1000).toFixed(distance < 10000 ? 2 : 1)} km`;
};

const formatCoordinate = (value?: number) => {
  if (typeof value !== "number") {
    return "--";
  }

  return value.toFixed(5);
};

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const deferredQuery = useDeferredValue(query.trim());
  const [results, setResults] = useState<DestinationResult[]>([]);
  const [selectedDestination, setSelectedDestination] =
    useState<DestinationResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchMessage, setSearchMessage] = useState("");

  const {
    currentLocation,
    distance,
    error,
    hasReachedDestination,
    isTracking,
    radius,
    startTracking,
    stopTracking,
  } = useLocationTracker(selectedDestination, {
    onReach: ({ destination }: TrackerReachEvent) => {
      Alert.alert(
        "Destination reached",
        `You are within ${radius} meters of ${
          destination?.display_name ?? "your destination"
        }.`
      );
    },
  }) as LocationTrackerResult;

  useEffect(() => {
    let isCancelled = false;
    const searchMatchesSelection =
      selectedDestination &&
      deferredQuery === selectedDestination.display_name.trim();

    if (deferredQuery.length < 2 || searchMatchesSelection) {
      setIsSearching(false);
      setSearchMessage("");
      startTransition(() => {
        setResults([]);
      });
      return;
    }

    setIsSearching(true);
    setSearchMessage("");

    const timeoutId = setTimeout(async () => {
      const locations = await searchLocations(deferredQuery);

      if (isCancelled) {
        return;
      }

      startTransition(() => {
        setResults(locations);
      });
      setIsSearching(false);
      setSearchMessage(
        locations.length === 0 ? "No matching destinations found." : ""
      );
    }, 350);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [deferredQuery, selectedDestination]);

  const handleQueryChange = (text: string) => {
    setQuery(text);

    if (selectedDestination && text !== selectedDestination.display_name) {
      stopTracking();
      setSelectedDestination(null);
    }
  };

  const handleSelectLocation = (location: DestinationResult) => {
    setSelectedDestination(location);
    setQuery(location.display_name);
    setSearchMessage("");
    startTransition(() => {
      setResults([]);
    });
  };

  const handleStartTracking = async () => {
    const trackingResult = await startTracking();

    if (trackingResult === "tracking") {
      Alert.alert(
        "Tracking started",
        "The app will alert you once you are close to your destination."
      );
    }
  };

  const handleClearDestination = () => {
    stopTracking();
    setQuery("");
    setSearchMessage("");
    setSelectedDestination(null);
    startTransition(() => {
      setResults([]);
    });
  };

  const hasResults = results.length > 0;
  const helperMessage = error || searchMessage;

  return (
    <View style={styles.screen}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>WakeWay</Text>
        <Text style={styles.title}>Set a destination alarm</Text>
        <Text style={styles.subtitle}>
          Search for a place, start tracking, and get notified before you miss
          your stop.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Destination</Text>
        <TextInput
          placeholder="Search for your destination"
          placeholderTextColor="#6b7280"
          value={query}
          onChangeText={handleQueryChange}
          style={styles.input}
          autoCorrect={false}
        />

        {selectedDestination ? (
          <View style={styles.destinationSummary}>
            <Text style={styles.destinationTitle}>Selected stop</Text>
            <Text style={styles.destinationText}>
              {selectedDestination.display_name}
            </Text>
          </View>
        ) : null}

        {isSearching ? (
          <View style={styles.inlineRow}>
            <ActivityIndicator size="small" color="#0f766e" />
            <Text style={styles.inlineText}>Searching destinations...</Text>
          </View>
        ) : null}

        {!isSearching && hasResults ? (
          <FlatList
            data={results}
            keyExtractor={(item) => item.place_id.toString()}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => handleSelectLocation(item)}
                style={styles.resultItem}
              >
                <Text style={styles.resultText}>{item.display_name}</Text>
              </Pressable>
            )}
          />
        ) : null}

        {helperMessage ? (
          <Text style={styles.helperText}>{helperMessage}</Text>
        ) : null}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Tracking</Text>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Current location</Text>
            <Text style={styles.metricValue}>
              {formatCoordinate(currentLocation?.latitude)},{" "}
              {formatCoordinate(currentLocation?.longitude)}
            </Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Distance left</Text>
            <Text style={styles.metricValue}>{formatDistance(distance)}</Text>
          </View>
        </View>

        <Text style={styles.statusText}>
          {hasReachedDestination
            ? "You are already inside the destination alert radius."
            : isTracking
            ? "Live tracking is active."
            : selectedDestination
            ? `Alert triggers when you are within ${radius} meters.`
            : "Select a destination to enable tracking."}
        </Text>

        <View style={styles.buttonRow}>
          <Pressable
            onPress={handleStartTracking}
            disabled={!selectedDestination || isTracking}
            style={[
              styles.primaryButton,
              (!selectedDestination || isTracking) && styles.disabledButton,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isTracking ? "Tracking..." : "Start tracking"}
            </Text>
          </Pressable>

          <Pressable
            onPress={isTracking ? stopTracking : handleClearDestination}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              {isTracking ? "Stop tracking" : "Clear"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#f4f7f5",
    paddingHorizontal: 20,
    paddingTop: 56,
    gap: 18,
  },
  heroCard: {
    backgroundColor: "#0f172a",
    borderRadius: 24,
    padding: 22,
    gap: 8,
  },
  eyebrow: {
    color: "#5eead4",
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  title: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "800",
  },
  subtitle: {
    color: "#cbd5e1",
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0f172a",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    backgroundColor: "#f8fafc",
  },
  destinationSummary: {
    backgroundColor: "#ecfeff",
    borderRadius: 16,
    padding: 14,
    gap: 6,
  },
  destinationTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#0f766e",
  },
  destinationText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#134e4a",
  },
  inlineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  inlineText: {
    color: "#475569",
    fontSize: 14,
  },
  resultsList: {
    maxHeight: 220,
  },
  resultItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 14,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#1e293b",
  },
  helperText: {
    fontSize: 13,
    color: "#b45309",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0f172a",
  },
  metricRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: 18,
    padding: 14,
    gap: 8,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: "#64748b",
  },
  metricValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
  },
  statusText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#334155",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: "#0f766e",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "700",
  },
  secondaryButton: {
    minWidth: 112,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e2e8f0",
  },
  secondaryButtonText: {
    color: "#0f172a",
    fontSize: 15,
    fontWeight: "700",
  },
  disabledButton: {
    backgroundColor: "#94a3b8",
  },
});
