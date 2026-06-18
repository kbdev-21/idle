import 'dotenv/config';
import { createClient } from "@supabase/supabase-js";
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;
if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing env variables");
}
export const auth = createClient(supabaseUrl, supabaseKey).auth;
