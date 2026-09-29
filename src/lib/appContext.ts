import { useOutletContext } from 'react-router-dom'
import type { Profile, Relationship } from './relationship'

export type AppContext = {
  relationship: Relationship
  me: Profile
  partner: Profile | null
  refresh: () => void
}

export const useApp = () => useOutletContext<AppContext>()
