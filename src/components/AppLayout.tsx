import { useCallback, useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import type { AppContext } from '../lib/appContext'
import { loadMyRelationship, loadProfiles, type Profile, type Relationship } from '../lib/relationship'
import { BottomNavigation, TopBar } from './Navigation'
import { Setup } from './Setup'

type State =
  | { kind: 'loading' }
  | { kind: 'error' }
  | { kind: 'ready'; relationship: Relationship | null; me: Profile | null; partner: Profile | null }

export function AppLayout() {
  const { userId } = useAuth()
  const [state, setState] = useState<State>({ kind: 'loading' })

  const refresh = useCallback(() => {
    if (!userId) return
    ;(async () => {
      const relationship = await loadMyRelationship()
      const ids = relationship ? [relationship.user_a_id, relationship.user_b_id].filter((x): x is string => !!x) : [userId]
      const profiles = await loadProfiles(ids)
      setState({
        kind: 'ready',
        relationship,
        me: profiles.find((p) => p.id === userId) ?? null,
        partner: profiles.find((p) => p.id !== userId) ?? null,
      })
    })().catch(() => setState((s) => (s.kind === 'ready' ? s : { kind: 'error' })))
  }, [userId])

  useEffect(refresh, [refresh])

  // Pick up the partner joining without a manual reload.
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && refresh()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [refresh])

  return (
    <div className="flex min-h-dvh flex-col pb-20 md:pb-0">
      <TopBar />
      <main className="flex flex-1 flex-col">
        {state.kind === 'error' && (
          <p role="alert" className="m-auto px-6 text-center text-muted">
            Couldn't load your story. Check your connection and refresh. If it keeps happening, make sure the
            database migrations have been run.
          </p>
        )}
        {state.kind === 'ready' &&
          (!state.me ? (
            <p role="alert" className="m-auto px-6 text-center text-muted">
              Your profile is missing. Log out and create the account again.
            </p>
          ) : !state.relationship ? (
            <Setup userId={state.me.id} onDone={refresh} />
          ) : (
            <Outlet
              context={
                { relationship: state.relationship, me: state.me, partner: state.partner, refresh } satisfies AppContext
              }
            />
          ))}
      </main>
      <BottomNavigation />
    </div>
  )
}
