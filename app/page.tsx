import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const moods = [
  { emoji: '😊', label: 'Happy', color: 'bg-yellow-100 text-yellow-800' },
  { emoji: '😢', label: 'Sad', color: 'bg-blue-100 text-blue-800' },
  { emoji: '🤩', label: 'Excited', color: 'bg-orange-100 text-orange-800' },
  { emoji: '😴', label: 'Bored', color: 'bg-gray-100 text-gray-800' },
  { emoji: '😰', label: 'Stressed', color: 'bg-red-100 text-red-800' },
  { emoji: '💕', label: 'Romantic', color: 'bg-pink-100 text-pink-800' },
  { emoji: '🧗', label: 'Adventurous', color: 'bg-green-100 text-green-800' },
]

const contentTypes = [
  { emoji: '🎬', label: 'Movie', description: 'A film perfectly tuned to you' },
  { emoji: '📚', label: 'Book', description: 'Your next page-turner' },
  { emoji: '🎙️', label: 'Podcast', description: 'Stories for your ears' },
  { emoji: '🎯', label: 'Activity', description: 'Something to actually do' },
]

const steps = [
  {
    number: '01',
    title: 'Pick Your Mood',
    description:
      'Tell us how you\'re feeling right now — no judgment, just vibes.',
  },
  {
    number: '02',
    title: 'Choose a Category',
    description:
      'Movie, book, podcast, or activity. We\'ll handle the rest.',
  },
  {
    number: '03',
    title: 'Get Your Mystery Pick',
    description:
      'Our AI curates the perfect recommendation — but it\'s wrapped.',
  },
  {
    number: '04',
    title: 'Reveal & Rate',
    description:
      'Unwrap your mystery pick when you\'re ready, then tell us how it went.',
  },
]

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center">
          <Badge className="mb-6 bg-purple-500/20 text-purple-200 border-purple-500/30 hover:bg-purple-500/30">
            AI-Powered Mystery Recommendations
          </Badge>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
            What if your next favorite{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              thing
            </span>{' '}
            was already waiting for you?
          </h1>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            BlindPick reads your mood and surprises you with the perfect movie,
            book, podcast, or activity — but you won&apos;t see it until you
            unwrap it.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/pick">
              <Button
                size="lg"
                className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-6 text-lg rounded-xl"
              >
                Get My Mystery Pick 🎁
              </Button>
            </Link>
            <Link href="/signup">
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-xl"
              >
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How BlindPick Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Four simple steps to your next obsession
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="text-center">
                <div className="text-5xl font-black text-purple-200 dark:text-purple-900 mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Moods */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Every Mood, Perfectly Matched
            </h2>
            <p className="text-muted-foreground">
              Tell us how you feel and we&apos;ll do the rest
            </p>
          </div>
          <div className="flex flex-wrap gap-3 justify-center">
            {moods.map((mood) => (
              <div
                key={mood.label}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${mood.color}`}
              >
                <span>{mood.emoji}</span>
                <span>{mood.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Types */}
      <section className="py-20 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">
              Four Kinds of Surprises
            </h2>
            <p className="text-muted-foreground">
              Whatever you&apos;re in the mood for
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contentTypes.map((type) => (
              <Card
                key={type.label}
                className="text-center hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-8 pb-6">
                  <div className="text-5xl mb-4">{type.emoji}</div>
                  <h3 className="text-xl font-semibold mb-2">{type.label}</h3>
                  <p className="text-muted-foreground text-sm">
                    {type.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to be surprised?
          </h2>
          <p className="text-purple-100 text-lg mb-8">
            Join BlindPick and discover recommendations you never knew you needed.
          </p>
          <Link href="/signup">
            <Button
              size="lg"
              className="bg-white text-purple-700 hover:bg-purple-50 px-10 py-6 text-lg rounded-xl font-semibold"
            >
              Start Your First Pick 🎁
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center text-sm text-muted-foreground">
          <p>BlindPick &copy; 2024 — AI-powered mystery recommendations</p>
        </div>
      </footer>
    </div>
  )
}
