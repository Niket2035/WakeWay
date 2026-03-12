import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const DESTINATION_ALERT_CHANNEL = "destination-alerts";

export const prepareAlarm = async () => {
  try {
    const { status: currentStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = currentStatus;

    if (currentStatus !== "granted") {
      const permission = await Notifications.requestPermissionsAsync();
      finalStatus = permission.status;
    }

    if (Platform.OS === "android") {
      await Notifications.setNotificationChannelAsync(
        DESTINATION_ALERT_CHANNEL,
        {
          name: "Destination alerts",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          sound: "default",
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
        }
      );
    }

    return finalStatus === "granted";
  } catch (error) {
    console.log("Notification setup error:", error);
    return false;
  }
};

export const triggerAlarm = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Destination Reached",
      body: "You are near your destination!",
      sound: "default",
    },
    trigger:
      Platform.OS === "android"
        ? { channelId: DESTINATION_ALERT_CHANNEL }
        : null,
  });
};
