import type { WidgetThemeOption } from '@widget-js/react'
import { useEffect } from 'react'
import { useWidgetStorage, useWidgetTheme, WidgetThemeForm, Window } from '@widget-js/react'
import { Button } from '@/components/ui/button'
import {
  Field,
  FieldContent,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { rlog } from '@/utils/renderer-log'
import { DEFAULT_SETTINGS, type RemindersSettings } from './reminders-widget-view'

const remindersThemeOption: WidgetThemeOption = {
  useGlobalTheme: true,
  borderRadius: true,
  backgroundColor: true,
  backgroundBorderColor: true,
  primaryColor: true,
  color: true,
} as const

export default function RemindersConfigView() {
  const { widgetTheme, setWidgetTheme } = useWidgetTheme()
  const [settings, setSettings] = useWidgetStorage<RemindersSettings>('settings', DEFAULT_SETTINGS)
  const [debugEnabled, setDebugEnabled] = useWidgetStorage<boolean>('debug-enabled', false)

  useEffect(() => {
    rlog('config: mounted settings=', JSON.stringify(settings), 'debugEnabled=', debugEnabled)
  }, [])

  return (
    <Window
      title={settings.title}
      footer={(
        <div className="flex flex-wrap justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => window.close()}>
            应用
          </Button>
          <Button type="button" onClick={() => window.close()}>
            保存并关闭
          </Button>
        </div>
      )}
    >
      <Tabs defaultValue="content" className="gap-4">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="content">组件设置</TabsTrigger>
          <TabsTrigger value="theme">主题设置</TabsTrigger>
        </TabsList>

        <TabsContent
          value="content"
          className="rounded-xl border bg-card p-6 shadow-sm"
        >
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="reminders-title" className="shrink-0 whitespace-nowrap md:justify-start">
                  列表名称
                </FieldLabel>
              </FieldContent>
              <Input
                className="w-32"
                id="reminders-title"
                value={settings.title}
                placeholder="输入列表名称"
                onChange={event => setSettings({ ...settings, title: event.target.value })}
              />
            </Field>

            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="reminders-show-completed" className="shrink-0 whitespace-nowrap md:justify-start">
                  显示已完成项
                </FieldLabel>
              </FieldContent>
              <Switch
                id="reminders-show-completed"
                checked={settings.showCompleted}
                onCheckedChange={checked => setSettings({ ...settings, showCompleted: checked })}
              />
            </Field>

            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="reminders-show-notes" className="shrink-0 whitespace-nowrap md:justify-start">
                  显示备注
                </FieldLabel>
              </FieldContent>
              <Switch
                id="reminders-show-notes"
                checked={settings.showNotes}
                onCheckedChange={checked => setSettings({ ...settings, showNotes: checked })}
              />
            </Field>

            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="reminders-compact" className="shrink-0 whitespace-nowrap md:justify-start">
                  紧凑模式
                </FieldLabel>
              </FieldContent>
              <Switch
                id="reminders-compact"
                checked={settings.compact}
                onCheckedChange={checked => setSettings({ ...settings, compact: checked })}
              />
            </Field>

            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="reminders-show-badge" className="shrink-0 whitespace-nowrap md:justify-start">
                  显示待办数量
                </FieldLabel>
              </FieldContent>
              <Switch
                id="reminders-show-badge"
                checked={settings.showBadge}
                onCheckedChange={checked => setSettings({ ...settings, showBadge: checked })}
              />
            </Field>

            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="reminders-debug" className="shrink-0 whitespace-nowrap md:justify-start">
                  调试模式（开发者）
                </FieldLabel>
              </FieldContent>
              <Switch
                id="reminders-debug"
                checked={debugEnabled}
                onCheckedChange={setDebugEnabled}
              />
            </Field>
          </FieldGroup>
        </TabsContent>

        <TabsContent
          value="theme"
          className="rounded-xl border bg-card p-6 shadow-sm"
        >
          <WidgetThemeForm
            showSectionHeader={false}
            themeOption={remindersThemeOption}
            value={widgetTheme}
            onChange={setWidgetTheme}
          />
        </TabsContent>
      </Tabs>
    </Window>
  )
}