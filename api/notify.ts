import type { IncomingMessage, ServerResponse } from 'node:http'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

interface NotifyRequestBody {
  relationshipId: string
  title: string
  body: string
  url?: string
}

const VAPID_PUBLIC_KEY =
  process.env.VITE_VAPID_PUBLIC_KEY ||
  'BGscmY98q92xirBiZPuRXqrc43FQGGpn5ekDLU526GvPSdYcqA72pOGXTsJPEhEqwL-CUfaMciTZDjPh-Q1NJ_0'

const VAPID_PRIVATE_KEY =
  process.env.VAPID_PRIVATE_KEY || '2is-GP8CXx3nnZ2zUNS2QKLNcbcO_wJVNElOw3Tc0ws'

const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:ours-app@example.com'

const SUPABASE_URL =
  process.env.VITE_SUPABASE_URL || 'https://fqcmxdnpzpoatkydgqmr.supabase.co'

const SUPABASE_ANON_KEY =
  process.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxY214ZG5wenBvYXRreWRncW1yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA2NjIzMzIsImV4cCI6MjEwNjIzODMzMn0.UHYGqUPt5PpmKSsxZte-GNfzM5mFer5ShfR6lo4sZ7w'

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)

async function parseBody(req: IncomingMessage): Promise<NotifyRequestBody> {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {})
      } catch (e) {
        reject(e)
      }
    })
  })
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    res.statusCode = 405
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: 'Method not allowed' }))
    return
  }

  try {
    const body = await parseBody(req)
    const { relationshipId, title, body: msgBody, url } = body

    if (!relationshipId) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'Missing relationshipId' }))
      return
    }

    const authHeader = req.headers.authorization || ''
    const token = authHeader.replace(/^Bearer\s+/i, '')

    // Create client using the caller's auth token
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    })

    // Fetch partner's subscriptions via our secure RPC function
    const { data: subs, error } = await supabase.rpc('get_partner_push_subscriptions', {
      p_relationship_id: relationshipId,
    })

    if (error) {
      res.statusCode = 400
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: error.message }))
      return
    }

    const payload = JSON.stringify({
      title: title || 'OURS ♡',
      body: msgBody || 'A new moment was shared in your scrapbook.',
      url: url || '/',
    })

    const results = await Promise.allSettled(
      (subs || []).map((sub: { endpoint: string; p256dh: string; auth: string }) =>
        webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          payload,
        ),
      ),
    )

    const delivered = results.filter((r) => r.status === 'fulfilled').length

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/json')
    res.end(
      JSON.stringify({
        success: true,
        targeted: (subs || []).length,
        delivered,
      }),
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    res.statusCode = 500
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify({ error: message }))
  }
}
