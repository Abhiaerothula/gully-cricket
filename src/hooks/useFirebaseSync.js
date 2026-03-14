import { useEffect, useMemo, useRef } from 'react'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { db, firebaseEnabled } from '../lib/firebase.js'

export function useFirebaseSync({ uid, matches, setMatches, teamsDB, setTeamsDB, tournaments, setTournaments }) {
  const applyingRemoteRef = useRef(false)
  const initializedRef = useRef(false)

  const payload = useMemo(() => ({
    matches,
    teamsDB,
    tournaments,
  }), [matches, teamsDB, tournaments])

  useEffect(() => {
    if (!firebaseEnabled || !db || !uid) return

    const stateRef = doc(db, 'users', uid, 'app', 'state')
    const unsub = onSnapshot(stateRef, (snap) => {
      if (!snap.exists()) {
        initializedRef.current = true
        return
      }
      const remote = snap.data() || {}
      applyingRemoteRef.current = true
      if (Array.isArray(remote.matches)) setMatches(remote.matches)
      if (remote.teamsDB && typeof remote.teamsDB === 'object') setTeamsDB(remote.teamsDB)
      if (Array.isArray(remote.tournaments)) setTournaments(remote.tournaments)
      applyingRemoteRef.current = false
      initializedRef.current = true
    })

    return () => unsub()
  }, [uid, setMatches, setTeamsDB, setTournaments])

  useEffect(() => {
    if (!firebaseEnabled || !db || !uid) return
    if (!initializedRef.current) return
    if (applyingRemoteRef.current) return

    const stateRef = doc(db, 'users', uid, 'app', 'state')
    setDoc(
      stateRef,
      {
        ...payload,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    ).catch(() => {})
  }, [uid, payload])
}
