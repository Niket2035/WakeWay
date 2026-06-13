import { Ionicons } from "@expo/vector-icons";
import React, { useEffect } from "react";
import {
    StyleSheet,
    TouchableOpacity,
    useWindowDimensions,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSequence,
    withSpring,
} from "react-native-reanimated";

const MAX_BAR_WIDTH = 420;

function TabButton({
  activeIndex,
  navigation,
  state,
  route,
  icon,
  size,
  tabIndex,
}: any) {
  const animatedTab = useAnimatedStyle(() => {
    const isActive = activeIndex.value === tabIndex;

    return {
      transform: [
        {
          translateY: withSpring(isActive ? -8 : 0, {
            damping: 14,
            stiffness: 180,
          }),
        },
        {
          scale: withSpring(isActive ? 1.08 : 1, {
            damping: 14,
            stiffness: 180,
          }),
        },
      ],
    };
  });

  return (
    <TouchableOpacity
      style={styles.tab}
      onPress={() => navigation.navigate(route)}
      activeOpacity={0.85}
    >
      <Animated.View style={animatedTab}>
        <Ionicons
          name={icon}
          size={size}
          color={state.index === tabIndex ? "#fff" : "#999"}
        />
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function CustomTabBar({ state, navigation }: any) {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const activeIndex = useSharedValue(state.index);

  const barWidth = Math.min(width - 32, MAX_BAR_WIDTH);
  const activeStep = barWidth / 3;

  useEffect(() => {
    activeIndex.value = state.index;

    if (state.index === 0) {
      translateX.value = withSpring(-activeStep);
    } else if (state.index === 1) {
      translateX.value = withSpring(0);
    } else {
      translateX.value = withSpring(activeStep);
    }

    translateY.value = withSequence(
      withSpring(-12, {
        damping: 14,
        stiffness: 180,
      }),
      withSpring(-7, {
        damping: 14,
        stiffness: 180,
      }),
    );
  }, [activeStep, state.index, translateX, translateY, activeIndex]);

  const animatedCircle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View style={[styles.wrapper, { bottom: Math.max(12, insets.bottom + 8) }]}>
      <View style={[styles.container, { width: barWidth }]}>
        <Animated.View style={[styles.activeCircle, animatedCircle]} />

        <TabButton
          activeIndex={activeIndex}
          navigation={navigation}
          state={state}
          route="profile"
          icon="person"
          size={26}
          tabIndex={0}
        />

        <TabButton
          activeIndex={activeIndex}
          navigation={navigation}
          state={state}
          route="index"
          icon="home"
          size={28}
          tabIndex={1}
        />

        <TabButton
          activeIndex={activeIndex}
          navigation={navigation}
          state={state}
          route="settings"
          icon="settings"
          size={26}
          tabIndex={2}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    alignItems: "center",
  },

  container: {
    height: 70,
    backgroundColor: "#fff",
    borderRadius: 35,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    overflow: "visible",

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 10,
  },

  tab: {
    flex: 1,
    alignItems: "center",
    zIndex: 2,
  },

  activeCircle: {
    position: "absolute",
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: "#2E8B57",
    alignSelf: "center",
  },
});
