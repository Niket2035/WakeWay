import { requestLocationPermission, getCurrentLocation } from '@/services/locationService';
import { useEffect } from 'react';
import { Text, TextInput, View } from 'react-native';

export default function HomeScreen() {
   useEffect(() => {
    const initLocation = async () => {
      const permissionGranted = await requestLocationPermission();

      if (!permissionGranted) return;

      const location = await getCurrentLocation();

      console.log("User Location:", location);
    };

    initLocation();
  }, []);
  return (
    <View style={{flex: 1,  padding: 20,marginTop: 50}}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Enter your destination</Text>
      <TextInput
        placeholder="Destination"
        style={{ height: 40, borderColor: 'gray', borderWidth: 1, marginTop: 10, paddingHorizontal: 10 ,borderRadius: 5}}
      />
    </View>
  );
}
