import type { CSSProperties } from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

export interface Reminder {
  id: string
  title: string
  note?: string
  completed: boolean
  flagged?: boolean
  createdAt: number
}

export interface RemindersSettings {
  title: string
  accentColor: string
  showCompleted: boolean
  showNotes: boolean
  compact: boolean
  showBadge: boolean
}

export type RemindersFilter = 'all' | 'active' | 'completed' | 'flagged'

export interface RemindersWidgetProps {
  title?: string
  initialReminders?: Reminder[]
  storageKey?: string
  theme?: 'light' | 'dark' | 'auto'
  accentColor?: string
  className?: string
  style?: CSSProperties
}

const DEFAULT_SETTINGS: RemindersSettings = {
  title: '提醒事项',
  accentColor: '#0a84ff',
  showCompleted: true,
  showNotes: true,
  compact: false,
  showBadge: true,
}

const DEFAULT_REMINDERS: Reminder[] = [
  { id: 'r-milk', title: '购买牛奶和鸡蛋', note: '顺便买一盒草莓', completed: false, flagged: true, createdAt: 1 },
  { id: 'r-report', title: '完成季度报告', note: '周一之前提交给主管', completed: false, createdAt: 2 },
  { id: 'r-call', title: '给妈妈打电话', completed: false, createdAt: 3 },
  { id: 'r-dentist', title: '预约牙医', completed: true, createdAt: 4 },
  { id: 'r-hike', title: '计划周末徒步', note: '提前查看天气', completed: false, createdAt: 5 },
]

const FILTERS: { id: RemindersFilter, label: string }[] = [
  { id: 'all', label: '全部' },
  { id: 'active', label: '待办' },
  { id: 'completed', label: '已完成' },
  { id: 'flagged', label: '旗标' },
]

const ACCENTS: { name: string, value: string }[] = [
  { name: '蓝色', value: '#0a84ff' },
  { name: '红色', value: '#ff453a' },
  { name: '橙色', value: '#ff9f0a' },
  { name: '绿色', value: '#30d158' },
  { name: '紫色', value: '#bf5af2' },
  { name: '粉色', value: '#ff2d55' },
  { name: '青色', value: '#64d2ff' },
  { name: '靛蓝', value: '#5e5ce6' },
]

const STYLE_ID = 'reminders-widget-style'

