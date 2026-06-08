export interface DestinationResult {
  place_id: number;
  display_name: string;
  latitude: number;
  longitude: number;
}

export interface TrackerLocation {
  latitude: number;
  longitude: number;
}

export interface TrackerReachEvent {
  destination: DestinationResult | null;
}