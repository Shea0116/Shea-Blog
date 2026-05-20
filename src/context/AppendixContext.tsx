import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { getAppendixList } from '@/api/posts'
import type { Appendix } from '@/api/types'

interface AppendixContextType {
  appendixList: Appendix[]
  isLoading: boolean
  fetchAppendix: () => Promise<void>
}

const AppendixContext = createContext<AppendixContextType | null>(null)

export function AppendixProvider({ children }: { children: ReactNode }) {
  const [appendixList, setAppendixList] = useState<Appendix[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const fetchAppendix = useCallback(async () => {
    if (appendixList.length > 0) return
    setIsLoading(true)
    try {
      const data = await getAppendixList()
      setAppendixList(data)
    } catch (err) {
      console.error('Failed to fetch appendix:', err)
    } finally {
      setIsLoading(false)
    }
  }, [appendixList.length])

  useEffect(() => {
    fetchAppendix()
  }, [fetchAppendix])

  return (
    <AppendixContext.Provider value={{ appendixList, isLoading, fetchAppendix }}>
      {children}
    </AppendixContext.Provider>
  )
}

export function useAppendix() {
  const context = useContext(AppendixContext)
  if (!context) {
    throw new Error('useAppendix must be used within an AppendixProvider')
  }
  return context
}