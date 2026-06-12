import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useColors } from "@/hooks/useColors";
import { Celebrity } from "@/data/celebrities";

interface PlayerCardProps {
  name: string;
  celebrity?: Celebrity;
  score?: number;
  isActive?: boolean;
  rank?: number;
  showScore?: boolean;
}

export function PlayerCard({
  name,
  celebrity,
  score,
  isActive = false,
  rank,
  showScore = false,
}: PlayerCardProps) {
  const colors = useColors();

  const rankColors = ["#F59E0B", "#9CA3AF", "#CD7F32"];
  const rankColor = rank !== undefined && rank < 3 ? rankColors[rank] : colors.mutedForeground;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: isActive ? colors.primary + "22" : colors.card,
          borderColor: isActive ? colors.primary : colors.border,
          borderWidth: isActive ? 2 : 1,
        },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: isActive ? colors.primary : colors.muted }]}>
        {rank !== undefined && rank < 3 ? (
          <Text style={styles.rankText}>
            {rank === 0 ? "🥇" : rank === 1 ? "🥈" : "🥉"}
          </Text>
        ) : (
          <Text style={[styles.initial, { color: isActive ? "#fff" : colors.mutedForeground }]}>
            {name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]} numberOfLines={1}>
          {name}
        </Text>
        {celebrity && (
          <Text style={[styles.celebrity, { color: colors.mutedForeground }]} numberOfLines={1}>
            {celebrity.emoji} {celebrity.name}
          </Text>
        )}
      </View>
      {showScore && score !== undefined && (
        <View style={[styles.scoreBadge, { backgroundColor: rankColor + "22" }]}>
          <Feather name="mic" size={12} color={rankColor} />
          <Text style={[styles.scoreText, { color: rankColor }]}>
            {Math.round(score)}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  initial: {
    fontSize: 18,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
  rankText: {
    fontSize: 20,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: "600",
    fontFamily: "Inter_600SemiBold",
  },
  celebrity: {
    fontSize: 12,
    marginTop: 2,
    fontFamily: "Inter_400Regular",
  },
  scoreBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 4,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: "700",
    fontFamily: "Inter_700Bold",
  },
});