const CSS = `
.rw-root {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 220px;
  gap: 10px;
  padding: 12px 14px 10px;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif;
  font-size: 14px;
  color: var(--rw-text);
  background: var(--rw-bg);
  border-radius: var(--rw-radius, 20px);
  overflow: hidden;
}
.rw-root *,
.rw-root *::before,
.rw-root *::after { box-sizing: border-box; }
.rw-root[data-theme="light"],
.rw-root[data-theme="auto"] {
  --rw-bg: #f2f2f7;
  --rw-card: #ffffff;
  --rw-text: #1c1c1e;
  --rw-text-2: #8a8a8e;
  --rw-divider: #e6e6eb;
  --rw-input: #efeff4;
  --rw-track: #e4e4ea;
}
.rw-root[data-theme="dark"] {
  --rw-bg: #1c1c1e;
  --rw-card: #2c2c2e;
  --rw-text: #ffffff;
  --rw-text-2: #98989f;
  --rw-divider: #3a3a3c;
  --rw-input: #2c2c2e;
  --rw-track: #39393d;
}
@media (prefers-color-scheme: dark) {
  .rw-root[data-theme="auto"] {
    --rw-bg: #1c1c1e;
    --rw-card: #2c2c2e;
    --rw-text: #ffffff;
    --rw-text-2: #98989f;
    --rw-divider: #3a3a3c;
    --rw-input: #2c2c2e;
    --rw-track: #39393d;
  }
}
.rw-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
.rw-heading { display: flex; flex-direction: column; gap: 2px; min-width: 0; }
.rw-apptitle {
  margin: 0;
  font-size: clamp(19px, 2.2vw, 28px);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.rw-badge { font-size: 12px; color: var(--rw-text-2); }
.rw-icon-btn {
  flex: none;
  display: grid;
  place-items: center;
  width: 30px;
  height: 30px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--rw-text-2);
  cursor: pointer;
  transition: background .15s ease, color .15s ease;
}
.rw-icon-btn:hover { background: var(--rw-input); color: var(--rw-text); }
.rw-icon-btn svg { width: 17px; height: 17px; display: block; }
.rw-toolbar { display: flex; flex-wrap: wrap; gap: 6px; }
.rw-chip {
  border: none;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  background: var(--rw-input);
  color: var(--rw-text-2);
  cursor: pointer;
  transition: .15s ease;
}
.rw-chip:hover { color: var(--rw-text); }
.rw-chip.is-active { background: var(--rw-accent); color: #fff; }
.rw-list {
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
  background: var(--rw-card);
  border-radius: 14px;
}
.rw-list::-webkit-scrollbar { width: 6px; }
.rw-list::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: color-mix(in srgb, var(--rw-text) 18%, transparent);
}
.rw-item { display: flex; align-items: flex-start; gap: 11px; padding: 11px 12px; position: relative; }
.rw-item + .rw-item { border-top: 1px solid var(--rw-divider); }
.rw-item.is-compact { padding: 7px 12px; }
.rw-check {
  flex: none;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  margin-top: 1px;
  padding: 0;
  border: 1.8px solid var(--rw-accent);
  border-radius: 50%;
  background: transparent;
  color: #fff;
  cursor: pointer;
  transition: background .15s ease;
}
.rw-check:hover { background: color-mix(in srgb, var(--rw-accent) 18%, transparent); }
.rw-check svg { width: 13px; height: 13px; display: block; }
.rw-item.is-completed .rw-check { background: var(--rw-accent); border-color: var(--rw-accent); }
.rw-content { flex: 1 1 auto; display: flex; flex-direction: column; gap: 1px; min-width: 0; }
.rw-item-title {
  margin: 0;
  font-size: 14.5px;
  font-weight: 500;
  line-height: 1.3;
  word-break: break-word;
}
.rw-note {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.3;
  color: var(--rw-text-2);
  word-break: break-word;
}
.rw-item.is-completed .rw-item-title { color: var(--rw-text-2); text-decoration: line-through; }
.rw-actions { flex: none; display: flex; align-items: center; gap: 2px; }
.rw-action {
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--rw-text-2);
  cursor: pointer;
  transition: background .15s ease, color .15s ease, opacity .15s ease;
}
.rw-action:hover { background: var(--rw-input); }
.rw-action svg { width: 15px; height: 15px; display: block; }
.rw-action.is-danger:hover { color: #ff453a; }
.rw-flag { opacity: 0; }
.rw-flag.is-on { opacity: 1; color: #ff9f0a; }
.rw-flag.is-on svg { fill: #ff9f0a; }
.rw-item:hover .rw-flag { opacity: 1; }
.rw-delete { opacity: 0; }
.rw-item:hover .rw-delete,
.rw-item:focus-within .rw-delete { opacity: 1; }
.rw-empty {
  display: grid;
  place-items: center;
  gap: 6px;
  height: 100%;
  min-height: 120px;
  padding: 20px;
  color: var(--rw-text-2);
  font-size: 13px;
  text-align: center;
}
.rw-empty svg { width: 30px; height: 30px; opacity: .5; }
.rw-add { display: flex; align-items: center; gap: 9px; padding: 2px 4px; }
.rw-add-plus { flex: none; display: grid; place-items: center; width: 22px; height: 22px; color: var(--rw-accent); }
.rw-add-plus svg { width: 18px; height: 18px; display: block; }
.rw-input {
  flex: 1 1 auto;
  min-width: 0;
  padding: 6px 0;
  border: none;
  outline: none;
  background: transparent;
  color: var(--rw-text);
  font-size: 14.5px;
  font-family: inherit;
}
.rw-input::placeholder { color: var(--rw-text-2); }
.rw-add-btn {
  flex: none;
  border: none;
  border-radius: 999px;
  padding: 5px 12px;
  font-size: 12.5px;
  font-weight: 600;
  font-family: inherit;
  background: var(--rw-accent);
  color: #fff;
  cursor: pointer;
}
.rw-overlay {
  position: absolute;
  inset: 0;
  z-index: 20;
  display: flex;
  justify-content: flex-end;
  background: rgba(0, 0, 0, .28);
  animation: rw-fade .18s ease;
}
.rw-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: min(300px, 86%);
  height: 100%;
  padding: 14px 16px;
  overflow-y: auto;
  background: var(--rw-card);
  border-left: 1px solid var(--rw-divider);
  animation: rw-slide .22s cubic-bezier(.22, 1, .36, 1);
}
@keyframes rw-fade { from { opacity: 0; } to { opacity: 1; } }
@keyframes rw-slide { from { transform: translateX(24px); opacity: .4; } to { transform: translateX(0); opacity: 1; } }
.rw-panel-head { display: flex; align-items: center; justify-content: space-between; }
.rw-panel-head h2 { margin: 0; font-size: 16px; font-weight: 700; }
.rw-form { display: flex; flex-direction: column; gap: 16px; }
.rw-field { display: flex; flex-direction: column; gap: 7px; }
.rw-field-label { font-size: 12px; font-weight: 600; letter-spacing: .02em; color: var(--rw-text-2); }
.rw-text-input {
  width: 100%;
  padding: 8px 11px;
  border: 1px solid var(--rw-divider);
  border-radius: 9px;
  background: var(--rw-input);
  color: var(--rw-text);
  font-size: 14px;
  font-family: inherit;
  outline: none;
}
.rw-text-input:focus { border-color: var(--rw-accent); }
.rw-swatches { display: flex; flex-wrap: wrap; gap: 9px; }
.rw-swatch {
  width: 26px;
  height: 26px;
  padding: 0;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .08);
  transition: transform .12s ease;
}
.rw-swatch:hover { transform: scale(1.08); }
.rw-swatch.is-active { border-color: var(--rw-text); }
.rw-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
.rw-row-label { font-size: 14px; font-weight: 500; }
.rw-switch {
  position: relative;
  flex: none;
  width: 44px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 999px;
  background: var(--rw-track);
  cursor: pointer;
  transition: background .2s ease;
}
.rw-switch.is-on { background: var(--rw-accent); }
.rw-knob {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, .25);
  transition: transform .2s ease;
}
.rw-switch.is-on .rw-knob { transform: translateX(18px); }
.rw-reset {
  align-self: flex-start;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--rw-accent);
  font-size: 13px;
  font-weight: 600;
  font-family: inherit;
  cursor: pointer;
}
.rw-config { height: auto; min-height: 0; }
`

