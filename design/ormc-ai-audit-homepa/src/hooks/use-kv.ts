import { useState, useEffect, useCallback } from 'react'
import seedData from '@/data/seed-data.json'

const KV_PREFIX = 'spark-kv:'
const SEED_LOADED_KEY = 'spark-kv:__seed_loaded__'

/** Load seed-data.json into localStorage (runs once per browser). */
function ensureSeedData() {
  if (localStorage.getItem(SEED_LOADED_KEY)) return
  for (const [key, value] of Object.entries(seedData)) {
    const storageKey = `${KV_PREFIX}${key}`
    if (localStorage.getItem(storageKey) === null) {
      localStorage.setItem(storageKey, JSON.stringify(value))
    }
  }
  localStorage.setItem(SEED_LOADED_KEY, '1')
}

// Run once at module load time
ensureSeedData()

/**
 * A localStorage-backed replacement for @github/spark's useKV hook.
 * Provides the same API: [value, setValue, deleteValue]
 */
export function useKV<T = string>(
  key: string,
  initialValue?: T
): readonly [T | undefined, (newValue: T | ((oldValue?: T) => T)) => void, () => void] {
  const storageKey = `${KV_PREFIX}${key}`

  const [value, setValueState] = useState<T | undefined>(() => {
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored !== null) {
        return JSON.parse(stored) as T
      }
    } catch {
      // ignore parse errors
    }
    return initialValue
  })

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const handler = (e: StorageEvent) => {
      if (e.key === storageKey) {
        try {
          setValueState(e.newValue !== null ? JSON.parse(e.newValue) : initialValue)
        } catch {
          setValueState(initialValue)
        }
      }
    }
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [storageKey, initialValue])

  const setValue = useCallback(
    (newValue: T | ((oldValue?: T) => T)) => {
      setValueState((prev) => {
        const resolved =
          typeof newValue === 'function'
            ? (newValue as (oldValue?: T) => T)(prev)
            : newValue
        try {
          localStorage.setItem(storageKey, JSON.stringify(resolved))
        } catch {
          // storage full – silently fail
        }
        return resolved
      })
    },
    [storageKey]
  )

  const deleteValue = useCallback(() => {
    localStorage.removeItem(storageKey)
    setValueState(initialValue)
  }, [storageKey, initialValue])

  return [value, setValue, deleteValue] as const
}
