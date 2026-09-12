const STORAGE_PREFIX = "lagosrenthelp:read-notifications";
const MAX_SAVED_IDS = 250;

const storageKey = (scope: "landlord" | "admin", userId: string) =>
  `${STORAGE_PREFIX}:${scope}:${userId}`;

export const loadReadNotificationIds = (
  scope: "landlord" | "admin",
  userId?: string,
): Set<string> => {
  if (!userId || typeof window === "undefined") return new Set();

  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey(scope, userId)) || "[]");
    return new Set(Array.isArray(saved) ? saved.filter((value): value is string => typeof value === "string") : []);
  } catch {
    return new Set();
  }
};

export const saveReadNotificationIds = (
  scope: "landlord" | "admin",
  userId: string | undefined,
  ids: Set<string>,
) => {
  if (!userId || typeof window === "undefined") return;
  const recentIds = Array.from(ids).slice(-MAX_SAVED_IDS);
  window.localStorage.setItem(storageKey(scope, userId), JSON.stringify(recentIds));
};
