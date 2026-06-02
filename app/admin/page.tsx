import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface BlindPickUser {
  id: string
  email: string
  full_name: string | null
  role: string
  created_at: string
}

interface Recommendation {
  title: string
  description: string
  why_fits_mood: string
}

interface Pick {
  id: string
  user_id: string
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

export default async function AdminPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if admin
  const { data: userProfile } = await supabase
    .from('blindpick_users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!userProfile || userProfile.role !== 'admin') {
    redirect('/')
  }

  // Fetch all users
  const { data: users } = await supabase
    .from('blindpick_users')
    .select('*')
    .order('created_at', { ascending: false })

  // Fetch all picks
  const { data: picks } = await supabase
    .from('blindpick_picks')
    .select('*')
    .order('created_at', { ascending: false })

  const allUsers = (users as BlindPickUser[]) || []
  const allPicks = (picks as Pick[]) || []

  const stats = {
    totalUsers: allUsers.length,
    totalPicks: allPicks.length,
    revealedPicks: allPicks.filter((p) => p.is_revealed).length,
    ratedPicks: allPicks.filter((p) => p.rating !== null).length,
    avgRating:
      allPicks.filter((p) => p.rating !== null).length > 0
        ? (
            allPicks
              .filter((p) => p.rating !== null)
              .reduce((sum, p) => sum + (p.rating || 0), 0) /
            allPicks.filter((p) => p.rating !== null).length
          ).toFixed(1)
        : 'N/A',
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-purple-50 dark:from-slate-950 dark:to-purple-950 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            BlindPick platform overview
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {[
            { label: 'Total Users', value: stats.totalUsers, emoji: '👥' },
            { label: 'Total Picks', value: stats.totalPicks, emoji: '🎁' },
            { label: 'Revealed', value: stats.revealedPicks, emoji: '✅' },
            { label: 'Rated', value: stats.ratedPicks, emoji: '⭐' },
            { label: 'Avg Rating', value: stats.avgRating, emoji: '📊' },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6 pb-4 text-center">
                <div className="text-3xl mb-2">{stat.emoji}</div>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Users Table */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>👥</span> All Users ({allUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Picks</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allUsers.map((u) => (
                    <TableRow key={u.id}>
                      <TableCell className="font-medium">
                        {u.full_name || '—'}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>
                        <Badge
                          variant={u.role === 'admin' ? 'default' : 'secondary'}
                        >
                          {u.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {allPicks.filter((p) => p.user_id === u.id).length}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(u.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {allUsers.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground py-8"
                      >
                        No users yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Picks Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>🎁</span> All Picks ({allPicks.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Mood</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {allPicks.map((pick) => (
                    <TableRow key={pick.id}>
                      <TableCell className="font-medium max-w-[200px] truncate">
                        {pick.is_revealed
                          ? pick.recommendation.title
                          : '🎁 Mystery Pick'}
                      </TableCell>
                      <TableCell>
                        {MOOD_EMOJIS[pick.mood]} {pick.mood}
                      </TableCell>
                      <TableCell>
                        {TYPE_EMOJIS[pick.content_type]} {pick.content_type}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={pick.is_revealed ? 'default' : 'secondary'}
                        >
                          {pick.is_revealed ? '✅ Revealed' : '🎁 Wrapped'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {pick.rating ? (
                          <span className="text-yellow-500">
                            {'⭐'.repeat(pick.rating)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {new Date(pick.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {allPicks.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-8"
                      >
                        No picks yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
