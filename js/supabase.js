const SUPABASE_URL = "https://ybbykbmsyildhgdpojcb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_8mkuDHmWmvEQSSl7RX464w_re6cY0VF";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
);

console.log("Supabase client created successfully.");