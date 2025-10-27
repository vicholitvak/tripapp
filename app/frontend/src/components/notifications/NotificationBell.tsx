'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { NotificationService } from '@/lib/services/notificationService';
import { Notification } from '@/types/notification';
import { Bell, X, Check } from 'lucide-react';
import Link from 'next/link';

export default function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [notifs, count] = await Promise.all([
        NotificationService.getByUserId(user.uid, 10),
        NotificationService.getUnreadCount(user.uid),
      ]);

      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;

    try {
      await NotificationService.markAllAsRead(user.uid);
      await loadNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-600 bg-red-50';
      case 'high':
        return 'text-orange-600 bg-orange-50';
      case 'normal':
        return 'text-blue-600 bg-blue-50';
      case 'low':
        return 'text-gray-600 bg-gray-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      invitation_created: '📧',
      invitation_claimed: '✅',
      mock_created: '🎭',
      mock_claimed: '🎉',
      onboarding_incomplete: '⏰',
      onboarding_expired: '❌',
      provider_pending: '📋',
      provider_approved: '🎉',
      provider_rejected: '❌',
      order_received: '🛒',
      order_completed: '✅',
      review_received: '⭐',
    };
    return emojis[type] || '🔔';
  };

  if (!user) return null;

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowDropdown(false)}
          />

          {/* Dropdown Content */}
          <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-20 max-h-[600px] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Notificaciones
                {unreadCount > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({unreadCount} no leídas)
                  </span>
                )}
              </h3>
              <button
                onClick={() => setShowDropdown(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Actions */}
            {notifications.length > 0 && unreadCount > 0 && (
              <div className="px-4 py-2 border-b border-gray-100">
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  Marcar todas como leídas
                </button>
              </div>
            )}

            {/* Notifications List */}
            <div className="overflow-y-auto flex-1">
              {loading ? (
                <div className="p-8 text-center text-gray-500">
                  Cargando...
                </div>
              ) : notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No tienes notificaciones
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Emoji/Icon */}
                        <div className="flex-shrink-0">
                          <span className="text-2xl">
                            {getTypeEmoji(notification.type)}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <button
                                onClick={() => handleMarkAsRead(notification.id!)}
                                className="flex-shrink-0 text-blue-600 hover:text-blue-700"
                                title="Marcar como leída"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>

                          {/* Priority Badge */}
                          {notification.priority !== 'normal' && (
                            <span
                              className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded ${getPriorityColor(
                                notification.priority
                              )}`}
                            >
                              {notification.priority === 'urgent' && 'Urgente'}
                              {notification.priority === 'high' && 'Alta prioridad'}
                              {notification.priority === 'low' && 'Baja prioridad'}
                            </span>
                          )}

                          {/* Action Link */}
                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                              onClick={() => setShowDropdown(false)}
                            >
                              Ver detalles →
                            </Link>
                          )}

                          {/* Time */}
                          <p className="text-xs text-gray-400 mt-2">
                            {notification.createdAt instanceof Date
                              ? notification.createdAt.toLocaleString('es-CL', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : new Date(notification.createdAt.toDate()).toLocaleString('es-CL', {
                                  day: 'numeric',
                                  month: 'short',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    // TODO: Navigate to all notifications page
                    console.log('Ver todas las notificaciones');
                  }}
                  className="w-full text-center text-sm text-gray-600 hover:text-gray-900 font-medium"
                >
                  Ver todas las notificaciones
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
