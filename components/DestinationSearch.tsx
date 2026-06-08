import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { DestinationResult } from "../types/location";

interface Props {
  query: string;
  onChangeText: (text: string) => void;
  selectedDestination: DestinationResult | null;
  isSearching: boolean;
  results: DestinationResult[];
  helperMessage: string;
  onSelectLocation: (
    location: DestinationResult
  ) => void;
}

const DestinationSearch = ({
  query,
  onChangeText,
  selectedDestination,
  isSearching,
  results,
  helperMessage,
  onSelectLocation,
}: Props) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>Destination</Text>

      <TextInput
        placeholder="Search for your destination"
        placeholderTextColor="#6b7280"
        value={query}
        onChangeText={onChangeText}
        style={styles.input}
      />

      {selectedDestination && (
        <View style={styles.destinationSummary}>
          <Text style={styles.destinationTitle}>
            Selected Stop
          </Text>

          <Text style={styles.destinationText}>
            {selectedDestination.display_name}
          </Text>
        </View>
      )}

      {isSearching && (
        <View style={styles.inlineRow}>
          <ActivityIndicator
            size="small"
            color="#0f766e"
          />
          <Text>Searching...</Text>
        </View>
      )}

      {!isSearching && results.length > 0 && (
        <FlatList
          data={results}
          keyExtractor={(item) =>
            item.place_id.toString()
          }
          renderItem={({ item }) => (
            <Pressable
              style={styles.resultItem}
              onPress={() =>
                onSelectLocation(item)
              }
            >
              <Text>{item.display_name}</Text>
            </Pressable>
          )}
        />
      )}

      {!!helperMessage && (
        <Text style={styles.helperText}>
          {helperMessage}
        </Text>
      )}
    </View>
  );
};

export default DestinationSearch;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 24,
    padding: 18,
    gap: 14,
  },
  label: {
    fontWeight: "700",
  },
  input: {
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 16,
    padding: 14,
  },
  destinationSummary: {
    backgroundColor: "#ecfeff",
    borderRadius: 16,
    padding: 14,
  },
  destinationTitle: {
    fontWeight: "700",
  },
  destinationText: {
    marginTop: 5,
  },
  inlineRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  resultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  helperText: {
    color: "#b45309",
  },
});