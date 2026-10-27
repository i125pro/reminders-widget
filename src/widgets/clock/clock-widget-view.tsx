import { useWidget, useWidgetStorage, WidgetWrapper } from '@widget-js/react'
import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'

const ClockSection = styled.section`
  display: grid;
  place-items: center;
  gap: 10px;
  width: 100%;
  height: 100%;
  padding: 24px;
  color: var(--widget-color);
  text-align: center;
  user-select: none;
`

const Eyebrow = styled.p`
  margin: 0;
  color: color-mix(in srgb, var(--widget-primary-color, #4ed6ff) 70%, white);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`

const Title = styled.h1`
  margin: 0;
  font-size: clamp(18px, 2vw, 26px);
  font-weight: 700;
`

const TimeText = styled.div`
  font-size: clamp(28px, 3.4vw, 46px);
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.04em;
`

const DateText = styled.p`
  margin: 0;
  color: color-mix(in srgb, var(--widget-color, #fff) 72%, transparent);
  font-size: 12px;
`

export default function ClockWidgetView() {
  /*
    useWidget 是 Widget.js React 组件里最常用的宿主 Hook。
    它用于读取当前小组件的运行时上下文，例如：
    - widgetParams：当前组件的参数、id、标题、语言等宿主下发信息
    - language：应用/宿主当前语言
    也可以拿到主题、尺寸、保存能力等宿主相关状态。
    简单理解：它负责把“当前这个 widget 运行环境的信息”提供给组件。
  */
  const { widgetParams, language } = useWidget()
  /*
    useWidgetStorage 用来给“当前 widget 实例”读写本地持久化数据。
    它底层会把传入的 key 和当前 widget 的 id 组合起来，因此：
    - 不同组件实例之间的数据彼此隔离
    - 刷新、重开后之前保存的值还能继续读取
    这里分别保存了标题、24 小时制开关、是否显示秒数。
  */
  const [title] = useWidgetStorage('title', 'Clock')
  const [use24Hour] = useWidgetStorage('use-24-hour', true)
  const [showSeconds] = useWidgetStorage('show-seconds', true)
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date())
    }, 1000)

    return () => {
      window.clearInterval(timer)
    }
  }, [])

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

  const locale = widgetParams.lang ?? language ?? 'zh-CN'

  const timeText = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      hour: '2-digit',
      minute: '2-digit',
      second: showSeconds ? '2-digit' : undefined,
      hour12: !use24Hour,
    }).format(now)
  }, [locale, now, showSeconds, use24Hour])

  const dateText = useMemo(() => {
    return new Intl.DateTimeFormat(locale, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }).format(now)
  }, [locale, now])

  return (
    <WidgetWrapper>
      <ClockSection>
        <Eyebrow>{widgetParams.title ?? 'WidgetJS React'}</Eyebrow>
        <Title>{title}</Title>
        <TimeText>{timeText}</TimeText>
        <DateText>{dateText}</DateText>
      </ClockSection>
    </WidgetWrapper>
  )
}
