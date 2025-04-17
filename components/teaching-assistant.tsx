"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Bot, User, Minimize2, Maximize2, Send, GraduationCap, Sparkles, BookOpen, FileText, Plus, Search, X, ExternalLink, ArrowLeft, Bookmark, Download, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card, CardFooter, CardHeader, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

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

import { TypingEffect } from "./typing-effect"

export default function TeachingAssistant({ courseId, lessonId, moduleName, lessonName }: TeachingAssistantProps) {
  console.log("TeachingAssistant rendered:", { courseId, lessonId, moduleName, lessonName });
  const [isMinimized, setIsMinimized] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [isOverlayOpen, setIsOverlayOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hi there! I'm your Teaching Assistant for this lesson on **${lessonName}**. Feel free to ask me any questions about the content, and I'll do my best to help you understand the material better.`
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeSource, setActiveSource] = useState<Source | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [currentTypingMessageIndex, setCurrentTypingMessageIndex] = useState<number | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const overlayRef = useRef<HTMLDivElement>(null)

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
  }, [messages, isOverlayOpen])

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
      const newMessageIndex = messages.length;
      setMessages((prev) => [...prev, {
        role: "assistant",
        content: data.response,
        sources: relevantSources
      }])

      // Set typing effect for the new message
      setIsTyping(true)
      setCurrentTypingMessageIndex(newMessageIndex)

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

  // Handle typing effect completion
  const handleTypingComplete = () => {
    setIsTyping(false)
    setCurrentTypingMessageIndex(null)
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

  // Toggle overlay
  const toggleOverlay = () => {
    setIsOverlayOpen(!isOverlayOpen)
    if (!isOverlayOpen) {
      // When opening overlay, make sure it's not minimized
      setIsMinimized(false)
    }
  }

  // Close overlay with escape key and listen for toggle event
  useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOverlayOpen) {
        setIsOverlayOpen(false)
      }
    }

    const handleToggleEvent = () => {
      toggleOverlay()
    }

    window.addEventListener('keydown', handleEscapeKey)
    document.addEventListener('toggle-teaching-assistant', handleToggleEvent)

    return () => {
      window.removeEventListener('keydown', handleEscapeKey)
      document.removeEventListener('toggle-teaching-assistant', handleToggleEvent)
    }
  }, [isOverlayOpen, toggleOverlay])

  // Render message content with typing effect if needed
  const renderMessageContent = (message: Message, index: number) => {
    if (message.role === 'assistant') {
      if (isTyping && currentTypingMessageIndex === index) {
        return (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
              p: ({ node, ...props }) => (
                <p className="my-2">
                  <TypingEffect
                    text={String(props.children).replace(/,/g, '')}
                    onComplete={handleTypingComplete}
                  />
                </p>
              ),
              // Other components remain the same
              pre: ({ node, ...props }) => (
                <pre className="bg-zinc-900 p-4 rounded-md overflow-auto my-2 w-full" {...props} />
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
        )
      } else {
        return (
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeHighlight]}
            components={{
              pre: ({ node, ...props }) => (
                <pre className="bg-zinc-900 p-4 rounded-md overflow-auto my-2 w-full" {...props} />
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
        )
      }
    } else {
      return <div className="whitespace-pre-wrap">{message.content}</div>
    }
  }

  return (
    <>
      {/* Floating toggle button */}
      <div className="fixed bottom-8 right-8 z-40">
        <Button
          onClick={toggleOverlay}
          size="lg"
          className="rounded-full h-16 w-16 shadow-xl flex items-center justify-center bg-primary hover:bg-primary/90"
        >
          <GraduationCap className="h-7 w-7" />
          <span className="sr-only">Open Teaching Assistant</span>
        </Button>
      </div>

      {/* Full-screen Overlay */}
      {isOverlayOpen && (
        <div
          className="ta-overlay"
          ref={overlayRef}
        >
          <div className="h-full flex flex-col w-full pt-5 pb-6 px-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-5 pb-4 border-b">
              <div className="flex items-center gap-3">
                <Button variant="outline" size="icon" onClick={toggleOverlay}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div className="flex items-center gap-3">
                  <div className="bg-primary/10 p-2.5 rounded-full">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium flex items-center gap-2">
                      Teaching Assistant <Badge className="text-xs">Gemini AI</Badge>
                    </h2>
                    <p className="text-sm text-muted-foreground">{lessonName}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Chat Area */}
            <ScrollArea className="flex-1 pr-5 -mr-5">
              <div className="space-y-6 pb-5 px-1 max-w-none">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[95%] rounded-xl p-5 ${message.role === "user"
                        ? "bg-primary text-primary-foreground border-blue-500 border-2"
                        : "bg-muted dark:bg-zinc-800 border-green-500 border-2"
                      }`}
                    >
                      <div className="flex items-start">
                        <div className="markdown-content w-full">
                          {renderMessageContent(message, index)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="mt-5 pt-5 border-t">
              <div className="flex items-center gap-4">
                <Textarea
                  placeholder="Ask your Teaching Assistant anything about this lesson..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="min-h-14 flex-1 p-4 resize-none text-base rounded-xl"
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={isLoading || !input.trim()}
                  size="lg"
                  className="h-14 px-5 rounded-xl"
                >
                  {isLoading ? (
                    <Sparkles className="h-5 w-5 mr-2 animate-pulse" />
                  ) : (
                    <Send className="h-5 w-5 mr-2" />
                  )}
                  Ask TA
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
