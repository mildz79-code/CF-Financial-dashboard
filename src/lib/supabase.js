import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = url && key ? createClient(url, key) : null;

/**
 * Fetch 2026 monthly category summary from Supabase.
 * Returns null if credentials are not configured or the query fails.
 */
export async function fetch2026Summary() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('pl_category_summary')
      .select('*')
      .eq('year', 2026)
      .order('month');
    if (error) {
      console.warn('Supabase query failed, using static data:', error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.warn('Supabase unavailable, using static data:', e.message);
    return null;
  }
}

/**
 * Fetch 2026 monthly line-item data for a specific source.
 * Returns null if credentials are not configured or the query fails.
 */
export async function fetch2026Monthly(source = 'actual') {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('pl_monthly_wide')
      .select('*')
      .eq('year', 2026)
      .eq('source', source);
    if (error) {
      console.warn('Supabase query failed, using static data:', error.message);
      return null;
    }
    return data;
  } catch (e) {
    console.warn('Supabase unavailable, using static data:', e.message);
    return null;
  }
}
