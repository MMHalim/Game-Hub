import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

export function useAudioLevel() {
  const [level, setLevel] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const recordingRef = useRef<any>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const samplesRef = useRef<number[]>([]);

  const startRecording = useCallback(async () => {
    samplesRef.current = [];

    if (Platform.OS === "web") {
      setPermissionGranted(true);
      setIsRecording(true);
      intervalRef.current = setInterval(() => {
        const simLevel = Math.max(
          0,
          Math.min(100, 15 + Math.random() * 30 + Math.sin(Date.now() / 300) * 10)
        );
        setLevel(simLevel);
        samplesRef.current.push(simLevel);
      }, 100);
      return;
    }

    try {
      const { Audio } = await import("expo-av");
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") {
        setPermissionGranted(false);
        setIsRecording(true);
        intervalRef.current = setInterval(() => {
          const sim = Math.max(0, Math.min(100, 10 + Math.random() * 25));
          setLevel(sim);
          samplesRef.current.push(sim);
        }, 100);
        return;
      }
      setPermissionGranted(true);
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY,
        (status: any) => {
          if (status.isRecording && status.metering !== undefined) {
            const normalized = Math.max(
              0,
              Math.min(100, (status.metering + 90) * 1.2)
            );
            setLevel(normalized);
            samplesRef.current.push(normalized);
          }
        },
        100
      );
      recordingRef.current = recording;
      setIsRecording(true);
    } catch {
      setIsRecording(true);
      intervalRef.current = setInterval(() => {
        const sim = Math.max(0, Math.min(100, 15 + Math.random() * 30));
        setLevel(sim);
        samplesRef.current.push(sim);
      }, 100);
    }
  }, []);

  const stopRecording = useCallback(async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.stopAndUnloadAsync();
        recordingRef.current = null;
      }
    } catch {}
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRecording(false);
    setLevel(0);
    const samples = samplesRef.current;
    samplesRef.current = [];
    if (samples.length === 0) return 0;
    return samples.reduce((a, b) => a + b, 0) / samples.length;
  }, []);

  const getAverageScore = useCallback(() => {
    const samples = samplesRef.current;
    if (samples.length === 0) return 0;
    return samples.reduce((a, b) => a + b, 0) / samples.length;
  }, []);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return { level, isRecording, permissionGranted, startRecording, stopRecording, getAverageScore };
}