function useRemindersStyle() {
  useEffect(() => {
    if (document.getElementById(STYLE_ID)) {
      return
    }
    const element = document.createElement('style')
    element.id = STYLE_ID
    element.textContent = CSS
    document.head.appendChild(element)
  }, [])
}

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  }
  catch {
    return fallback
  }
}

function writeStorage<T>(key: string, value: T) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  }
  catch {
    void 0
  }
}

type SetStoredState<T> = (value: T | ((previous: T) => T)) => void

function useStoredState<T>(key: string, initial: T): [T, SetStoredState<T>] {
  const initialRef = useRef(initial)
  const [state, setState] = useState<T>(() => readStorage(key, initialRef.current))

  useEffect(() => {
    initialRef.current = initial
    const stored = readStorage<T | null>(key, null)
    if (stored === null) {
      setState((previous) => (JSON.stringify(previous) === JSON.stringify(initial) ? previous : initial))
    }
  }, [key, initial])

  const setValue = useCallback<SetStoredState<T>>((value) => {
    setState((previous) => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(previous) : value
      writeStorage(key, next)
      return next
    })
  }, [key])

  useEffect(() => {
    const sync = () => {
      const next = readStorage(key, initialRef.current)
      setState((previous) => (JSON.stringify(previous) === JSON.stringify(next) ? previous : next))
    }
    const onStorage = (event: StorageEvent) => {
      if (event.key === key) {
        sync()
      }
    }
    window.addEventListener('storage', onStorage)
    const timer = window.setInterval(sync, 2000)
    return () => {
      window.removeEventListener('storage', onStorage)
      window.clearInterval(timer)
    }
  }, [key])

  return [state, setValue]
}

