declare module 'vtex.styleguide' {
  import type { ChangeEvent, ComponentType, FocusEvent, MouseEventHandler, ReactNode } from 'react'

  export interface ButtonProps {
    children?: ReactNode
    isLoading?: boolean
    onClick?: MouseEventHandler<HTMLButtonElement>
    size?: 'regular' | 'small' | 'large'
    variation?: 'primary' | 'secondary' | 'tertiary' | 'danger'
    type?: 'button' | 'submit' | 'reset'
    block?: boolean
    disabled?: boolean
  }

  export interface InputProps {
    label?: string
    name?: string
    value?: string | number
    defaultValue?: string | number
    type?: string
    placeholder?: string
    required?: boolean
    disabled?: boolean
    readOnly?: boolean
    error?: boolean
    errorMessage?: string
    helpText?: ReactNode
    onChange?: (event: ChangeEvent<HTMLInputElement>) => void
    onFocus?: (event: FocusEvent<HTMLInputElement>) => void
    onBlur?: (event: FocusEvent<HTMLInputElement>) => void
    prefix?: ReactNode
    suffix?: ReactNode
    autoFocus?: boolean
    size?: 'small' | 'regular' | 'large'
  }

  export interface AlertProps {
    type?: 'success' | 'error' | 'warning' | 'info'
    children?: ReactNode
    onClose?: () => void
    action?: {
      label: string
      onClick: () => void
    }
  }

  export interface TablePaginationProps {
    onNextClick: () => void
    onPrevClick: () => void
    onRowsChange?: (event: unknown, value: string) => void
    currentItemFrom: number
    currentItemTo: number
    textOf?: string
    textShowRows?: string
    totalItems: number
    rowsOptions?: number[]
  }

  export interface TableColumnSchema<T = any> {
    title: string
    width?: number
    minWidth?: number
    headerRight?: boolean
    cellRenderer?: (params: {
      cellData: any
      rowData: T
      dataIndex: number
    }) => ReactNode
  }

  export interface TableSchema<T = any> {
    properties: Record<string, TableColumnSchema<T>>
  }

  export interface TableProps<T = Record<string, unknown>> {
    density?: 'low' | 'medium' | 'high'
    emptyStateLabel?: string
    fullWidth?: boolean
    loading?: boolean
    items: T[]
    schema: TableSchema<T>
    pagination?: TablePaginationProps
    [key: string]: unknown
  }

  export interface SpinnerProps {
    size?: number
    color?: string
  }

  export const Button: ComponentType<ButtonProps>
  export const Input: ComponentType<InputProps>
  export const Alert: ComponentType<AlertProps>
  export const Table: ComponentType<TableProps<any>>
  export const Spinner: ComponentType<SpinnerProps>
}