"use client"

import { useState, useEffect, useRef } from "react"

interface TypingEffectProps {
  text: string
  speed?: number
  onComplete?: () => void
}

export function TypingEffect({ text, speed = 20, onComplete }: TypingEffectProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Reset when text changes
    setDisplayedText("")
    setCurrentIndex(0)
    setIsPaused(false)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [text])

  useEffect(() => {
    if (currentIndex >= text.length) {
      if (onComplete) onComplete()
      return
    }

    if (isPaused) return

    intervalRef.current = setInterval(() => {
      const nextChar = text[currentIndex]

      // Pause briefly at punctuation
      if (['.', '!', '?', ',', ';', ':'].includes(nextChar)) {
        setIsPaused(true)
        setTimeout(() => setIsPaused(false), nextChar === ',' ? 150 : 300)
      }

      setDisplayedText(prev => prev + nextChar)
      setCurrentIndex(prev => prev + 1)
    }, speed)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentIndex, isPaused, onComplete, speed, text])

  return <span className="typing-cursor">{displayedText}</span>
}
