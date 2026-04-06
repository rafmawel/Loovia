'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Bell } from 'lucide-react'
import type { Notification } from '@/types'

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Déclencher la détection puis charger les notifications
  const loadNotifications = useCallback(async () => {
    try {
      // Détection des nouvelles notifications
      await fetch('/api/notifications/detect', { method: 'POST' })
      // Charger les notifications récentes (lues + non lues)
      const res = await fetch('/api/notifications?all=true')
      if (res.ok) {
        const data = await res.json()
        setNotifications(data.notifications || [])
      }
    } catch {
      // silently fail
    }
  }, [])

  useEffect(() => {
    loadNotifications()
  }, [loadNotifications])

  // Marquer toutes comme lues
  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      })
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    } catch {
      // silently fail
    }
  }

  // Icône de type pour chaque notification
  const typeIcon = (type: string) => {
    switch (type) {
      case 'payment_received':
        return '💰'
      case 'payment_late':
        return '⚠️'
      case 'lease_expiring':
        return '📋'
      case 'irl_revision':
        return '📈'
      case 'signature_completed':
        return '✅'
      default:
        return '🔔'
    }
  }

  // Formater la date relative
  const relativeDate = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "À l'instant"
    if (minutes < 60) return `Il y a ${minutes}min`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `Il y a ${hours}h`
    const days = Math.floor(hours / 24)
    if (days < 7) return `Il y a ${days}j`
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative rounded-lg p-2 text-stone-500 hover:bg-stone-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-terracotta text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl border border-stone-200 bg-white shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-stone-100">
            <h3 className="text-sm font-semibold text-slate-900">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-terracotta hover:text-terracotta-dark font-medium transition-colors"
              >
                Tout marquer comme lu
              </button>
            )}
          </div>

          {/* Liste */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-stone-400">
                Aucune notification
              </div>
            ) : (
              notifications.map((n) => (
                <a
                  key={n.id}
                  href={n.link || '#'}
                  onClick={() => setOpen(false)}
                  className={[
                    'flex gap-3 px-4 py-3 hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0',
                    !n.read ? 'bg-terracotta/5' : '',
                  ].join(' ')}
                >
                  <span className="text-lg flex-shrink-0 mt-0.5">{typeIcon(n.type)}</span>
                  <div className="flex-1 min-w-0">
                    <p className={['text-sm', !n.read ? 'font-semibold text-slate-900' : 'text-slate-700'].join(' ')}>
                      {n.title}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5 line-clamp-2">{n.message}</p>
                    <p className="text-[11px] text-stone-400 mt-1">{relativeDate(n.created_at)}</p>
                  </div>
                  {!n.read && (
                    <span className="mt-2 h-2 w-2 rounded-full bg-terracotta flex-shrink-0" />
                  )}
                </a>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
