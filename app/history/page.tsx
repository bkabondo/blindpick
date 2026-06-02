import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

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

function StarDisplay({ rating }: { rating: number | null }) {
  if (!rating) return <span className="text-muted-foreground text-sm">Not rated</span>
  return (
    <span className="text-yellow-500">
      {'⭐'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default async function HistoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: picks, error } = await supabase
    .from('blindpick_picks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching picks:', error)
  }

  const allPicks = (picks as Pick[]) || []
  const revealedPicks = allPicks.filter((p) => p.is_revealed)
  const unrevealedPicks = allPicks.filter((p) => !p.is_revealed)

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-purple-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold">Your Pick History</h1>
            <p className="text-muted-foreground mt-1">
              {allPicks.length} total picks — {revealedPicks.length} revealed
            </p>
          </div>
          <Link href="/pick">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              🎁 New Pick
            </Button>
          </Link>
        </div>

        {allPicks.length === 0 ? (
          <Card className="text-center py-16">
            <CardContent>
              <div className="text-6xl mb-4">📭</div>
              <h2 className="text-xl font-semibold mb-2">No picks yet</h2>
              <p className="text-muted-foreground mb-6">
                Start your mystery recommendation journey!
              </p>
              <Link href="/pick">
                <Button>Get Your First Pick</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Unrevealed picks */}
            {unrevealedPicks.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>🎁</span> Waiting to be Revealed ({unrevealedPicks.length})
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {unrevealedPicks.map((pick) => (
                    <Link key={pick.id} href={`/pick/${pick.id}`}>
                      <Card className="hover:shadow-md transition-shadow border-dashed border-2 cursor-pointer h-full">
                        <CardContent className="pt-6">
                          <div className="flex items-center gap-3 mb-3">
                            <span className="text-3xl">🎁</span>
                            <div>
                              <p className="font-semibold">Mystery Pick</p>
                              <p className="text-sm text-muted-foreground">
                                Tap to reveal
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="secondary">
                              {MOOD_EMOJIS[pick.mood]} {pick.mood}
                            </Badge>
                            <Badge variant="outline">
                              {TYPE_EMOJIS[pick.content_type]} {pick.content_type}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-3">
                            {new Date(pick.created_at).toLocaleDateString()}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Revealed picks */}
            {revealedPicks.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <span>✅</span> Revealed Picks ({revealedPicks.length})
                </h2>
                <div className="space-y-4">
                  {revealedPicks.map((pick) => (
                    <Link key={pick.id} href={`/pick/${pick.id}`}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <span className="text-3xl">
                                {TYPE_EMOJIS[pick.content_type]}
                              </span>
                              <div>
                                <CardTitle className="text-lg">
                                  {pick.recommendation.title}
                                </CardTitle>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {MOOD_EMOJIS[pick.mood]} {pick.mood}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs">
                                    {pick.content_type}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                            <div className="flex-shrink-0 text-right">
                              <StarDisplay rating={pick.rating} />
                              <p className="text-xs text-muted-foreground mt-1">
                                {new Date(pick.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {pick.recommendation.description}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
