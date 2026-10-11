import { useCallback, useState } from 'react'
import type { Task } from '../types'

interface TaskFormState {
  open: boolean
  task: Task | null
}

export function useTaskFormModal() {
  const [state, setState] = useState<TaskFormState>({ open: false, task: null })

  const openCreate = useCallback(() => {
    setState({ open: true, task: null })
  }, [])

  const openEdit = useCallback((task: Task) => {
    setState({ open: true, task })
  }, [])

  const close = useCallback(() => {
    setState({ open: false, task: null })
  }, [])

  return { ...state, openCreate, openEdit, close }
}
