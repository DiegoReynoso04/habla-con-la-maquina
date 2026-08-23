'use client'

import { useRef, useState } from 'react'
import { SendIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function MessageInput({
  onSend,
  isLoading,
}: {
  onSend: (text: string) => void
  isLoading: boolean
}) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function submit() {
    const text = value.trim()
    if (!text || isLoading) return
    onSend(text)
    setValue('')
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  return (
    <form
      className="border-t border-border bg-card/60 px-4 py-4 sm:px-8"
      onSubmit={(event) => {
        event.preventDefault()
        submit()
      }}
    >
      <div className="mx-auto flex max-w-3xl items-end gap-3">
        <label htmlFor="chat-input" className="sr-only">
          Mensaje
        </label>
        <textarea
          id="chat-input"
          ref={textareaRef}
          rows={1}
          value={value}
          disabled={isLoading}
          placeholder="Escribe tu mensaje…"
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== 'Enter' || event.shiftKey) return
            if (event.nativeEvent.isComposing || event.keyCode === 229) return
            event.preventDefault()
            submit()
          }}
          className="max-h-40 min-h-11 flex-1 resize-none rounded-lg border border-input bg-background px-3.5 py-3 text-sm leading-relaxed outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/25 disabled:opacity-60"
        />
        <Button type="submit" disabled={isLoading || value.trim().length === 0} className="h-11 px-4">
          <SendIcon className="size-4" aria-hidden="true" />
          {isLoading ? 'Enviando…' : 'Enviar'}
        </Button>
      </div>
      <p className="mx-auto mt-2 max-w-3xl font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        Enter para enviar · Shift + Enter para salto de línea
      </p>
    </form>
  )
}
