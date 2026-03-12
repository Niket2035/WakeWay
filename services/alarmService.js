import * as Notifications from "expo-notifications";

export const triggerAlarm = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Destination Reached",
      body: "You are near your destination!",
    },
    trigger: null,
  });
};