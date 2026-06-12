import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./AuthContext";

export type SubscriptionPlan = "weekly" | "monthly" | "yearly";

export interface SubscriptionStatus {
  isSubscribed: boolean;
  isTrialActive: boolean;
  trialDaysLeft: number;
  plan?: SubscriptionPlan;
  expiresAt?: number;
  canPlay: boolean;
}

interface SubscriptionState extends SubscriptionStatus {
  isLoading: boolean;
  subscribe: (plan: SubscriptionPlan) => Promise<void>;
  refreshStatus: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionState | null>(null);

const TRIAL_DAYS = 3;
const SUB_KEY = "lr_subscription";

const PLAN_PRICES: Record<SubscriptionPlan, string> = {
  weekly: "$15",
  monthly: "$39",
  yearly: "$199",
};

export { PLAN_PRICES };

function computeStatus(
  createdAt: number,
  subData: { plan?: SubscriptionPlan; expiresAt?: number } | null
): SubscriptionStatus {
  const now = Date.now();
  const trialEnd = createdAt + TRIAL_DAYS * 24 * 60 * 60 * 1000;
  const isTrialActive = now < trialEnd;
  const trialDaysLeft = Math.max(
    0,
    Math.ceil((trialEnd - now) / (24 * 60 * 60 * 1000))
  );

  if (subData?.expiresAt && subData.expiresAt > now) {
    return {
      isSubscribed: true,
      isTrialActive: false,
      trialDaysLeft: 0,
      plan: subData.plan,
      expiresAt: subData.expiresAt,
      canPlay: true,
    };
  }

  return {
    isSubscribed: false,
    isTrialActive,
    trialDaysLeft,
    canPlay: isTrialActive,
  };
}

export function SubscriptionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [status, setStatus] = useState<SubscriptionStatus>({
    isSubscribed: false,
    isTrialActive: true,
    trialDaysLeft: 3,
    canPlay: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  const refreshStatus = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    const raw = await AsyncStorage.getItem(`${SUB_KEY}_${user.id}`);
    const subData = raw ? JSON.parse(raw) : null;
    setStatus(computeStatus(user.createdAt, subData));
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const subscribe = useCallback(
    async (plan: SubscriptionPlan) => {
      if (!user) return;
      const durations: Record<SubscriptionPlan, number> = {
        weekly: 7 * 24 * 60 * 60 * 1000,
        monthly: 30 * 24 * 60 * 60 * 1000,
        yearly: 365 * 24 * 60 * 60 * 1000,
      };
      const subData = {
        plan,
        expiresAt: Date.now() + durations[plan],
        subscribedAt: Date.now(),
      };
      await AsyncStorage.setItem(
        `${SUB_KEY}_${user.id}`,
        JSON.stringify(subData)
      );
      await refreshStatus();
    },
    [user, refreshStatus]
  );

  return (
    <SubscriptionContext.Provider
      value={{ ...status, isLoading, subscribe, refreshStatus }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx)
    throw new Error("useSubscription must be used inside SubscriptionProvider");
  return ctx;
}
