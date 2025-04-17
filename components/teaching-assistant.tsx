"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Bot, User, Minimize2, Maximize2, Send, GraduationCap, Sparkles, BookOpen, FileText, Plus, Search, X, ExternalLink, ArrowLeft, Bookmark, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardFooter, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// Markdown components
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"

type Message = {
  role: "user" | "assistant"
  content: string
  sources?: Source[]
}

type Source = {
  id: string
  title: string
  content: string
  url?: string
}

type TeachingAssistantProps = {
  courseId: string
  lessonId: string
  moduleName: string
  lessonName: string
}

export default function TeachingAssistant({ courseId, lessonId, moduleName, lessonName }: TeachingAssistantProps) {
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeSource, setActiveSource] = useState<Source | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Sample sources for demonstration
  const sampleSources = [
    {
      id: "source-1",
      title: "Course Textbook",
      content: "This is the main textbook content related to the current lesson. It contains detailed explanations and examples.",
      url: "#"
    },
    {
      id: "source-2",
      title: "Additional Reading",
      content: "Supplementary material that provides deeper insights into the concepts covered in this lesson.",
      url: "#"
    },
    {
      id: "source-3",
      title: "Related Research Paper",
      content: "Academic research that explores advanced applications of the concepts taught in this lesson.",
      url: "#"
    }
  ];

  useEffect(() => {
    // Add initial greeting message
    setMessages([
      {
        role: "assistant",
        content: `Hi there! I'm your Teaching Assistant for this lesson. I can help explain concepts, answer questions, or provide additional examples. I can also do deep dives into topics with detailed explanations and references to source materials. How can I assist you with "${lessonName}" today?`,
        sources: sampleSources
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

      // Generate some relevant sources for the response
      // In a real implementation, these would come from the API
      const relevantSources = sampleSources.map(source => ({
        ...source,
        id: `source-${Math.random().toString(36).substring(2, 9)}`,
        content: `This source provides information relevant to: "${userMessage}". ${source.content}`
      }));

      // Add AI response to chat with sources
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.response,
        sources: relevantSources
      }])
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
                      <div className="text-sm markdown-content">
                        {message.role === "assistant" ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw, rehypeHighlight]}
                            components={{
                              pre: ({ node, ...props }) => (
                                <pre className="bg-zinc-900 p-4 rounded-md overflow-auto my-2" {...props} />
                              ),
                              code: ({ node, inline, className, children, ...props }) => (
                                inline ? (
                                  <code className="bg-zinc-800 px-1 py-0.5 rounded text-pink-400" {...props}>{children}</code>
                                ) : (
                                  <code className={className} {...props}>{children}</code>
                                )
                              ),
                              a: ({ node, ...props }) => (
                                <a className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer" {...props} />
                              ),
                              ul: ({ node, ...props }) => (
                                <ul className="list-disc pl-6 my-2" {...props} />
                              ),
                              ol: ({ node, ...props }) => (
                                <ol className="list-decimal pl-6 my-2" {...props} />
                              ),
                              li: ({ node, ...props }) => (
                                <li className="my-1" {...props} />
                              ),
                              h1: ({ node, ...props }) => (
                                <h1 className="text-xl font-bold my-3" {...props} />
                              ),
                              h2: ({ node, ...props }) => (
                                <h2 className="text-lg font-bold my-2" {...props} />
                              ),
                              h3: ({ node, ...props }) => (
                                <h3 className="text-md font-bold my-2" {...props} />
                              ),
                              p: ({ node, ...props }) => (
                                <p className="my-2" {...props} />
                              ),
                              blockquote: ({ node, ...props }) => (
                                <blockquote className="border-l-4 border-zinc-500 pl-4 italic my-2" {...props} />
                              ),
                              table: ({ node, ...props }) => (
                                <div className="overflow-auto my-2">
                                  <table className="border-collapse border border-zinc-700" {...props} />
                                </div>
                              ),
                              th: ({ node, ...props }) => (
                                <th className="border border-zinc-700 px-4 py-2 bg-zinc-800" {...props} />
                              ),
                              td: ({ node, ...props }) => (
                                <td className="border border-zinc-700 px-4 py-2" {...props} />
                              ),
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        ) : (
                          <div className="whitespace-pre-wrap">{message.content}</div>
                        )}
                      </div>
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