const uid = () => Math.random().toString(36).slice(2, 10)

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  )
}

function FlagIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 21V4" />
      <path d="M5 4.5h11.5l-2.5 3.5 2.5 3.5H5" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7h16" />
      <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
      <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
    </svg>
  )
}

function GearIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  )
}

function EmptyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

interface SwitchProps {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}

function Switch({ checked, label, onChange }: SwitchProps) {
  return (
    <div className="rw-row">
      <span className="rw-row-label">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={checked ? 'rw-switch is-on' : 'rw-switch'}
        onClick={() => onChange(!checked)}
      >
        <span className="rw-knob" />
      </button>
    </div>
  )
}

interface SettingsFormProps {
  settings: RemindersSettings
  onChange: (patch: Partial<RemindersSettings>) => void
  onReset: () => void
}

export function RemindersSettingsForm({ settings, onChange, onReset }: SettingsFormProps) {
  return (
    <div className="rw-form">
      <div className="rw-field">
        <span className="rw-field-label">列表名称</span>
        <input
          className="rw-text-input"
          value={settings.title}
          placeholder="输入列表名称"
          onChange={(event) => onChange({ title: event.target.value })}
        />
      </div>

      <div className="rw-field">
        <span className="rw-field-label">主题色</span>
        <div className="rw-swatches">
          {ACCENTS.map((accent) => (
            <button
              key={accent.value}
              type="button"
              title={accent.name}
              aria-label={accent.name}
              className={settings.accentColor.toLowerCase() === accent.value ? 'rw-swatch is-active' : 'rw-swatch'}
              style={{ background: accent.value }}
              onClick={() => onChange({ accentColor: accent.value })}
            />
          ))}
        </div>
      </div>

      <div className="rw-field">
        <span className="rw-field-label">显示</span>
        <Switch
          label="显示已完成项"
          checked={settings.showCompleted}
          onChange={(checked) => onChange({ showCompleted: checked })}
        />
        <Switch
          label="显示备注"
          checked={settings.showNotes}
          onChange={(checked) => onChange({ showNotes: checked })}
        />
        <Switch
          label="紧凑模式"
          checked={settings.compact}
          onChange={(checked) => onChange({ compact: checked })}
        />
        <Switch
          label="显示待办数量"
          checked={settings.showBadge}
          onChange={(checked) => onChange({ showBadge: checked })}
        />
      </div>

      <button type="button" className="rw-reset" onClick={onReset}>
        恢复默认设置
      </button>
    </div>
  )
}

export function RemindersConfigView({
  storageKey = 'reminders-widget',
  className,
  style,
}: {
  storageKey?: string
  className?: string
  style?: CSSProperties
}) {
  useRemindersStyle()
  const [settings, setSettings] = useStoredState<RemindersSettings>(`${storageKey}:settings`, DEFAULT_SETTINGS)

  const patch = useCallback((partial: Partial<RemindersSettings>) => {
    setSettings((previous) => ({ ...previous, ...partial }))
  }, [setSettings])

  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [setSettings])

  const rootStyle = {
    '--rw-accent': settings.accentColor,
    ...style,
  } as CSSProperties

  return (
    <div
      data-theme="auto"
      className={['rw-root', 'rw-config', className].filter(Boolean).join(' ')}
      style={rootStyle}
    >
      <header className="rw-header">
        <div className="rw-heading">
          <h1 className="rw-apptitle">提醒事项设置</h1>
          <span className="rw-badge">配置将实时同步到组件</span>
        </div>
      </header>
      <RemindersSettingsForm settings={settings} onChange={patch} onReset={reset} />
    </div>
  )
}

