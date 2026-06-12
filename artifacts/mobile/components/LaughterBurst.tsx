import React, { forwardRef, useImperativeHandle, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";

const EMOJIS = ["😂", "🔥", "👑", "😹", "🎉", "💀", "🤣", "✨", "🏆", "😆", "🎭", "💫"];
const { width, height } = Dimensions.get("window");

interface Particle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  size: number;
  translateY: Animated.Value;
  translateX: Animated.Value;
  opacity: Animated.Value;
  scale: Animated.Value;
  rotate: Animated.Value;
}

export interface LaughterBurstRef {
  burst: (intensity?: number) => void;
}

export const LaughterBurst = forwardRef<LaughterBurstRef>((_props, ref) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const idRef = useRef(0);

  useImperativeHandle(ref, () => ({
    burst(intensity = 70) {
      const count = Math.round(3 + (intensity / 100) * 6);

      const newParticles: Particle[] = [];

      for (let i = 0; i < count; i++) {
        const id = ++idRef.current;
        const startDelay = i * 60 + Math.random() * 80;
        const flyDuration = 1100 + Math.random() * 600;

        const p: Particle = {
          id,
          emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)],
          x: 20 + Math.random() * (width - 80),
          y: height * 0.5 + Math.random() * (height * 0.25),
          size: 28 + Math.random() * 20,
          translateY: new Animated.Value(0),
          translateX: new Animated.Value(0),
          opacity: new Animated.Value(0),
          scale: new Animated.Value(0.2),
          rotate: new Animated.Value(0),
        };

        Animated.parallel([
          Animated.sequence([
            Animated.delay(startDelay),
            Animated.timing(p.opacity, { toValue: 1, duration: 150, useNativeDriver: true }),
            Animated.timing(p.opacity, { toValue: 0, duration: 450, delay: flyDuration - 600, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.delay(startDelay),
            Animated.spring(p.scale, {
              toValue: 1.2 + Math.random() * 0.6,
              useNativeDriver: true,
              damping: 6,
              stiffness: 280,
            }),
          ]),
          Animated.sequence([
            Animated.delay(startDelay),
            Animated.timing(p.translateY, {
              toValue: -(height * 0.42 + Math.random() * height * 0.28),
              duration: flyDuration,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(startDelay),
            Animated.timing(p.translateX, {
              toValue: (Math.random() - 0.5) * 220,
              duration: flyDuration,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.delay(startDelay),
            Animated.timing(p.rotate, {
              toValue: (Math.random() - 0.5) * 2.5,
              duration: flyDuration,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => {
          setParticles((prev) => prev.filter((pp) => pp.id !== id));
        });

        newParticles.push(p);
      }

      setParticles((prev) => [...prev, ...newParticles]);
    },
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {particles.map((p) => (
        <Animated.Text
          key={p.id}
          style={[
            styles.emoji,
            {
              left: p.x,
              top: p.y,
              fontSize: p.size,
              opacity: p.opacity,
              transform: [
                { translateY: p.translateY },
                { translateX: p.translateX },
                { scale: p.scale },
                {
                  rotate: p.rotate.interpolate({
                    inputRange: [-2.5, 2.5],
                    outputRange: ["-225deg", "225deg"],
                  }),
                },
              ],
            },
          ]}
        >
          {p.emoji}
        </Animated.Text>
      ))}
    </View>
  );
});

LaughterBurst.displayName = "LaughterBurst";

const styles = StyleSheet.create({
  emoji: {
    position: "absolute",
    textAlign: "center",
  },
});
