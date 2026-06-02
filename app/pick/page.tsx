'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

const MOODS = [
  { id: 'happy', emoji: '😊', label: 'Happy', description: 'Joyful and upbeat' },
  { id: 'sad', emoji: '😢', label: 'Sad', description: 'Down and reflective' },
  {
    id: 'excited',
    emoji: '🤩',
    label: 'Excited',
    description: 'Energized and pumped',
  },
  {
    id: 'bored',
    emoji: '😴',
    label: 'Bored',
    description: 'Need something new',
  },
  {
    id: 'stressed',
    emoji: '😰',
    label: 'Stressed',
    description: 'Need to unwind',
  },
  {
    id: 'romantic',
    emoji: '💕',
    label: 'Romantic',
    description: 'Feeling the love',
  },
  {
    id: 'adventurous',
    emoji: '🧗',
    label: 'Adventurous',
    description: 'Ready to explore',
  },
]

const CONTENT_TYPES = [
  {
    id: 'movie',
    emoji: '🎬',
    label: 'Movie',
    description: 'A film to watch',
  },
  {
    id: 'book',
    emoji: '📚',
    label: 'Book',
    description: 'A book to read',
  },
  {
    id: 'podcast',
    emoji: '🎙️',
    label: 'Podcast',
    description: 'An episode to listen to',
  },
  {
    id: 'activity',
    emoji: '🎯',
    label: 'Activity',
    description: 'Something to do',
  },
]

export default function PickPage() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async () => {
    if (!selectedMood || !selectedType) {
      toast.error('Please select both a mood and a content type')
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/pick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood: selectedMood, content_type: selectedType }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate pick')
      }

      toast.success('Your mystery pick is ready!')
      router.push(`/pick/${data.pick.id}`)
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-purple-950 py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-5xl mb-4 block">🎭</span>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            How are you feeling?
          </h1>
          <p className="text-muted-foreground text-lg">
            Tell us your mood and what you&apos;re in the mood for — we&apos;ll
            surprise you with the perfect pick.
          </p>
        </div>

        {/* Mood Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🌡️</span> Step 1: Your Mood
            </CardTitle>
            <CardDescription>Select the mood that best describes you right now</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {MOODS.map((mood) => (
                <button
                  key={mood.id}
                  onClick={() => setSelectedMood(mood.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center cursor-pointer',
                    selectedMood === mood.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50'
                      : 'border-border hover:border-purple-300 hover:bg-muted/50'
                  )}
                >
                  <span className="text-3xl">{mood.emoji}</span>
                  <span className="font-semibold text-sm">{mood.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {mood.description}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Content Type Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🎯</span> Step 2: What Kind of Pick?
            </CardTitle>
            <CardDescription>Choose the type of content you want</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {CONTENT_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-5 rounded-xl border-2 transition-all text-center cursor-pointer',
                    selectedType === type.id
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-950/50'
                      : 'border-border hover:border-purple-300 hover:bg-muted/50'
                  )}
                >
                  <span className="text-4xl">{type.emoji}</span>
                  <span className="font-semibold">{type.label}</span>
                  <span className="text-xs text-muted-foreground">
                    {type.description}
                  </span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Summary and Submit */}
        {(selectedMood || selectedType) && (
          <Card className="mb-8 border-purple-200 bg-purple-50/50 dark:border-purple-800 dark:bg-purple-950/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4 flex-wrap">
                {selectedMood && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Mood:</span>
                    <span className="font-semibold">
                      {MOODS.find((m) => m.id === selectedMood)?.emoji}{' '}
                      {MOODS.find((m) => m.id === selectedMood)?.label}
                    </span>
                  </div>
                )}
                {selectedType && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Type:</span>
                    <span className="font-semibold">
                      {CONTENT_TYPES.find((t) => t.id === selectedType)?.emoji}{' '}
                      {CONTENT_TYPES.find((t) => t.id === selectedType)?.label}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center">
          <Button
            size="lg"
            onClick={handleSubmit}
            disabled={!selectedMood || !selectedType || loading}
            className="bg-purple-600 hover:bg-purple-700 text-white px-12 py-6 text-lg rounded-xl disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">⏳</span> Generating your mystery
                pick...
              </span>
            ) : (
              '🎁 Get My Mystery Pick'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
