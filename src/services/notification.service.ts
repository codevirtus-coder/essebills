// ============================================================================
// Notification Service
// ============================================================================

import { apiFetch } from '../api/client';
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

// Mock Data Store (until API is provided)
let mockNotifications: Notification[] = [
  { 
    id: '1', 
    title: 'Payment Success', 
    message: 'ZESA payment for meter 1422-3884-1002 was successful. Token: 1922-3884-1002-3394-1102', 
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), 
    isRead: false, 
    type: 'success',
    category: 'Transactions'
  },
  { 
    id: '2', 
    title: 'Low Float Alert', 
    message: 'Your current shop float is below $50.00. Please replenish to continue selling services.', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), 
    isRead: false, 
    type: 'alert',
    category: 'Wallet'
  },
  { 
    id: '3', 
    title: 'New Service Added', 
    message: 'DSTV Subscriptions are now available on the platform. Start selling today!', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), 
    isRead: true, 
    type: 'info',
    category: 'System'
  },
  { 
    id: '4', 
    title: 'Commission Payout', 
    message: 'Your monthly commission of $142.50 has been settled to your bank account.', 
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), 
    isRead: true, 
    type: 'success',
    category: 'Earnings'
  },
];

/** Get all notifications for the current user */
export async function getNotifications(): Promise<Notification[]> {
  // If API endpoint existed:
  // return apiFetch(API_ENDPOINTS.notifications.root);
  
  // Return sorted mock data
  return [...mockNotifications].sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

/** Mark a single notification as read */
export async function markNotificationAsRead(id: string): Promise<void> {
  mockNotifications = mockNotifications.map(n => 
    n.id === id ? { ...n, isRead: true } : n
  );
}

/** Mark all notifications as read */
export async function markAllNotificationsAsRead(): Promise<void> {
  mockNotifications = mockNotifications.map(n => ({ ...n, isRead: true }));
}

/** Delete a notification */
export async function deleteNotification(id: string): Promise<void> {
  mockNotifications = mockNotifications.filter(n => n.id !== id);
}

/** Clear all read notifications */
export async function clearReadNotifications(): Promise<void> {
  mockNotifications = mockNotifications.filter(n => !n.isRead);
}