export default function RemindersWidget({
  title,
  initialReminders = DEFAULT_REMINDERS,
  storageKey = 'reminders-widget',
  theme = 'auto',
  accentColor,
  className,
  style,
}: RemindersWidgetProps) {
  useRemindersStyle()

  const [settings, setSettings] = useStoredState<RemindersSettings>(
    `${storageKey}:settings`,
    {
      ...DEFAULT_SETTINGS,
      title: title ?? DEFAULT_SETTINGS.title,
      accentColor: accentColor ?? DEFAULT_SETTINGS.accentColor,
    },
  )
  const [reminders, setReminders] = useStoredState<Reminder[]>(`${storageKey}:items`, initialReminders)
  const [filter, setFilter] = useState<RemindersFilter>('all')
  const [draft, setDraft] = useState('')
  const [draftNote, setDraftNote] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  const toggleComplete = useCallback((id: string) => {
    setReminders((previous) => previous.map((item) => (
      item.id === id ? { ...item, completed: !item.completed } : item
    )))
  }, [setReminders])

  const toggleFlag = useCallback((id: string) => {
    setReminders((previous) => previous.map((item) => (
      item.id === id ? { ...item, flagged: !item.flagged } : item
    )))
  }, [setReminders])

  const removeReminder = useCallback((id: string) => {
    setReminders((previous) => previous.filter((item) => item.id !== id))
  }, [setReminders])

  const addReminder = useCallback(() => {
    const trimmed = draft.trim()
    if (!trimmed) {
      return
    }
    const note = draftNote.trim()
    setReminders((previous) => [
      ...previous,
      // ponytail: note 为空就不写该字段，保持与既有数据结构一致
      note
        ? { id: uid(), title: trimmed, note, completed: false, flagged: false, createdAt: Date.now() }
        : { id: uid(), title: trimmed, completed: false, flagged: false, createdAt: Date.now() },
    ])
    setDraft('')
    setDraftNote('')
  }, [draft, draftNote, setReminders])

  const patchSettings = useCallback((partial: Partial<RemindersSettings>) => {
    setSettings((previous) => ({ ...previous, ...partial }))
  }, [setSettings])

  const resetSettings = useCallback(() => setSettings(DEFAULT_SETTINGS), [setSettings])

  const stats = useMemo(() => {
    const total = reminders.length
    const completed = reminders.filter((item) => item.completed).length
    return { total, completed, remaining: total - completed }
  }, [reminders])

  const visible = useMemo(() => {
    const matched = reminders.filter((item) => {
      if (filter === 'active') {
        return !item.completed
      }
      if (filter === 'completed') {
        return item.completed
      }
      if (filter === 'flagged') {
        return Boolean(item.flagged) && (settings.showCompleted || !item.completed)
      }
      return settings.showCompleted ? true : !item.completed
    })
    return [...matched].sort((a, b) => {
      if (a.completed !== b.completed) {
        return a.completed ? 1 : -1
      }
      return a.createdAt - b.createdAt
    })
  }, [filter, reminders, settings.showCompleted])

  const rootStyle = {
    '--rw-accent': settings.accentColor,
    ...style,
  } as CSSProperties

  return (
    <div
      data-theme={theme}
      className={['rw-root', className].filter(Boolean).join(' ')}
      style={rootStyle}
    >
      <header className="rw-header">
        <div className="rw-heading">
          <h1 className="rw-apptitle">{settings.title}</h1>
          {settings.showBadge && (
            <span className="rw-badge">
              {stats.remaining > 0 ? `${stats.remaining} 项待办` : '全部完成'}
              {stats.remaining > 0 && stats.completed > 0 ? ` · ${stats.completed} 项已完成` : ''}
            </span>
          )}
        </div>
        <button
          type="button"
          className="rw-icon-btn"
          aria-label="设置"
          onClick={() => setShowSettings((value) => !value)}
        >
          <GearIcon />
        </button>
      </header>

      <div className="rw-toolbar">
        {FILTERS.map((item) => (
          <button
            key={item.id}
            type="button"
            className={filter === item.id ? 'rw-chip is-active' : 'rw-chip'}
            onClick={() => setFilter(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      <ul className="rw-list">
        {visible.length === 0
          ? (
              <li className="rw-empty">
                <EmptyIcon />
                <span>{filter === 'completed' ? '还没有已完成的提醒事项' : '暂无提醒事项'}</span>
              </li>
            )
          : visible.map((item) => (
              <li
                key={item.id}
                className={[
                  'rw-item',
                  item.completed ? 'is-completed' : '',
                  item.flagged ? 'is-flagged' : '',
                  settings.compact ? 'is-compact' : '',
                ].filter(Boolean).join(' ')}
              >
                <button
                  type="button"
                  className="rw-check"
                  aria-label={item.completed ? '标记为未完成' : '标记为已完成'}
                  onClick={() => toggleComplete(item.id)}
                >
                  {item.completed && <CheckIcon />}
                </button>
                <div className="rw-content">
                  <p className="rw-item-title">{item.title}</p>
                  {settings.showNotes && item.note && <p className="rw-note">{item.note}</p>}
                </div>
                <div className="rw-actions">
                  <button
                    type="button"
                    className={item.flagged ? 'rw-action rw-flag is-on' : 'rw-action rw-flag'}
                    aria-label={item.flagged ? '取消旗标' : '标记旗标'}
                    onClick={() => toggleFlag(item.id)}
                  >
                    <FlagIcon />
                  </button>
                  <button
                    type="button"
                    className="rw-action rw-delete is-danger"
                    aria-label="删除"
                    onClick={() => removeReminder(item.id)}
                  >
                    <TrashIcon />
                  </button>
                </div>
              </li>
            ))}
      </ul>

      <div className="rw-add">
        <span className="rw-add-plus"><PlusIcon /></span>
        <input
          className="rw-input"
          value={draft}
          placeholder="新增提醒事项"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            // ponytail: IME 合成中（中文选词）的 Enter 必须忽略，否则拼音被当成条目提交
            if (event.nativeEvent.isComposing) {
              return
            }
            if (event.key === 'Enter') {
              addReminder()
            }
          }}
        />
        {draft.trim() && (
          <button type="button" className="rw-add-btn" onClick={addReminder}>
            添加
          </button>
        )}
      </div>
      <div className="rw-add">
        <input
          className="rw-input"
          value={draftNote}
          placeholder="备注（可选）"
          onChange={(event) => setDraftNote(event.target.value)}
          onKeyDown={(event) => {
            if (event.nativeEvent.isComposing) {
              return
            }
            if (event.key === 'Enter') {
              addReminder()
            }
          }}
        />
      </div>

      {showSettings && (
        <div className="rw-overlay" onClick={() => setShowSettings(false)}>
          <div className="rw-panel" onClick={(event) => event.stopPropagation()}>
            <div className="rw-panel-head">
              <h2>设置</h2>
              <button type="button" className="rw-icon-btn" aria-label="关闭" onClick={() => setShowSettings(false)}>
                <CloseIcon />
              </button>
            </div>
            <RemindersSettingsForm settings={settings} onChange={patchSettings} onReset={resetSettings} />
          </div>
        </div>
      )}
    </div>
  )
}