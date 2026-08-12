import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@/lib/supabase/server'
import { ensureProfile } from '@/lib/ensure-profile'
import { humanizeDbError } from '@/lib/db-errors'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { mood, content_type } = body

    if (!mood || !content_type) {
      return NextResponse.json(
        { error: 'mood and content_type are required' },
        { status: 400 }
      )
    }

    const validMoods = [
      'happy',
      'sad',
      'excited',
      'bored',
      'stressed',
      'romantic',
      'adventurous',
    ]
    const validTypes = ['movie', 'book', 'podcast', 'activity']

    if (!validMoods.includes(mood) || !validTypes.includes(content_type)) {
      return NextResponse.json(
        { error: 'Invalid mood or content_type' },
        { status: 400 }
      )
    }

    // Call Claude to generate recommendation
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `You are a creative recommendation engine for BlindPick, a mystery recommendation platform.

Generate a single ${content_type} recommendation for someone who is feeling ${mood}.

Respond with ONLY valid JSON in this exact format (no markdown, no extra text):
{
  "title": "The exact title of the ${content_type}",
  "description": "A compelling 2-3 sentence description that intrigues without revealing too much",
  "why_fits_mood": "A brief explanation (1-2 sentences) of why this perfectly fits a ${mood} mood"
}

Make the recommendation genuinely fitting for the mood. Be creative and specific — avoid generic choices.`,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return NextResponse.json(
        { error: 'Unexpected response from AI' },
        { status: 500 }
      )
    }

    let recommendation
    try {
      recommendation = JSON.parse(content.text)
    } catch {
      return NextResponse.json(
        { error: 'Failed to parse AI response' },
        { status: 500 }
      )
    }

    // auth.users is shared across all ten apps in this project, and nothing
    // created a BlindPick profile except this app's own signup form — so an
    // account made elsewhere authenticates fine and then has no row to hang
    // blindpick_picks.user_id off. This used to detect that and tell the user
    // to contact support, which is a dead end for something we can just fix:
    // provision the profile on first write instead.
    if (!(await ensureProfile(user))) {
      return NextResponse.json(
        { error: 'We could not finish setting up your BlindPick account. Please try again.' },
        { status: 500 }
      )
    }

    // Store in database
    const { data: pick, error: insertError } = await supabase
      .from('blindpick_picks')
      .insert({
        user_id: user.id,
        mood,
        content_type,
        recommendation,
        is_revealed: false,
      })
      .select()
      .single()

    if (insertError) {
      console.error('pick insert failed:', `${insertError.code ?? '?'}: ${insertError.message ?? '?'}`)
      return NextResponse.json(
        { error: humanizeDbError(insertError, 'Could not save your pick. Please try again.') },
        { status: 500 }
      )
    }

    return NextResponse.json({ pick })
  } catch (e: unknown) {
    const error = e as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
