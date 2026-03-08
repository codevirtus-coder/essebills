// ============================================================================
// Notification Service
// ============================================================================

import { apiFetch, voidFetch } from '../api/client';
import { API_ENDPOINTS } from '../api/endpoints';

export type NotificationType = 'success' | 'alert' | 'info' | 'message';

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  type: NotificationType;
  category?: string;
  actionUrl?: string;
}

/** Get all notifications for the current user */
export async function getNotifications(): Promise<Notification[]> {
  return apiFetch<Notification[]>(API_ENDPOINTS.notifications.root);
}

/** Mark a single notification as read */
export async function markNotificationAsRead(id: string): Promise<void> {
  return voidFetch(API_ENDPOINTS.notifications.markRead(id), { method: 'PATCH' });
}

/** Mark all notifications as read */
export async function markAllNotificationsAsRead(): Promise<void> {
  return voidFetch(API_ENDPOINTS.notifications.markAllRead, { method: 'PATCH' });
}

/** Delete a notification */
export async function deleteNotification(id: string): Promise<void> {
  return voidFetch(API_ENDPOINTS.notifications.delete(id), { method: 'DELETE' });
}

/** Clear all read notifications by deleting them one by one */
export async function clearReadNotifications(): Promise<void> {
  const all = await getNotifications();
  await Promise.all(all.filter((n) => n.isRead).map((n) => deleteNotification(n.id)));
}
