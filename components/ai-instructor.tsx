"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { X, Send, Bot, User } from "lucide-react"

type Message = {
  role: "user" | "assistant"
  content: string
}

export default function AIInstructor({
  courseId,
  lessonId,
  onClose,
}: {
  courseId: string
  lessonId?: string
  onClose: () => void
}) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hey, I am your AI instructor. How can I help you today? 🤖",
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sample questions based on the current lesson
  const sampleQuestions = [
    "What is the difference between a class and an object?",
    'Why do we use the "new" keyword when creating objects?',
    "What are instance variables and how do they differ from local variables?",
    "How can I access the attributes of an object?",
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages, isMinimized])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    if (!input.trim()) return

    const userMessage = { role: "user" as const, content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      // In a real implementation, this would call your API
      // For now, we'll simulate a response
      setTimeout(() => {
        const assistantMessage = {
          role: "assistant" as const,
          content: generateResponse(input, lessonId),
        }
        setMessages((prev) => [...prev, assistantMessage])
        setIsLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error sending message:", error)
      setIsLoading(false)
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ])
    }
  }

  const handleSampleQuestion = (question: string) => {
    setInput(question)
  }

  // Simple response generator for demo purposes
  const generateResponse = (question: string, lessonId?: string): string => {
    const lowerQuestion = question.toLowerCase()

    if (lowerQuestion.includes("class") && lowerQuestion.includes("object")) {
      return "A class is a blueprint or template that defines the structure and behavior of objects. An object is an instance of a class - it's a concrete entity created from the class template with its own state (attributes) and behavior (methods)."
    }

    if (lowerQuestion.includes("new keyword")) {
      return 'The "new" keyword in Java is used to create instances (objects) of a class. It allocates memory for the new object, calls the constructor to initialize the object, and returns a reference to the newly created object.'
    }

    if (lowerQuestion.includes("instance variable") || lowerQuestion.includes("local variable")) {
      return "Instance variables are declared within a class but outside any method, and they represent the state of an object. Each object has its own copy of instance variables. Local variables, on the other hand, are declared within a method and exist only within the scope of that method."
    }

    if (lowerQuestion.includes("access") && lowerQuestion.includes("attribute")) {
      return "You can access the attributes (instance variables) of an object using the dot notation: objectName.attributeName. If the attribute is private, you would need to use getter methods (e.g., object.getAttribute())."
    }

    return "That's a great question about Java programming! In object-oriented programming, classes define the structure and behavior of objects, which are instances of those classes. This paradigm helps organize code in a modular and reusable way."
  }

  return (
    <Card className={`w-80 shadow-lg transition-all duration-300 ${isMinimized ? "h-14" : "h-96"}`}>
      <CardHeader className="p-3 flex flex-row items-center justify-between space-y-0 border-b">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Bot className="h-4 w-4" />
          AI Instructor
        </CardTitle>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsMinimized(!isMinimized)}>
            <span className="sr-only">{isMinimized ? "Expand" : "Minimize"}</span>
            {isMinimized ? "+" : "-"}
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <CardContent className="p-0 flex flex-col h-full">
            <div className="flex-1 overflow-y-auto p-3 space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[80%] rounded-lg p-2 ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {message.role === "assistant" && <Bot className="h-4 w-4 mt-1 flex-shrink-0" />}
                      <div>{message.content}</div>
                      {message.role === "user" && <User className="h-4 w-4 mt-1 flex-shrink-0" />}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {messages.length === 1 && (
              <div className="p-3 border-t">
                <p className="text-xs text-gray-500 mb-2">Some questions you might have:</p>
                <div className="space-y-2">
                  {sampleQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start text-xs h-auto py-1 px-2"
                      onClick={() => handleSampleQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <form onSubmit={handleSendMessage} className="p-3 border-t flex items-center gap-2">
              <Input
                placeholder="Ask AI anything about the lesson..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1"
                disabled={isLoading}
              />
              <Button type="submit" size="icon" disabled={!input.trim() || isLoading}>
                <Send className="h-4 w-4" />
                <span className="sr-only">Send</span>
              </Button>
            </form>
          </CardContent>
        </>
      )}
    </Card>
  )
}

