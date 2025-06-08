import { ArrowRight, BookOpen, Brain, Lightbulb, Sparkles, Zap, Laptop, BookMarked,
  MessageCircle, Star, Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="py-20 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background"></div>
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"></div>
        </div>

        {/* Floating elements animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-60 -right-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-64 h-64 bg-green-500/5 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="container px-4 mx-auto max-w-6xl relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-left md:pr-8 animate-fade-in">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary/10 text-primary mb-6 animate-slide-up">
                <Sparkles className="h-3.5 w-3.5 mr-2" />
                <span>AI-powered learning platform</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight text-foreground animate-slide-up animation-delay-300">
                Think <span className="bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">Smarter</span>,<br />
                Not Harder
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mb-10 animate-slide-up animation-delay-600">
                The ultimate tool for understanding any information that matters
                most to you, built with Generative AI.
              </p>
              <div className="flex flex-wrap gap-4 animate-slide-up animation-delay-900">
                <Button
                  size="lg"
                  className="rounded-full px-10 py-6 h-auto text-base font-medium bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-lg hover:shadow-xl transition-all"
                  asChild
                >
                  <Link href="/dashboard">Try AI Tutor</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="rounded-full px-8 py-6 h-auto text-base font-medium hover:bg-muted/50 transition-all"
                  asChild
                >
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block animate-fade-in animation-delay-1200">
              <div className="relative rounded-xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-300 group">
                <Image
                  src="/images/hero-image.jpg"
                  alt="AI-powered learning experience"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/30 to-transparent mix-blend-overlay group-hover:opacity-70 transition-opacity"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/70 to-transparent text-white transform translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-sm font-medium">Experience personalized learning with AI that adapts to your needs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Your AI Tutor Section */}
      <section id="features" className="py-24 bg-muted/10">
        <div className="container px-4 mx-auto max-w-6xl">
          <div className="animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8 text-foreground">
              Your Personalized AI Learning Assistant
            </h2>
            <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-24">
              Experience a revolutionary approach to learning with our AI-powered platform that adapts to your unique needs
            </p>
          </div>

          {/* Feature 1 */}
          <div className="grid md:grid-cols-5 gap-16 mb-32 items-center opacity-0 translate-y-8 animate-slide-up-fade-in">
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
              <div className="pt-2">
                <Link href="/dashboard" className="text-primary hover:text-primary/80 font-medium inline-flex items-center group">
                  Try it yourself <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden order-1 md:order-2 shadow-xl md:col-span-3 transform hover:scale-[1.02] transition-all duration-300">
              <div className="relative">
                <Image
                  src="/images/feature-personalized.jpg"
                  alt="Personalized learning paths"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-transparent mix-blend-overlay"></div>
              </div>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="grid md:grid-cols-5 gap-16 mb-32 items-center opacity-0 translate-y-8 animate-slide-up-fade-in animation-delay-300">
            <div className="rounded-xl overflow-hidden shadow-xl md:col-span-3 transform hover:scale-[1.02] transition-all duration-300">
              <div className="relative">
                <Image
                  src="/images/feature-chat.jpg"
                  alt="Chat with AI feature"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-transparent mix-blend-overlay"></div>
              </div>
            </div>
            <div className="space-y-6 md:col-span-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-400/20 to-violet-400/10">
                <Brain className="h-6 w-6 text-blue-500" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Interactive AI Tutoring</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Engage in natural dialogue with context-aware AI that remembers your history and provides tailored explanations to your questions.
              </p>
              <div className="pt-2">
                <Link href="/dashboard" className="text-blue-500 hover:text-blue-400 font-medium inline-flex items-center group">
                  Start a conversation <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="grid md:grid-cols-5 gap-16 mb-32 items-center opacity-0 translate-y-8 animate-slide-up-fade-in animation-delay-600">
            <div className="space-y-6 order-2 md:order-1 md:col-span-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-amber-400/20 to-yellow-400/10">
                <Lightbulb className="h-6 w-6 text-amber-500" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Source-Based Learning</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                See exactly where information comes from with direct source citations, building trust and deeper understanding of materials.
              </p>
              <div className="pt-2">
                <Link href="/dashboard" className="text-amber-500 hover:text-amber-400 font-medium inline-flex items-center group">
                  Explore sources <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden order-1 md:order-2 shadow-xl md:col-span-3 transform hover:scale-[1.02] transition-all duration-300">
              <div className="relative">
                <Image
                  src="/images/feature-sources.jpg"
                  alt="Source references feature"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/20 to-transparent mix-blend-overlay"></div>
              </div>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="grid md:grid-cols-5 gap-16 mb-16 items-center opacity-0 translate-y-8 animate-slide-up-fade-in animation-delay-900">
            <div className="rounded-xl overflow-hidden shadow-xl md:col-span-3 transform hover:scale-[1.02] transition-all duration-300">
              <div className="relative">
                <Image
                  src="/images/feature-mobile.jpg"
                  alt="Mobile learning feature"
                  width={600}
                  height={400}
                  className="w-full h-auto object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-teal-500/20 to-transparent mix-blend-overlay"></div>
              </div>
            </div>
            <div className="space-y-6 md:col-span-2">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-green-400/20 to-teal-400/10">
                <Laptop className="h-6 w-6 text-teal-500" />
              </div>
              <h3 className="text-2xl font-semibold text-foreground">Learn Anywhere, Anytime</h3>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Access your learning materials from any device with real-time synchronization, continuing your journey wherever you go.
              </p>
              <div className="pt-2">
                <Link href="/dashboard" className="text-teal-500 hover:text-teal-400 font-medium inline-flex items-center group">
                  Get started <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
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

      {/* Testimonials Section */}
      <section className="py-24 bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background to-muted/10 to-background"></div>
        </div>
        <div className="container px-4 mx-auto max-w-6xl relative z-10">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-foreground">
              What Our Users Say
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of students and professionals who have transformed their learning experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-card rounded-xl p-8 shadow-lg border border-muted hover:shadow-xl transition-all duration-300 opacity-0 translate-y-8 animate-slide-up-fade-in">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-primary">JS</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">James Smith</h4>
                  <p className="text-sm text-muted-foreground">Computer Science Student</p>
                </div>
              </div>
              <div className="flex mb-4">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              </div>
              <p className="text-foreground leading-relaxed mb-4">
                "AI Tutor has completely changed how I approach difficult programming concepts. The personalized learning paths helped me master algorithms in half the time it would have taken otherwise."
              </p>
              <p className="text-sm text-muted-foreground">2 weeks ago</p>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-card rounded-xl p-8 shadow-lg border border-muted hover:shadow-xl transition-all duration-300 opacity-0 translate-y-8 animate-slide-up-fade-in animation-delay-300">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-blue-500">RP</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">Rachel Patel</h4>
                  <p className="text-sm text-muted-foreground">Medical Student</p>
                </div>
              </div>
              <div className="flex mb-4">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              </div>
              <p className="text-foreground leading-relaxed mb-4">
                "Studying anatomy became so much easier with AI Tutor. The interactive explanations and source-based learning helped me connect concepts that I was struggling with for months."
              </p>
              <p className="text-sm text-muted-foreground">1 month ago</p>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-card rounded-xl p-8 shadow-lg border border-muted hover:shadow-xl transition-all duration-300 opacity-0 translate-y-8 animate-slide-up-fade-in animation-delay-600">
              <div className="flex items-center mb-4">
                <div className="flex-shrink-0 mr-4">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                    <span className="text-lg font-semibold text-amber-500">DK</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-foreground">David Kim</h4>
                  <p className="text-sm text-muted-foreground">Business Professional</p>
                </div>
              </div>
              <div className="flex mb-4">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                <Star className="h-5 w-5 text-amber-500" />
              </div>
              <p className="text-foreground leading-relaxed mb-4">
                "I needed to quickly learn about market analysis for a new project. AI Tutor created a custom course that fit my schedule and learning style. The mobile access was perfect for my busy lifestyle."
              </p>
              <p className="text-sm text-muted-foreground">3 months ago</p>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases Section */}
      <section className="py-24">
        <div className="container px-4 mx-auto max-w-6xl">
          <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8 text-foreground animate-fade-in">
            How People Are Using AI Tutor
          </h2>
          <p className="text-lg text-muted-foreground text-center max-w-3xl mx-auto mb-16 animate-fade-in">
            Discover the many ways our platform can help you achieve your learning goals
          </p>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Use Case 1 */}
            <div className="p-8 rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] opacity-0 translate-y-8 animate-slide-up-fade-in">
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
            <div className="p-8 rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] opacity-0 translate-y-8 animate-slide-up-fade-in animation-delay-300">
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
            <div className="p-8 rounded-xl border bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] opacity-0 translate-y-8 animate-slide-up-fade-in animation-delay-600">
              <div className="flex flex-col items-center text-center mb-5">
                <div className="bg-gradient-to-br from-amber-400/20 to-amber-400/5 p-4 rounded-full mb-4">
                  <Zap className="h-8 w-8 text-amber-500" />
                </div>
                <h3 className="text-xl font-medium text-foreground">Master New Skills Faster</h3>
              </div>
              <p className="text-muted-foreground text-lg leading-relaxed text-center">
                Learn new subjects faster with interactive explanations and practical examples that reinforce theoretical concepts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background"></div>
          <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]"></div>
        </div>

        {/* Floating elements animation */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          <div className="absolute bottom-40 -left-20 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-blob"></div>
        </div>

        <div className="container px-4 mx-auto text-center max-w-4xl relative z-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 mb-8 animate-pulse">
            <Sparkles className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold mb-8 text-foreground animate-fade-in">
            Ready to transform how you learn?
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-fade-in animation-delay-300">
            Join thousands of students and professionals who are learning smarter, not harder.
            Experience the future of personalized education today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in animation-delay-600">
            <Button
              size="lg"
              className="rounded-full px-10 py-6 h-auto text-base font-medium bg-black text-white hover:bg-black/90 dark:bg-white dark:text-black dark:hover:bg-white/90 shadow-lg hover:shadow-xl transition-all"
              asChild
            >
              <Link href="/dashboard">Get Started with AI Tutor</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full px-10 py-6 h-auto text-base font-medium hover:bg-muted/50 transition-all"
              asChild
            >
              <Link href="/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Floating Chat Button */}
      <div className="fixed bottom-6 right-6 z-50 animate-bounce-slow">
        <Button
          className="h-14 w-14 rounded-full shadow-lg bg-primary hover:bg-primary/90 text-white p-0 flex items-center justify-center group"
          aria-label="Chat with AI Assistant"
        >
          <MessageCircle className="h-6 w-6 group-hover:scale-110 transition-transform" />
        </Button>
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center mb-4">
                <BookOpen className="h-6 w-6 text-primary mr-2" />
                <span className="font-semibold text-lg">AI Tutor</span>
              </Link>
              <p className="text-sm text-muted-foreground mb-4">
                The ultimate AI-powered learning platform that adapts to your unique needs and helps you master any subject.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" asChild>
                  <Link href="https://github.com/qxnZero" target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                    <span className="sr-only">GitHub - qxnZero</span>
                  </Link>
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-4">Product</h3>
              <ul className="space-y-2">
                <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link></li>
                <li><Link href="/courses" className="text-sm text-muted-foreground hover:text-foreground">Courses</Link></li>
                <li><Link href="/bookmarks" className="text-sm text-muted-foreground hover:text-foreground">Bookmarks</Link></li>
                <li><Link href="/notes" className="text-sm text-muted-foreground hover:text-foreground">Notes</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-medium mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="/cookies" className="text-sm text-muted-foreground hover:text-foreground">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AI Tutor. All rights reserved.
            </p>
            <div className="flex items-center mt-4 md:mt-0">
              <span className="text-sm text-muted-foreground flex items-center">
                Abhishek Yadav
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
