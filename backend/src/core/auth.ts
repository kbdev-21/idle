import 'dotenv/config';
import {createClient} from "@supabase/supabase-js";

if(!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
  throw new Error("Missing env variables");
}

export const auth =  createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
).auth;