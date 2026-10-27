import type { WidgetThemeOption } from '@widget-js/react'
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

const clockThemeOption: WidgetThemeOption = {
  useGlobalTheme: true,
  borderRadius: true,
  backgroundColor: true,
  backgroundBorderColor: true,
  primaryColor: true,
  color: true,
} as const

export default function ClockConfigView() {
  const { widgetTheme, setWidgetTheme } = useWidgetTheme()
  const [title, setTitle] = useWidgetStorage('title', 'Clock')
  const [use24Hour, setUse24Hour] = useWidgetStorage('use-24-hour', true)
  const [showSeconds, setShowSeconds] = useWidgetStorage('show-seconds', true)

  return (
    <Window
      title={title}
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
                <FieldLabel htmlFor="clock-title" className="shrink-0 whitespace-nowrap md:justify-start">
                  标题
                </FieldLabel>
              </FieldContent>
              <Input
                className="w-32"
                id="clock-title"
                value={title}
                placeholder="输入组件标题"
                onChange={event => setTitle(event.target.value)}
              />
            </Field>

            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="clock-24-hour" className="shrink-0 whitespace-nowrap md:justify-start">
                  使用 24 小时制
                </FieldLabel>
              </FieldContent>
              <Switch
                id="clock-24-hour"
                checked={use24Hour}
                onCheckedChange={setUse24Hour}
              />
            </Field>

            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel htmlFor="clock-show-seconds" className="shrink-0 whitespace-nowrap md:justify-start">
                  显示秒钟
                </FieldLabel>
              </FieldContent>
              <Switch
                id="clock-show-seconds"
                checked={showSeconds}
                onCheckedChange={setShowSeconds}
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
            themeOption={clockThemeOption}
            value={widgetTheme}
            onChange={setWidgetTheme}
          />
        </TabsContent>
      </Tabs>
    </Window>
  )
}
