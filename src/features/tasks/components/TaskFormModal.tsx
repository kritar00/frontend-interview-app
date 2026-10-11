import { useEffect } from 'react'
import { App, DatePicker, Form, Input, Modal, Radio, Select } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { useAppDispatch } from '@/app/hooks'
import { addTask, updateTask } from '../store/tasksSlice'
import {
  TASK_PRIORITIES,
  TASK_STATUSES,
  type NewTask,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from '../types'
import { PRIORITY_META, STATUS_META } from '../utils/taskMeta'

interface TaskFormValues {
  title: string
  description?: string | undefined
  status: TaskStatus
  priority: TaskPriority
  assignee?: string | undefined
  dueDate?: Dayjs | null
  tags?: string[]
}

export interface TaskFormModalProps {
  open: boolean
  task?: Task | null
  onCancel: () => void
}

export function TaskFormModal({
  open,
  task = null,
  onCancel,
}: TaskFormModalProps) {
  const dispatch = useAppDispatch()
  const { message } = App.useApp()
  const [form] = Form.useForm<TaskFormValues>()
  const isEditing = task !== null

  useEffect(() => {
    if (!open) {
      return
    }
    if (task) {
      form.setFieldsValue({
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignee: task.assignee,
        dueDate: task.dueDate ? dayjs(task.dueDate) : null,
        tags: task.tags ?? [],
      })
    } else {
      form.resetFields()
      form.setFieldsValue({ status: 'todo', priority: 'medium', tags: [] })
    }
  }, [open, task, form])

  const handleOk = async () => {
    const values = await form.validateFields()

    const payload: NewTask = {
      title: values.title.trim(),
      status: values.status,
      priority: values.priority,
    }
    const description = values.description?.trim()
    const assignee = values.assignee?.trim()
    if (description) {
      payload.description = description
    }
    if (assignee) {
      payload.assignee = assignee
    }
    if (values.dueDate) {
      payload.dueDate = values.dueDate.format('YYYY-MM-DD')
    }
    if (values.tags && values.tags.length > 0) {
      payload.tags = values.tags
    }

    if (task) {
      dispatch(updateTask({ id: task.id, changes: payload }))
      message.success('Task updated')
    } else {
      dispatch(addTask(payload))
      message.success('Task created')
    }
    onCancel()
  }

  return (
    <Modal
      open={open}
      title={isEditing ? 'Edit task' : 'New task'}
      okText={isEditing ? 'Save changes' : 'Create task'}
      onOk={() => void handleOk()}
      onCancel={onCancel}
      width={560}
    >
      <Form form={form} layout="vertical" className="pt-2">
        <Form.Item
          name="title"
          label="Title"
          rules={[
            { required: true, message: 'Please give the task a title' },
            { max: 80, message: 'Keep the title under 80 characters' },
          ]}
        >
          <Input placeholder="e.g. Review the API contract" autoFocus />
        </Form.Item>

        <Form.Item name="description" label="Description">
          <Input.TextArea
            rows={3}
            placeholder="Optional details…"
            maxLength={240}
            showCount
          />
        </Form.Item>

        <div className="grid grid-cols-1 gap-x-4 sm:grid-cols-2">
          <Form.Item name="status" label="Status" rules={[{ required: true }]}>
            <Select
              options={TASK_STATUSES.map((value) => ({
                value,
                label: STATUS_META[value].label,
              }))}
            />
          </Form.Item>

          <Form.Item
            name="priority"
            label="Priority"
            rules={[
              { required: true, message: 'Please choose a priority' },
            ]}
          >
            <Radio.Group
              optionType="button"
              buttonStyle="solid"
              options={TASK_PRIORITIES.map((value) => ({
                value,
                label: PRIORITY_META[value].label,
              }))}
            />
          </Form.Item>

          <Form.Item name="assignee" label="Assignee">
            <Input placeholder="Unassigned" />
          </Form.Item>

          <Form.Item name="dueDate" label="Due date">
            <DatePicker className="w-full" format="DD MMM YYYY" />
          </Form.Item>
        </div>

        <Form.Item name="tags" label="Tags">
          <Select
            mode="tags"
            tokenSeparators={[',']}
            placeholder="Add tags and press Enter"
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
