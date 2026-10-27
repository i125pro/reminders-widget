import * as React from "react"

import { cn } from "@/lib/utils"

import { Input } from "./input"

const FALLBACK_COLOR = "#000000"
const DEFAULT_PRESETS = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
]

const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

function normalizeHexColor(value: string | undefined, fallback = FALLBACK_COLOR) {
  const trimmed = value?.trim()

  if (!trimmed || !HEX_COLOR_PATTERN.test(trimmed)) {
    return fallback
  }

  if (trimmed.length === 4) {
    const [, r, g, b] = trimmed
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase()
  }

  return trimmed.toLowerCase()
}

function isHexColor(value: string) {
  return HEX_COLOR_PATTERN.test(value.trim())
}

export interface ColorPickerProps extends Omit<React.ComponentProps<"input">, "type" | "value" | "defaultValue" | "onChange"> {
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  presets?: string[]
}

function ColorPicker({
  className,
  value,
  defaultValue,
  onValueChange,
  presets = DEFAULT_PRESETS,
  disabled,
  ...props
}: ColorPickerProps) {
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = React.useState(() => normalizeHexColor(defaultValue))
  const currentValue = isControlled ? normalizeHexColor(value, internalValue) : internalValue
  const [textValue, setTextValue] = React.useState(currentValue)

  React.useEffect(() => {
    setTextValue(currentValue)
  }, [currentValue])

  const commitValue = React.useCallback((nextValue: string) => {
    const normalizedValue = normalizeHexColor(nextValue, currentValue)

    if (!isControlled) {
      setInternalValue(normalizedValue)
    }

    onValueChange?.(normalizedValue)
  }, [currentValue, isControlled, onValueChange])

  const handleTextBlur = React.useCallback(() => {
    if (isHexColor(textValue)) {
      commitValue(textValue)
      return
    }

    setTextValue(currentValue)
  }, [commitValue, currentValue, textValue])

  return (
    <div
      data-slot="color-picker"
      className={cn("flex flex-col gap-3", className)}
    >
      <div className="flex items-center gap-3">
        <label
          className={cn(
            "relative inline-flex size-8 shrink-0 overflow-hidden rounded-lg border border-input bg-background shadow-xs transition-opacity",
            disabled && "opacity-50"
          )}
        >
          <span
            className="pointer-events-none absolute inset-[3px] rounded-md border border-white/20"
            style={{ backgroundColor: currentValue }}
          />
          <input
            aria-label="Pick a color"
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
            disabled={disabled}
            type="color"
            value={currentValue}
            onChange={event => commitValue(event.target.value)}
          />
        </label>

        <Input
          autoCapitalize="off"
          autoComplete="off"
          className="font-mono uppercase"
          disabled={disabled}
          spellCheck={false}
          value={textValue}
          onBlur={handleTextBlur}
          onChange={event => setTextValue(event.target.value)}
          onKeyDown={event => {
            if (event.key !== "Enter") {
              return
            }

            event.preventDefault()

            if (isHexColor(textValue)) {
              commitValue(textValue)
              return
            }

            setTextValue(currentValue)
          }}
          {...props}
        />
      </div>

      {presets.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {presets.map(color => {
            const normalizedColor = normalizeHexColor(color, color)
            const isSelected = normalizedColor === currentValue

            return (
              <button
                key={normalizedColor}
                aria-label={`Use ${normalizedColor}`}
                aria-pressed={isSelected}
                className={cn(
                  "inline-flex size-6 shrink-0 items-center justify-center rounded-md border border-input bg-background p-0.5 transition-all hover:scale-[1.04] focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
                  isSelected && "border-ring ring-2 ring-ring/30"
                )}
                disabled={disabled}
                type="button"
                onClick={() => commitValue(normalizedColor)}
              >
                <span
                  className="size-full rounded-[calc(var(--radius-sm)-2px)] border border-white/20"
                  style={{ backgroundColor: normalizedColor }}
                />
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { ColorPicker }
