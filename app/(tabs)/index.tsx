import { useLocationTracker } from "@/hooks/useLocationTracker";
import { searchLocations } from "@/services/locationService";

import { startTransition, useDeferredValue, useEffect, useState } from "react";

import { Alert, StyleSheet, View } from "react-native";

import { DestinationResult } from "@/types/location";
import ActionButtons from "../../components/ActionButtons";
import DestinationSearch from "../../components/DestinationSearch";
import HeroCard from "../../components/HeroCard";
import TrackingCard from "../../components/TrackingCard";

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
    onReach: ({ destination }: { destination?: DestinationResult | null }) => {
      Alert.alert(
        "Destination reached",
        `You are within ${radius} meters of ${
          destination?.display_name ?? "your destination"
        }.`,
      );
    },
  });

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
        setResults(
          locations.map((l) => ({ ...l, place_id: Number(l.place_id) })),
        );
      });
      setIsSearching(false);
      setSearchMessage(
        locations.length === 0 ? "No matching destinations found." : "",
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
        "The app will alert you once you are close to your destination.",
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

  const helperMessage = error || searchMessage;

  return (
    <View style={styles.screen}>
      <HeroCard />

      <DestinationSearch
        query={query}
        onChangeText={handleQueryChange}
        selectedDestination={selectedDestination}
        isSearching={isSearching}
        results={results}
        helperMessage={helperMessage}
        onSelectLocation={handleSelectLocation}
      />

      <View style={styles.card}>
        <TrackingCard
          currentLocation={currentLocation}
          distance={distance}
          hasReachedDestination={hasReachedDestination}
          isTracking={isTracking}
          selectedDestination={selectedDestination}
          radius={radius}
        />

        <ActionButtons
          selectedDestination={selectedDestination}
          isTracking={isTracking}
          onStartTracking={handleStartTracking}
          onStopTracking={stopTracking}
          onClear={handleClearDestination}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  card: {
    flex: 1,
  },
});
