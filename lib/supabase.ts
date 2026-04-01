import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { ContentType } from "./content-types";

let _supabase: SupabaseClient | null = null;

function getSupabase(): SupabaseClient {
  if (!_supabase) {
    _supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

export interface PostSlot {
  slot: number;
  time: string;
  content_type: string;
}

export interface XSettings {
  id: boolean;
  posting_enabled: boolean;
  daily_tweet_limit: number;
  min_spacing_minutes: number;
  active_posting_windows: {
    posts_per_day: number;
    schedule: PostSlot[];
  };
  grok_prompt: string | null;
  generation_model: string;
  generation_lead_minutes: number;
  content_types: ContentType[] | null;
  last_tick_at: string | null;
  last_tick_result: { actions: string[] } | null;
  api_key: string | null;
  api_secret: string | null;
  access_token: string | null;
  access_token_secret: string | null;
  updated_at: string;
}

export interface TweetQueueRow {
  id: string;
  topic: string;
  type: string;
  text: string;
  cta_url: string | null;
  source_url: string | null;
  status: string;
  scheduled_at: string | null;
  posted_at: string | null;
  failed_at: string | null;
  error_message: string | null;
  batch: string | null;
  created_at: string;
}

export async function getSettings(): Promise<XSettings> {
  const { data, error } = await getSupabase()
    .from("x_settings")
    .select("*")
    .single();
  if (error) throw new Error(`Failed to load settings: ${error.message}`);
  return data as XSettings;
}

export async function updateSettings(updates: Partial<XSettings>): Promise<XSettings> {
  const { data, error } = await getSupabase()
    .from("x_settings")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", true)
    .select()
    .single();
  if (error) throw new Error(`Failed to update settings: ${error.message}`);
  return data as XSettings;
}

export async function getTodayQueue(todayStart: string): Promise<TweetQueueRow[]> {
  const { data, error } = await getSupabase()
    .from("tweet_queue")
    .select("*")
    .gte("scheduled_at", todayStart)
    .order("scheduled_at", { ascending: true });
  if (error) throw new Error(`Failed to load queue: ${error.message}`);
  return (data || []) as TweetQueueRow[];
}

export async function insertTweet(tweet: Partial<TweetQueueRow>): Promise<TweetQueueRow> {
  const { data, error } = await getSupabase()
    .from("tweet_queue")
    .insert(tweet)
    .select()
    .single();
  if (error) throw new Error(`Failed to insert tweet: ${error.message}`);
  return data as TweetQueueRow;
}

export async function updateTweet(id: string, updates: Partial<TweetQueueRow>): Promise<void> {
  const { error } = await getSupabase()
    .from("tweet_queue")
    .update(updates)
    .eq("id", id);
  if (error) throw new Error(`Failed to update tweet: ${error.message}`);
}
