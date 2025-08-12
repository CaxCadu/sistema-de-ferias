export type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface Notification {
  id: string;
  message: string;
  type: NotificationType;
  duration?: number;
}

class NotificationManager {
  private notifications: Notification[] = [];
  private listeners: ((notifications: Notification[]) => void)[] = [];

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  show(message: string, type: NotificationType = 'info', duration: number = 5000) {
    const id = Math.random().toString(36).substr(2, 9);
    const notification: Notification = { id, message, type, duration };
    
    this.notifications.push(notification);
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }

    return id;
  }

  remove(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }

  clear() {
    this.notifications = [];
    this.notify();
  }

  getNotifications() {
    return [...this.notifications];
  }
}

export const notificationManager = new NotificationManager();

export const showNotification = (message: string, type: NotificationType = 'info', duration?: number) => {
  return notificationManager.show(message, type, duration);
};