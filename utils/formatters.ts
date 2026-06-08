export const formatDistance = (
  distance: number | null
): string => {
  if (distance === null) return "--";

  if (distance < 1000) {
    return `${distance} m`;
  }

  return `${(distance / 1000).toFixed(
    distance < 10000 ? 2 : 1
  )} km`;
};

export const formatCoordinate = (
  value?: number
): string => {
  if (typeof value !== "number") {
    return "--";
  }

  return value.toFixed(5);
};