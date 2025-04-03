"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Bot, User, Minimize2, Maximize2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"

type Message = {
  role: "user" | "assistant"
  content: string
}

type AIInstructorProps = {
  courseId: string
  lessonId: string
  moduleName: string
  lessonName: string
}

export default function AIInstructor({ courseId, lessonId, moduleName, lessonName }: AIInstructorProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Add initial greeting message
    setMessages([
      {
        role: "assistant",
        content: `Hey, I am your AI instructor. How can I help you today? 👋`,
      },
    ])
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage = input.trim()
    setInput("")
    setIsLoading(true)

    // Add user message to chat
    setMessages((prev) => [...prev, { role: "user", content: userMessage }])

    try {
      const response = await fetch("/api/ai-instructor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          courseId,
          lessonId,
          moduleName,
          lessonName,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Add AI response to chat
      setMessages((prev) => [...prev, { role: "assistant", content: data.response }])
    } catch (error) {
      console.error("Error getting AI response:", error)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <Card className="border shadow-md h-[calc(100vh-12rem)] flex flex-col">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5" />
          <h3 className="font-medium">AI Instructor</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMinimized(!isMinimized)}>
          {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </Button>
      </CardHeader>

      {!isMinimized && (
        <>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === "assistant" && <Bot className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                      <div className="text-sm">{message.content}</div>
                      {message.role === "user" && <User className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <CardFooter className="p-3 border-t">
            <div className="flex w-full items-center space-x-2">
              <Textarea
                placeholder="Ask AI anything about the lesson..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-10 flex-1"
                rows={1}
              />
              <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  )
}

