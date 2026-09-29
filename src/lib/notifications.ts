import { db } from './supabase'

const VAPID_PUBLIC_KEY =
  (import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined) ||
  'BGscmY98q92xirBiZPuRXqrc43FQGGpn5ekDLU526GvPSdYcqA72pOGXTsJPEhEqwL-CUfaMciTZDjPh-Q1NJ_0'

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const buffer = new ArrayBuffer(rawData.length)
  const outputArray = new Uint8Array(buffer)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return buffer
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'Notification' in window &&
    'serviceWorker' in navigator &&
    'PushManager' in window
  )
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isPushSupported()) return 'unsupported'
  return Notification.permission
}

export async function subscribeToPush(relationshipId?: string): Promise<{ success: boolean; error?: string }> {
  if (!isPushSupported()) {
    return { success: false, error: 'Push notifications are not supported on this browser.' }
  }

  try {
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') {
      return { success: false, error: 'Notification permission denied.' }
    }

    const reg = await navigator.serviceWorker.ready
    let sub = await reg.pushManager.getSubscription()

    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      })
    }

    const rawKey = sub.getKey('p256dh')
    const rawAuth = sub.getKey('auth')
    if (!rawKey || !rawAuth) {
      return { success: false, error: 'Failed to extract push encryption keys.' }
    }

    const p256dh = btoa(String.fromCharCode(...new Uint8Array(rawKey)))
    const auth = btoa(String.fromCharCode(...new Uint8Array(rawAuth)))

    const client = db()
    const {
      data: { user },
    } = await client.auth.getUser()
    if (!user) {
      return { success: false, error: 'Not authenticated.' }
    }

    const { error: dbError } = await client.from('push_subscriptions').upsert(
      {
        user_id: user.id,
        relationship_id: relationshipId || null,
        endpoint: sub.endpoint,
        p256dh,
        auth,
      },
      { onConflict: 'endpoint' },
    )

    if (dbError) {
      return { success: false, error: dbError.message }
    }

    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, error: msg }
  }
}

export async function unsubscribeFromPush(): Promise<{ success: boolean; error?: string }> {
  if (!isPushSupported()) return { success: true }

  try {
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    if (sub) {
      const client = db()
      await client.from('push_subscriptions').delete().eq('endpoint', sub.endpoint)
      await sub.unsubscribe()
    }
    return { success: true }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { success: false, error: msg }
  }
}

export async function sendNotificationToPartner(payload: {
  relationshipId: string
  title: string
  body: string
  url?: string
}): Promise<void> {
  try {
    const client = db()
    const {
      data: { session },
    } = await client.auth.getSession()
    const token = session?.access_token

    const res = await fetch('/api/notify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(payload),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      console.warn('Push notification dispatch note:', data)
    }
  } catch (e) {
    console.warn('Push delivery skipped (running offline or API unreachable):', e)
  }
}
