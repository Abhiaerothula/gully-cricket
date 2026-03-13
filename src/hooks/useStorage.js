import { useState, useEffect, useRef } from 'react'

/** localStorage hook with 400ms debounced writes — prevents thrashing on every ball */
export function useStorage(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const s = localStorage.getItem(key)
      return s ? JSON.parse(s) : fallback
    } catch { return fallback }
  })
  const timer = useRef(null)
  useEffect(() => {
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      try { localStorage.setItem(key, JSON.stringify(value)) } catch {}
    }, 400)
    return () => clearTimeout(timer.current)
  }, [key, value])
  return [value, setValue]
}
