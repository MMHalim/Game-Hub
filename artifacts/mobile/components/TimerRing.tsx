import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";
import { useColors } from "@/hooks/useColors";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface TimerRingProps {
  timeLeft: number;
  totalTime: number;
  size?: number;
  strokeWidth?: number;
}

export function TimerRing({
  timeLeft,
  totalTime,
  size = 120,
  strokeWidth = 8,
}: TimerRingProps) {
  const colors = useColors();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = useSharedValue(1);

  useEffect(() => {
    const ratio = timeLeft / totalTime;
    progress.value = withTiming(ratio, { duration: 1000 });
  }, [timeLeft, totalTime]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - progress.value),
  }));

  const isUrgent = timeLeft <= 10;
  const color = isUrgent ? colors.destructive : colors.primary;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <Text
        style={{
          fontSize: size * 0.22,
          fontWeight: "700",
          color: isUrgent ? colors.destructive : colors.foreground,
          fontFamily: "Inter_700Bold",
        }}
      >
        {timeStr}
      </Text>
    </View>
  );
}
