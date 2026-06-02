'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import Link from 'next/link'

interface Recommendation {
  title: string
  description: string
  why_fits_mood: string
}

interface Pick {
  id: string
  mood: string
  content_type: string
  recommendation: Recommendation
  is_revealed: boolean
  rating: number | null
  created_at: string
}

const MOOD_EMOJIS: Record<string, string> = {
  happy: '😊',
  sad: '😢',
  excited: '🤩',
  bored: '😴',
  stressed: '😰',
  romantic: '💕',
  adventurous: '🧗',
}

const TYPE_EMOJIS: Record<string, string> = {
  movie: '🎬',
  book: '📚',
  podcast: '🎙️',
  activity: '🎯',
}

function StarRating({
  rating,
  onRate,
  disabled,
}: {
  rating: number | null
  onRate: (r: number) => void
  disabled: boolean
}) {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !disabled && onRate(star)}
          onMouseEnter={() => !disabled && setHovered(star)}
          onMouseLeave={() => !disabled && setHovered(null)}
          disabled={disabled}
          className="text-3xl transition-transform hover:scale-110 disabled:cursor-default"
        >
          {star <= (hovered ?? rating ?? 0) ? '⭐' : '☆'}
        </button>
      ))}
    </div>
  )
}

export default function PickDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [pick, setPick] = useState<Pick | null>(null)
  const [loading, setLoading] = useState(true)
  const [revealing, setRevealing] = useState(false)
  const [rating, setRating] = useState<number | null>(null)
  const [ratingLoading, setRatingLoading] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchPick = async () => {
      const { data, error } = await supabase
        .from('blindpick_picks')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !data) {
        toast.error('Pick not found')
        router.push('/pick')
        return
      }

      setPick(data as Pick)
      setRating(data.rating)
      setLoading(false)
    }

    fetchPick()
  }, [id])

  const handleReveal = async () => {
    setRevealing(true)
    try {
      const response = await fetch(`/api/pick/${id}/reveal`, {
        method: 'PATCH',
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setPick((prev) => prev ? { ...prev, is_revealed: true } : prev)
      toast.success('Revealed! Enjoy your pick 🎉')
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message)
    } finally {
      setRevealing(false)
    }
  }

  const handleRate = async (stars: number) => {
    if (ratingLoading) return
    setRatingLoading(true)
    try {
      const response = await fetch(`/api/pick/${id}/rate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: stars }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error)
      setRating(stars)
      setPick((prev) => prev ? { ...prev, rating: stars } : prev)
      toast.success(`Rated ${stars} star${stars !== 1 ? 's' : ''}!`)
    } catch (error: unknown) {
      const err = error as Error
      toast.error(err.message)
    } finally {
      setRatingLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">🎁</div>
          <p className="text-muted-foreground">Loading your pick...</p>
        </div>
      </div>
    )
  }

  if (!pick) return null

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-purple-950 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link href="/pick" className="hover:text-foreground transition-colors">
            New Pick
          </Link>
          <span>/</span>
          <span>Your Pick</span>
        </div>

        {/* Mood & Type badges */}
        <div className="flex gap-3 mb-8 flex-wrap">
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {MOOD_EMOJIS[pick.mood]} {pick.mood.charAt(0).toUpperCase() + pick.mood.slice(1)} mood
          </Badge>
          <Badge variant="secondary" className="text-sm px-3 py-1">
            {TYPE_EMOJIS[pick.content_type]}{' '}
            {pick.content_type.charAt(0).toUpperCase() + pick.content_type.slice(1)}
          </Badge>
        </div>

        {!pick.is_revealed ? (
          /* Wrapped State */
          <Card className="text-center border-2 border-purple-200 dark:border-purple-800">
            <CardContent className="py-16 px-8">
              <div className="text-8xl mb-6 animate-bounce">🎁</div>
              <h2 className="text-2xl font-bold mb-4">
                Your mystery pick is ready!
              </h2>
              <p className="text-muted-foreground mb-2 max-w-md mx-auto">
                A perfect{' '}
                <strong>{pick.content_type}</strong> has been chosen for your{' '}
                <strong>{pick.mood}</strong> mood. Are you ready to unwrap it?
              </p>
              <p className="text-sm text-muted-foreground mb-8">
                Once revealed, you can&apos;t go back — so make it count!
              </p>
              <Button
                size="lg"
                onClick={handleReveal}
                disabled={revealing}
                className="bg-purple-600 hover:bg-purple-700 text-white px-10 py-6 text-lg rounded-xl"
              >
                {revealing ? '✨ Revealing...' : '🎁 Reveal My Pick!'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Revealed State */
          <div className="space-y-6">
            <Card className="border-2 border-green-200 dark:border-green-800">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium mb-1">
                      Your {pick.content_type}
                    </p>
                    <CardTitle className="text-2xl sm:text-3xl">
                      {pick.recommendation.title}
                    </CardTitle>
                  </div>
                  <span className="text-4xl flex-shrink-0">
                    {TYPE_EMOJIS[pick.content_type]}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-muted-foreground">
                    About
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {pick.recommendation.description}
                  </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-950/30 rounded-lg p-4">
                  <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide text-purple-700 dark:text-purple-300">
                    Why it fits your {pick.mood} mood
                  </h3>
                  <p className="text-foreground leading-relaxed">
                    {pick.recommendation.why_fits_mood}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Rating */}
            <Card>
              <CardContent className="py-6">
                <h3 className="font-semibold mb-4 text-center">
                  How would you rate this pick?
                </h3>
                <div className="flex justify-center">
                  <StarRating
                    rating={rating}
                    onRate={handleRate}
                    disabled={ratingLoading}
                  />
                </div>
                {rating && (
                  <p className="text-center text-sm text-muted-foreground mt-3">
                    You rated this {rating} star{rating !== 1 ? 's' : ''}
                    {ratingLoading ? ' (saving...)' : ''}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/pick">
                <Button variant="outline" size="lg" className="px-8">
                  🎭 Get Another Pick
                </Button>
              </Link>
              <Link href="/history">
                <Button variant="ghost" size="lg">
                  📋 View History
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
