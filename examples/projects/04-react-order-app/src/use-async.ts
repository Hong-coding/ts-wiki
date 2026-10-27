// 비동기 데이터를 불러와 AsyncState로 관리하는 커스텀 훅입니다.
import { useCallback, useEffect, useState } from 'react'
import { errorMessage } from './api'
import type { AsyncState } from './types'

/**
 * load 함수를 처음 한 번 실행하고, 결과를 AsyncState로 돌려줍니다.
 * reload를 부르면 다시 불러옵니다.
 * load는 컴포넌트 밖에 선언한 함수(fetchProducts 등)를 넘겨야 무한 반복되지 않습니다.
 */
export function useAsync<T>(load: () => Promise<T>): { state: AsyncState<T>; reload: () => void } {
  const [state, setState] = useState<AsyncState<T>>({ status: 'idle' })
  // reload를 부를 때마다 숫자를 올려 useEffect를 다시 실행시킵니다.
  const [version, setVersion] = useState(0)

  useEffect(() => {
    // 응답이 오기 전에 컴포넌트가 사라지거나 다시 요청하면, 늦게 온 응답은 버립니다.
    let ignore = false
    setState({ status: 'loading' })
    load()
      .then((data) => {
        if (!ignore) setState({ status: 'success', data })
      })
      .catch((error: unknown) => {
        if (!ignore) setState({ status: 'error', message: errorMessage(error) })
      })
    return () => {
      ignore = true
    }
  }, [load, version])

  const reload = useCallback(() => setVersion((v) => v + 1), [])
  return { state, reload }
}
