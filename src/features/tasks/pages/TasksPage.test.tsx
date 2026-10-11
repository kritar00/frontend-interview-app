import { configureStore } from '@reduxjs/toolkit'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from 'antd'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import tasksReducer from '../store/tasksSlice'
import { TasksPage } from './TasksPage'

function renderPage() {
  const store = configureStore({ reducer: { tasks: tasksReducer } })

  const utils = render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['/tasks']}>
        <App>
          <TasksPage />
        </App>
      </MemoryRouter>
    </Provider>,
  )

  return { store, ...utils }
}

const rows = (container: HTMLElement) =>
  container.querySelectorAll('.ant-table-tbody tr.ant-table-row')

const selectedPageSize = (container: HTMLElement) =>
  container.querySelector('.ant-pagination-options .ant-select-selection-item')
    ?.textContent

const optionTitles = () =>
  Array.from(document.querySelectorAll('.ant-select-item-option')).map((el) =>
    el.getAttribute('title'),
  )

const clickOption = async (user: ReturnType<typeof userEvent.setup>, title: string) => {
  const option = Array.from(
    document.querySelectorAll('.ant-select-item-option'),
  ).find((el) => el.getAttribute('title') === title)
  if (!option) {
    throw new Error(`Option "${title}" not found`)
  }
  await user.click(option as HTMLElement)
}

describe('TasksPage pagination', () => {
  it('moves to the next page instead of snapping back to 1', async () => {
    const user = userEvent.setup()
    const { container } = renderPage()

    const firstRowOnPage1 = rows(container)[0]?.textContent

    await user.click(screen.getByTitle('2'))

    await waitFor(() => {
      expect(
        container.querySelector('.ant-pagination-item-active')?.textContent,
      ).toBe('2')
    })

    expect(rows(container)[0]?.textContent).not.toBe(firstRowOnPage1)
  })

  it('offers 5 / 10 / 15 rows per page and applies the choice', async () => {
    const user = userEvent.setup()
    const { container } = renderPage()

    expect(selectedPageSize(container)).toBe('10 / page')
    expect(rows(container)).toHaveLength(10)

    const sizeSelect = container.querySelector(
      '.ant-pagination-options .ant-select-selector',
    ) as HTMLElement
    await user.click(sizeSelect)

    await waitFor(() => {
      expect(optionTitles()).toEqual(
        expect.arrayContaining(['5 / page', '10 / page', '15 / page']),
      )
    })

    await clickOption(user, '5 / page')

    await waitFor(() => {
      expect(selectedPageSize(container)).toBe('5 / page')
    })
    expect(rows(container)).toHaveLength(5)
  })
})
