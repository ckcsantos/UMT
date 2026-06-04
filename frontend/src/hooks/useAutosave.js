import { useEffect, useRef, useState } from 'react'

// Debounced autosave — calls save(value) after delay ms whenever value changes.
// Skips the initial mount so opening a pre-filled form doesn't trigger a redundant save.
// Returns 'idle' | 'saving' | 'saved'.
export function useAutosave(save, value, delay = 800) {
  const [status, setStatus] = useState('idle')
  const skipFirst = useRef(true)
  const serialized = JSON.stringify(value)

  useEffect(() => {
    if (skipFirst.current) {
      skipFirst.current = false
      return
    }
    setStatus('saving')
    const t = setTimeout(() => {
      save(value)
      setStatus('saved')
    }, delay)
    return () => clearTimeout(t)
  }, [serialized]) // eslint-disable-line react-hooks/exhaustive-deps

  return status
}
