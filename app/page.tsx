import { ArrowRight, BookOpen, Brain, Lightbulb, Sparkles, Zap, Laptop, BookMarked } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-32 md:py-40 text-center">
        <div className="container px-4 mx-auto max-w-4xl">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight text-foreground">
            Think <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Smarter</span>,<br />
            Not Harder
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            The ultimate tool for understanding any information that matters
            most to you, built with Generative AI.
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 py-6 h-auto text-base font-medium bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            asChild
          >
            <Link href="/dashboard">Try AI Tutor</Link>
          </Button>
        </div>
      </section>

      {/* Your AI Tutor Section */}
      <section className="py-24">
        <div className="container px-4 mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-24 text-foreground">
            Your Personalized AI Learning Assistant
          </h2>

          {/* Feature 1 */}
          <div className="grid md:grid-cols-5 gap-16 mb-32 items-center">
            <div className="space-y-6 order-2 md:order-1 md:col-span-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10">
                <Sparkles className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">
                AI-Powered Learning Paths
              </h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                AI Tutor analyzes your learning style and adapts in real-time, creating a personalized path that evolves with your progress.
              </p>
            </div>
            <div className="bg-black dark:bg-zinc-800 rounded-xl overflow-hidden order-1 md:order-2 shadow-lg md:col-span-3">
              <Image
                src="/images/feature-personalized.png"
                alt="Personalized learning paths"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-5 gap-16 mb-32 items-center">
            <div className="bg-black dark:bg-zinc-800 rounded-xl overflow-hidden shadow-lg md:col-span-3">
              <Image
                src="/images/feature-chat.png"
                alt="Chat with AI feature"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
            <div className="space-y-6 md:col-span-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-400/20 to-violet-400/10">
                <Brain className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Interactive AI Tutoring</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Engage in natural dialogue with context-aware AI that remembers your history and provides tailored explanations to your questions.
              </p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-5 gap-16 mb-32 items-center">
            <div className="space-y-6 order-2 md:order-1 md:col-span-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/20 to-yellow-400/10">
                <Lightbulb className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Source-Based Learning</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                See exactly where information comes from with direct source citations, building trust and deeper understanding of materials.
              </p>
            </div>
            <div className="bg-black dark:bg-zinc-800 rounded-xl overflow-hidden order-1 md:order-2 shadow-lg md:col-span-3">
              <Image
                src="/images/feature-sources.png"
                alt="Source references feature"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
          </div>

          {/* Feature 4 */}
          <div className="grid md:grid-cols-5 gap-16 mb-16 items-center">
            <div className="bg-black dark:bg-zinc-800 rounded-xl overflow-hidden shadow-lg md:col-span-3">
              <Image
                src="/images/feature-mobile.png"
                alt="Mobile learning feature"
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
            <div className="space-y-6 md:col-span-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-400/20 to-teal-400/10">
                <Laptop className="h-6 w-6 text-teal-500" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Learn Anywhere, Anytime</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Access your learning materials from any device with real-time synchronization, continuing your journey wherever you go.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Section */}
      <section className="py-16 bg-muted/30">
        <div className="container px-4 mx-auto text-center max-w-3xl">
          <h2 className="text-xl font-medium mb-4 text-foreground">
            We value your privacy and do not use your personal data to train AI Tutor
          </h2>
          <p className="text-muted-foreground mb-8">
            AI Tutor does not use your personal data, including your source materials,
            queries, and the responses from the model for training.
          </p>
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <BookMarked className="h-8 w-8 text-primary" />
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24">
        <div className="container px-4 mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-20 text-foreground">
            How people are using AI Tutor
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Use Case 1 */}
            <div className="p-8 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center mb-5">
                <div className="bg-gradient-to-br from-primary/20 to-primary/5 p-4 rounded-full mb-4">
                  <BookOpen className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium text-foreground">Study Smarter, Not Harder</h3>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed text-center">
                Break down difficult concepts from textbooks and research papers into digestible, easy-to-understand explanations.
              </p>
            </div>

            {/* Use Case 2 */}
            <div className="p-8 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center mb-5">
                <div className="bg-gradient-to-br from-blue-400/20 to-blue-400/5 p-4 rounded-full mb-4">
                  <Brain className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-medium text-foreground">Organize Your Knowledge</h3>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed text-center">
                Extract key insights from multiple sources and connect related concepts to create comprehensive knowledge maps.
              </p>
            </div>

            {/* Use Case 3 */}
            <div className="p-8 rounded-xl border bg-card shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col items-center text-center mb-5">
                <div className="bg-gradient-to-br from-amber-400/20 to-amber-400/5 p-4 rounded-full mb-4">
                  <Zap className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-medium">Master New Skills Faster</h3>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed text-center">
                Learn new subjects faster with interactive explanations and practical examples that reinforce theoretical concepts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30">
        <div className="container px-4 mx-auto text-center max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-semibold mb-8">
            Ready to transform how you learn?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            Join thousands of students and professionals who are learning smarter, not harder.
            Experience the future of personalized education today.
          </p>
          <Button
            size="lg"
            className="rounded-full px-10 py-6 h-auto text-base font-medium bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90"
            asChild
          >
            <Link href="/dashboard">Get Started with AI Tutor</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
