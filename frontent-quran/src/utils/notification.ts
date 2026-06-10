"use client";

/**
 * Request permission for browser native notifications
 */
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

/**
 * Triggers a browser native notification
 */
export function sendPrayerNotification(title: string, body: string) {
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  try {
    const options: any = {
      body,
      icon: "/icon.png",
      badge: "/icon.png",
      vibrate: [200, 100, 200],
      tag: "shalat-reminder",
      renotify: true,
    };


    // Use Service Worker if active for better support, fallback to standard Notification
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification(title, options);
      }).catch(() => {
        new Notification(title, options);
      });
    } else {
      new Notification(title, options);
    }
  } catch (err) {
    console.error("Failed to show notification:", err);
  }
}

/**
 * Core check to see if any prayer time is due or 5 minutes away.
 * Persists sent notifications to localStorage to avoid double notifications.
 */
export function checkAndScheduleNotifications(
  todaySchedule: Record<string, string> | null,
  t: (key: any, params?: any) => string
) {
  if (!todaySchedule) return;

  const now = new Date();
  const todayDateStr = now.toDateString(); // "Tue Jun 09 2026"

  // Load sent notification registry
  let registry: { date: string; sentKeys: string[] } = { date: todayDateStr, sentKeys: [] };
  try {
    const saved = localStorage.getItem("prayer_notif_registry");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.date === todayDateStr) {
        registry = parsed;
      } else {
        // Clear old registry for a new day
        localStorage.setItem("prayer_notif_registry", JSON.stringify(registry));
      }
    }
  } catch (err) {
    console.error("Failed to read notification registry:", err);
  }

  const prayers = [
    { name: "Imsak", key: "imsak", time: todaySchedule.imsak },
    { name: "Subuh", key: "subuh", time: todaySchedule.subuh },
    { name: "Terbit", key: "terbit", time: todaySchedule.terbit },
    { name: "Dhuha", key: "dhuha", time: todaySchedule.dhuha },
    { name: "Dzuhur", key: "dzuhur", time: todaySchedule.dzuhur },
    { name: "Ashar", key: "ashar", time: todaySchedule.ashar },
    { name: "Maghrib", key: "maghrib", time: todaySchedule.maghrib },
    { name: "Isya", key: "isya", time: todaySchedule.isya },
  ];

  let registryUpdated = false;

  prayers.forEach((prayer) => {
    if (!prayer.time) return;

    const [hour, minute] = prayer.time.split(":").map(Number);
    const prayerTime = new Date();
    prayerTime.setHours(hour, minute, 0, 0);

    const diffMs = prayerTime.getTime() - now.getTime();
    const diffMins = diffMs / (1000 * 60);

    // 1. Check if the prayer starts right now (within the current minute)
    // Diff is between 0 and 1 minute (and hasn't passed yet)
    if (diffMins > -1 && diffMins <= 0) {
      const sentKey = `${prayer.key}-now`;
      if (!registry.sentKeys.includes(sentKey)) {
        const title = t("notificationAlertTitle");
        const body = t("notificationAlertBody", { name: prayer.name, time: prayer.time });
        sendPrayerNotification(title, body);
        registry.sentKeys.push(sentKey);
        registryUpdated = true;
      }
    }

    // 2. Check if the prayer starts in 5 minutes (diff is between 4 and 5 minutes)
    if (diffMins > 4 && diffMins <= 5) {
      const sentKey = `${prayer.key}-5min`;
      if (!registry.sentKeys.includes(sentKey)) {
        const title = t("notificationAlertTitle");
        const body = t("notificationAlertBodyUpcoming", { name: prayer.name, time: prayer.time });
        sendPrayerNotification(title, body);
        registry.sentKeys.push(sentKey);
        registryUpdated = true;
      }
    }
  });

  if (registryUpdated) {
    try {
      localStorage.setItem("prayer_notif_registry", JSON.stringify(registry));
    } catch (err) {
      console.error("Failed to save notification registry:", err);
    }
  }
}
