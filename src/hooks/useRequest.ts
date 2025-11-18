/**
 * 请求 Hook
 */

import { useState, useCallback } from 'react'

interface UseRequestOptions<T> {
  manual?: boolean
  defaultData?: T
  onSuccess?: (data: T) => void
  onError?: (error: Error) => void
}

interface UseRequestResult<T, P extends any[]> {
  data: T | undefined
  loading: boolean
  error: Error | undefined
  run: (...params: P) => Promise<T>
  refresh: () => Promise<T>
  mutate: (data: T) => void
}

export function useRequest<T, P extends any[] = any[]>(
  service: (...params: P) => Promise<T>,
  options: UseRequestOptions<T> = {}
): UseRequestResult<T, P> {
  const { manual = false, defaultData, onSuccess, onError } = options

  const [data, setData] = useState<T | undefined>(defaultData)
  const [loading, setLoading] = useState(!manual)
  const [error, setError] = useState<Error | undefined>()
  const [params, setParams] = useState<P>()

  const run = useCallback(async (...args: P) => {
    setLoading(true)
    setError(undefined)
    setParams(args)

    try {
      const result = await service(...args)
      setData(result)
      onSuccess?.(result)
      return result
    } catch (err: any) {
      setError(err)
      onError?.(err)
      throw err
    } finally {
      setLoading(false)
    }
  }, [service, onSuccess, onError])

  const refresh = useCallback(async () => {
    if (params) {
      return run(...params)
    }
    return run(...([] as unknown as P))
  }, [run, params])

  const mutate = useCallback((newData: T) => {
    setData(newData)
  }, [])

  return {
    data,
    loading,
    error,
    run,
    refresh,
    mutate
  }
}

export default useRequest
