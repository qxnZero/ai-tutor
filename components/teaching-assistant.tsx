"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Bot, User, Minimize2, Maximize2, Send, GraduationCap, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

type Message = {
  role: "user" | "assistant"
  content: string
}

type TeachingAssistantProps = {
  courseId: string
  lessonId: string
  moduleName: string
  lessonName: string
}

export default function TeachingAssistant({ courseId, lessonId, moduleName, lessonName }: TeachingAssistantProps) {
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
        content: `Hi there! I'm your Teaching Assistant for this lesson. I can help explain concepts, answer questions, or provide additional examples. How can I assist you with "${lessonName}" today?`,
      },
    ])
  }, [lessonName])

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
      const response = await fetch("/api/teaching-assistant", {
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
      console.error("Error getting TA response:", error)
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

  const suggestedQuestions = [
    "Can you explain this concept in simpler terms?",
    "What are some real-world applications of this?",
    "Could you provide more examples?",
    "How does this relate to other topics in the course?",
  ]

  return (
    <Card className="border shadow-md h-[calc(100vh-12rem)] flex flex-col bg-card/95 backdrop-blur-sm">
      <CardHeader className="py-3 px-4 flex flex-row items-center justify-between space-y-0 border-b bg-muted/50">
        <div className="flex items-center space-x-2">
          <GraduationCap className="h-5 w-5 text-primary" />
          <div>
            <h3 className="font-medium flex items-center gap-1.5">
              Teaching Assistant <Badge variant="outline" className="text-xs font-normal">Gemini AI</Badge>
            </h3>
            <p className="text-xs text-muted-foreground">Ask questions about this lesson</p>
          </div>
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
                    className={`max-w-[85%] rounded-lg p-3 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === "assistant" && <Bot className="h-5 w-5 mt-0.5 flex-shrink-0 text-primary" />}
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      {message.role === "user" && <User className="h-5 w-5 mt-0.5 flex-shrink-0" />}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Suggested questions (only show after initial greeting) */}
              {messages.length === 1 && (
                <div className="mt-6 space-y-2">
                  <p className="text-xs text-muted-foreground">Try asking:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.map((question, index) => (
                      <Button 
                        key={index} 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => {
                          setInput(question);
                        }}
                      >
                        {question}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          <CardFooter className="p-3 border-t bg-background/50">
            <div className="flex w-full items-center space-x-2">
              <Textarea
                placeholder="Ask your TA anything about this lesson..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="min-h-10 flex-1"
                rows={1}
              />
              <Button 
                size="icon" 
                onClick={handleSendMessage} 
                disabled={isLoading || !input.trim()}
                className="bg-primary/90 hover:bg-primary"
              >
                {isLoading ? (
                  <Sparkles className="h-4 w-4 animate-pulse" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                <span className="sr-only">Send</span>
              </Button>
            </div>
          </CardFooter>
        </>
      )}
    </Card>
  )
}
