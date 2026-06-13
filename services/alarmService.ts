import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// Set a global handler for how incoming notifications are displayed
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

/**
 * Prepare notification permissions and Android channel (if needed).
 * Returns `true` when notifications are permitted.
 */
export const prepareAlarm = async (): Promise<boolean> => {
  try {
    const { status: currentStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = currentStatus;

    if (currentStatus !== "granted") {
      const permission = await Notifications.requestPermissionsAsync();
      finalStatus = permission.status;
    }

    if (Platform.OS === "android") {
      // Configure an Android notification channel for destination alerts
      await Notifications.setNotificationChannelAsync(
        DESTINATION_ALERT_CHANNEL,
        {
          name: "Destination alerts",
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          sound: "default",
          lockscreenVisibility:
            Notifications.AndroidNotificationVisibility.PUBLIC,
        },
      );
    }

    return finalStatus === "granted";
  } catch (error) {
    // Keep failures non-throwing — callers can handle `false` as not-ready
    // Log for debugging during development
    // eslint-disable-next-line no-console
    console.log("Notification setup error:", error);
    return false;
  }
};

/**
 * Trigger a simple notification informing the user they reached destination.
 * On Android we attach the previously created channel id.
 */
export const triggerAlarm = async (): Promise<string | void> => {
  return Notifications.scheduleNotificationAsync({
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
