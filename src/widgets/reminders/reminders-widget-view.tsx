import { useCallback, useEffect, useMemo, useState } from 'react'
import { BrowserWindowApi, DeployedWidgetApi, WidgetPackageApi } from '@widget-js/core'
import { useWidget, useWidgetStorage, WidgetWrapper } from '@widget-js/react'
import styled from 'styled-components'
import { collectSnapshot, getErrorCount, parseRoute, rerror, rlog, safeSerialize } from '@/utils/renderer-log'

interface Reminder {
  id: string
  title: string
  note?: string
  completed: boolean
  flagged?: boolean
  createdAt: number
}

export interface RemindersSettings {
  title: string
  showCompleted: boolean
  showNotes: boolean
  compact: boolean
  showBadge: boolean
}

type RemindersFilter = 'all' | 'active' | 'completed' | 'flagged'

export const PACKAGE_NAME = 'com.github.reminders'
export const PREVIEW_IMAGE = '/preview_reminders.png'

export const DEFAULT_SETTINGS: RemindersSettings = {
  title: '提醒事项',
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

const uid = () => Math.random().toString(36).slice(2, 10)

function buildPreviewUrl(indexUrl: string | null, previewImage: string): string {
  if (!indexUrl) {
    return previewImage
  }
  try {
    if (/^[a-z]+:\/\//i.test(indexUrl)) {
      return new URL(previewImage, indexUrl).href
    }
  }
  catch {
    void 0
  }
  const base = indexUrl.replace(/index\.html?$/i, '').replace(/\/?$/, '/')
  return base + previewImage.replace(/^\//, '')
}

const Root = styled.section`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  height: 100%;
  padding: 14px 16px 12px;
  box-sizing: border-box;
  color: var(--widget-color, #fff);
  -webkit-user-select: none;
  user-select: none;
`

const Header = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
`

const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
`

const AppTitle = styled.h1`
  margin: 0;
  font-size: clamp(18px, 2.1vw, 26px);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`

const Badge = styled.span`
  font-size: 12px;
  opacity: 0.6;
`

const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const Chip = styled.button<{ $active: boolean }>`
  border: none;
  border-radius: 999px;
  padding: 5px 12px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.15s ease;
  background: ${props => (props.$active ? 'var(--widget-primary-color, #0a84ff)' : 'color-mix(in srgb, var(--widget-color, #fff) 10%, transparent)')};
  color: ${props => (props.$active ? '#fff' : 'inherit')};
  opacity: ${props => (props.$active ? 1 : 0.72)};

  &:hover {
    opacity: 1;
  }
`

const List = styled.ul`
  flex: 1 1 auto;
  min-height: 0;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-y: auto;
  border-radius: 14px;
  background: color-mix(in srgb, var(--widget-color, #fff) 8%, transparent);

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: color-mix(in srgb, var(--widget-color, #fff) 22%, transparent);
  }
`

const Item = styled.li<{ $compact: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 11px;
  padding: ${props => (props.$compact ? '7px 12px' : '11px 12px')};
  position: relative;

  & + & {
    border-top: 1px solid color-mix(in srgb, var(--widget-color, #fff) 12%, transparent);
  }

  &:hover .rw-flag,
  &:focus-within .rw-flag,
  &:hover .rw-delete,
  &:focus-within .rw-delete {
    opacity: 1;
  }
`

const CheckButton = styled.button<{ $done: boolean }>`
  flex: none;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  margin-top: 1px;
  padding: 0;
  border: 1.8px solid var(--widget-primary-color, #0a84ff);
  border-radius: 50%;
  color: #fff;
  cursor: pointer;
  transition: background 0.15s ease;
  background: ${props => (props.$done ? 'var(--widget-primary-color, #0a84ff)' : 'transparent')};

  svg {
    width: 13px;
    height: 13px;
    display: block;
  }

  &:hover {
    background: color-mix(in srgb, var(--widget-primary-color, #0a84ff) 22%, transparent);
  }
`

const Content = styled.div`
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
`

const ItemTitle = styled.p<{ $done: boolean }>`
  margin: 0;
  font-size: 14.5px;
  font-weight: 500;
  line-height: 1.3;
  word-break: break-word;
  ${props => (props.$done ? 'opacity: 0.55; text-decoration: line-through;' : '')}
`

const Note = styled.p`
  margin: 0;
  font-size: 12.5px;
  line-height: 1.3;
  opacity: 0.6;
  word-break: break-word;
`

const Actions = styled.div`
  flex: none;
  display: flex;
  align-items: center;
  gap: 2px;
`

const ActionButton = styled.button`
  display: grid;
  place-items: center;
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.15s ease, color 0.15s ease;

  svg {
    width: 15px;
    height: 15px;
    display: block;
  }
`

const FlagButton = styled(ActionButton)`
  &.is-on {
    opacity: 1;
    color: #ff9f0a;
  }
`

const DeleteButton = styled(ActionButton)`
  &:hover {
    color: #ff453a;
  }
`

const Empty = styled.li`
  display: grid;
  place-items: center;
  gap: 6px;
  height: 100%;
  min-height: 120px;
  padding: 20px;
  font-size: 13px;
  text-align: center;
  opacity: 0.6;

  svg {
    width: 30px;
    height: 30px;
  }
`

const AddRow = styled.div`
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 2px 4px;
`

const AddPlus = styled.span`
  flex: none;
  display: grid;
  place-items: center;
  width: 22px;
  height: 22px;
  color: var(--widget-primary-color, #0a84ff);

  svg {
    width: 18px;
    height: 18px;
    display: block;
  }
`

const TextInput = styled.input`
  flex: 1 1 auto;
  min-width: 0;
  padding: 6px 0;
  border: none;
  outline: none;
  background: transparent;
  color: inherit;
  font-family: inherit;
  font-size: 14.5px;

  &::placeholder {
    color: currentColor;
    opacity: 0.4;
  }
`

const AddButton = styled.button`
  flex: none;
  border: none;
  border-radius: 999px;
  padding: 5px 12px;
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  background: var(--widget-primary-color, #0a84ff);
  color: #fff;
`

const DebugBadge = styled.div`
  position: absolute;
  right: 8px;
  bottom: 8px;
  z-index: 50;
  padding: 4px 8px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.55);
  color: #fff;
  font-size: 10px;
  line-height: 1.4;
  letter-spacing: 0.02em;
  white-space: pre-wrap;
  pointer-events: none;
`

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12.5l4.5 4.5L19 7" />
    </svg>
  )
}

function FlagIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
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

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
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

export default function RemindersWidgetView() {
  const { widgetParams } = useWidget()
  const [settings] = useWidgetStorage<RemindersSettings>('settings', {
    ...DEFAULT_SETTINGS,
    title: widgetParams.title || DEFAULT_SETTINGS.title,
  })
  const [reminders, setReminders] = useWidgetStorage<Reminder[]>('items', DEFAULT_REMINDERS)
  const [debugEnabled] = useWidgetStorage<boolean>('debug-enabled', false)
  const [filter, setFilter] = useState<RemindersFilter>('all')
  const [draft, setDraft] = useState('')
  const [debugDeployedCount, setDebugDeployedCount] = useState<number | null>(null)

  useEffect(() => {
    const previousHtmlBackground = document.documentElement.style.background
    const previousBodyBackground = document.body.style.background

    document.documentElement.style.background = 'transparent'
    document.body.style.background = 'transparent'

    return () => {
      document.documentElement.style.background = previousHtmlBackground
      document.body.style.background = previousBodyBackground
    }
  }, [])

  useEffect(() => {
    rlog('view: mounted href=', window.location.href)
    rlog('view: route parse=', JSON.stringify(parseRoute()))
    rlog('view: widgetParams=', JSON.stringify(widgetParams))
    rlog('view: settings=', JSON.stringify(settings))
    rlog('view: reminders=', JSON.stringify(reminders))
    rlog('view: mount snapshot=', JSON.stringify(collectSnapshot()))
    return () => {
      rlog('view: unmounted')
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const indexUrl = await WidgetPackageApi.getIndexUrl(PACKAGE_NAME)
        const previewUrl = buildPreviewUrl(indexUrl, PREVIEW_IMAGE)
        if (!cancelled) {
          rlog('view: preview diagnosis indexUrl=', indexUrl, 'previewImage=', PREVIEW_IMAGE, 'previewUrl=', previewUrl)
        }
      }
      catch (error) {
        rerror('view: preview diagnosis failed=', safeSerialize(error))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!debugEnabled) {
      return
    }
    let cancelled = false
    void (async () => {
      try {
        await BrowserWindowApi.openDevTools()
      }
      catch (error) {
        rerror('view: openDevTools failed=', safeSerialize(error))
      }
      try {
        const indexUrl = await WidgetPackageApi.getIndexUrl(PACKAGE_NAME)
        const pkg = await WidgetPackageApi.getPackage(PACKAGE_NAME)
        const deployed = await DeployedWidgetApi.getDeployedWidgets(PACKAGE_NAME)
        if (!cancelled) {
          setDebugDeployedCount(deployed.length)
        }
        rlog(
          'view: debug snapshot=',
          JSON.stringify(collectSnapshot({
            indexUrl,
            previewUrl: buildPreviewUrl(indexUrl, PREVIEW_IMAGE),
            packageVersion: (pkg as unknown as { version?: string } | undefined)?.version ?? '(none)',
            deployedCount: deployed.length,
            deployedNames: deployed.map(item => (item as unknown as { name?: string }).name ?? '(unknown)'),
          })),
        )
      }
      catch (error) {
        rerror('view: debug snapshot failed=', safeSerialize(error))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [debugEnabled])

  const toggleComplete = useCallback((id: string) => {
    setReminders(reminders.map(item => (
      item.id === id ? { ...item, completed: !item.completed } : item
    )))
  }, [reminders, setReminders])

  const toggleFlag = useCallback((id: string) => {
    setReminders(reminders.map(item => (
      item.id === id ? { ...item, flagged: !item.flagged } : item
    )))
  }, [reminders, setReminders])

  const removeReminder = useCallback((id: string) => {
    setReminders(reminders.filter(item => item.id !== id))
  }, [reminders, setReminders])

  const addReminder = useCallback(() => {
    const trimmed = draft.trim()
    if (!trimmed) {
      return
    }
    setReminders([
      ...reminders,
      { id: uid(), title: trimmed, completed: false, flagged: false, createdAt: Date.now() },
    ])
    setDraft('')
  }, [draft, reminders, setReminders])

  const stats = useMemo(() => {
    const total = reminders.length
    const completed = reminders.filter(item => item.completed).length
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
        return Boolean(item.flagged) && !item.completed
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

  useEffect(() => {
    rlog('view: render count visible=', visible.length, 'total=', reminders.length)
  }, [visible.length, reminders.length])

  return (
    <WidgetWrapper>
      <Root>
        <Header>
          <Heading>
            <AppTitle>{settings.title}</AppTitle>
            {settings.showBadge && (
              <Badge>
                {stats.remaining > 0 ? `${stats.remaining} 项待办` : '全部完成'}
                {stats.remaining > 0 && stats.completed > 0 ? ` · ${stats.completed} 项已完成` : ''}
              </Badge>
            )}
          </Heading>
        </Header>

        <Toolbar>
          {FILTERS.map(item => (
            <Chip
              key={item.id}
              type="button"
              $active={filter === item.id}
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </Chip>
          ))}
        </Toolbar>

        <List>
          {visible.length === 0
            ? (
                <Empty>
                  <EmptyIcon />
                  <span>{filter === 'completed' ? '还没有已完成的提醒事项' : '暂无提醒事项'}</span>
                </Empty>
              )
            : visible.map(item => (
                <Item key={item.id} $compact={settings.compact}>
                  <CheckButton
                    type="button"
                    $done={item.completed}
                    aria-label={item.completed ? '标记为未完成' : '标记为已完成'}
                    onClick={() => toggleComplete(item.id)}
                  >
                    {item.completed && <CheckIcon />}
                  </CheckButton>
                  <Content>
                    <ItemTitle $done={item.completed}>{item.title}</ItemTitle>
                    {settings.showNotes && item.note && <Note>{item.note}</Note>}
                  </Content>
                  <Actions>
                    <FlagButton
                      type="button"
                      className={item.flagged ? 'rw-flag is-on' : 'rw-flag'}
                      aria-label={item.flagged ? '取消旗标' : '标记旗标'}
                      onClick={() => toggleFlag(item.id)}
                    >
                      <FlagIcon filled={Boolean(item.flagged)} />
                    </FlagButton>
                    <DeleteButton
                      type="button"
                      className="rw-delete"
                      aria-label="删除"
                      onClick={() => removeReminder(item.id)}
                    >
                      <TrashIcon />
                    </DeleteButton>
                  </Actions>
                </Item>
              ))}
        </List>

        <AddRow>
          <AddPlus><PlusIcon /></AddPlus>
          <TextInput
            value={draft}
            placeholder="新增提醒事项"
            onChange={event => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                addReminder()
              }
            }}
          />
          {draft.trim() && (
            <AddButton type="button" onClick={addReminder}>
              添加
            </AddButton>
          )}
        </AddRow>

        {debugEnabled && (
          <DebugBadge>
            {`route: ${parseRoute().path}\nwidgets: ${debugDeployedCount ?? '…'}\nerrors: ${getErrorCount()}`}
          </DebugBadge>
        )}
      </Root>
    </WidgetWrapper>
  )
}