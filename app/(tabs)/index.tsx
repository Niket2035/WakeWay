import {
  getCurrentLocation,
  requestLocationPermission,
  searchLocations,
} from "@/services/locationService";
import { useEffect, useState } from "react";
import {
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

interface Location {
  place_id: number;
  display_name: string;
}

export default function HomeScreen() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Location[]>([]);

  useEffect(() => {
    const initLocation = async () => {
      const permissionGranted = await requestLocationPermission();

      if (!permissionGranted) return;

      const location = await getCurrentLocation();

      console.log("User Location:", location);
    };

    initLocation();
  }, []);

  const handleSearch = async (text: string) => {
    setQuery(text);

    if (text.length < 2) {
      setResults([]);
      return;
    }

    const locations = await searchLocations(text);
    setResults(locations);
  };

  const selectLocation = (location: { display_name: string }) => {
    console.log("Selected location:", location);

    setQuery(location.display_name);
    setResults([]);
  };

  return (
    <View style={{ flex: 1, padding: 20, marginTop: 50 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold" }}>
        Enter your destination
      </Text>
      <TextInput
        placeholder="Destination"
        value={query}
        onChangeText={handleSearch}
        style={{
          height: 40,
          borderColor: "gray",
          borderWidth: 1,
          marginTop: 10,
          paddingHorizontal: 10,
          borderRadius: 5,
        }}
      />

      <FlatList
        data={results}
        keyExtractor={(item) => item.place_id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => selectLocation(item)}
            style={{
              padding: 10,
              borderBottomWidth: 0.5,
            }}
          >
            <Text>{item.display_name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
