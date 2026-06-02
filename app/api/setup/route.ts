import { Pool } from 'pg'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url)
  if (searchParams.get('token') !== process.env.SETUP_TOKEN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  })
  const client = await pool.connect()

  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS blindpick_users (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT,
        role TEXT DEFAULT 'user' CHECK (role IN ('admin','user')),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      GRANT ALL ON blindpick_users TO anon, authenticated;
      ALTER TABLE blindpick_users ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='bp_users_self' AND tablename='blindpick_users') THEN
          CREATE POLICY "bp_users_self" ON blindpick_users FOR ALL USING (auth.uid()=id OR (SELECT role FROM blindpick_users WHERE id=auth.uid())='admin');
        END IF;
      END $$;
      CREATE TABLE IF NOT EXISTS blindpick_picks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES blindpick_users(id) ON DELETE CASCADE,
        mood TEXT NOT NULL,
        content_type TEXT NOT NULL,
        recommendation JSONB NOT NULL,
        is_revealed BOOLEAN DEFAULT false,
        rating INTEGER CHECK (rating BETWEEN 1 AND 5),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      GRANT ALL ON blindpick_picks TO anon, authenticated;
      ALTER TABLE blindpick_picks ENABLE ROW LEVEL SECURITY;
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname='bp_picks_user' AND tablename='blindpick_picks') THEN
          CREATE POLICY "bp_picks_user" ON blindpick_picks FOR ALL USING (user_id=auth.uid() OR (SELECT role FROM blindpick_users WHERE id=auth.uid())='admin');
        END IF;
      END $$;
    `)
    return NextResponse.json({ status: 'Migration complete' })
  } catch (e: unknown) {
    const error = e as Error
    return NextResponse.json({ error: error.message }, { status: 500 })
  } finally {
    client.release()
    await pool.end()
  }
}
