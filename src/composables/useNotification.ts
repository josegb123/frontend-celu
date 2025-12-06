import { ref } from 'vue';

type NotificationType = 'success' | 'error' | 'info' | 'warning';

interface NotificationState {
  message: string | null;
  type: NotificationType | null;
  isVisible: boolean;
}

const notification = ref<NotificationState>({
  message: null,
  type: null,
  isVisible: false,
});

let timeoutId: ReturnType<typeof setTimeout> | null = null;

export function useNotification() {
  const showNotification = (message: string, type: NotificationType = 'info', duration: number = 3000) => {
    // Clear any existing timeout
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    notification.value.message = message;
    notification.value.type = type;
    notification.value.isVisible = true;

    // Set a timeout to hide the notification
    timeoutId = setTimeout(() => {
      clearNotification();
    }, duration);
  };

  const clearNotification = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
    notification.value.isVisible = false;
    notification.value.message = null;
    notification.value.type = null;
  };

  return {
    notification,
    showNotification,
    clearNotification,
  };
}
