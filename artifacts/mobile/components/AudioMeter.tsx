import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

interface AudioMeterProps {
  level: number;
  barCount?: number;
  height?: number;
}

const BAR_HEIGHTS = [0.4, 0.6, 0.8, 1.0, 0.9, 0.7, 0.85, 1.0, 0.75, 0.6, 0.8, 0.95, 0.7, 0.5, 0.65];

export function AudioMeter({ level, barCount = 15, height = 80 }: AudioMeterProps) {
  const colors = useColors();
  const animValues = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.1))
  ).current;

  useEffect(() => {
    const normalized = Math.max(0, Math.min(1, level / 100));
    const animations = animValues.map((anim, i) => {
      const barMax = BAR_HEIGHTS[i % BAR_HEIGHTS.length];
      const variance = 0.6 + Math.random() * 0.4;
      const target = normalized > 0.05
        ? Math.max(0.1, normalized * barMax * variance)
        : 0.05 + Math.random() * 0.05;

      return Animated.timing(anim, {
        toValue: target,
        duration: 80,
        useNativeDriver: false,
      });
    });
    Animated.parallel(animations).start();
  }, [level, animValues]);

  const getBarColor = (normalized: number) => {
    if (normalized > 0.7) return colors.destructive;
    if (normalized > 0.45) return colors.gold;
    return colors.primary;
  };

  const normalized = Math.max(0, Math.min(1, level / 100));

  return (
    <View style={[styles.container, { height }]}>
      {animValues.map((anim, i) => (
        <Animated.View
          key={i}
          style={[
            styles.bar,
            {
              backgroundColor: getBarColor(normalized),
              height: anim.interpolate({
                inputRange: [0, 1],
                outputRange: [4, height],
              }),
              opacity: 0.7 + normalized * 0.3,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    width: "100%",
  },
  bar: {
    width: 6,
    borderRadius: 3,
    minHeight: 4,
  },
});
