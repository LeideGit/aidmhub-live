// Public Supabase settings. The publishable key is public by design; access is enforced by RLS.
// Leave empty to run the offline in-memory demo.
window.APP_CONFIG = {
    supabaseUrl: "https://nfjfrzbxgxetzmttcpxi.supabase.co",
    supabaseAnonKey: "sb_publishable_gUcireLgwsggOObPS64omw_ibP-vooD",
    // hCaptcha SITE key (public). Required when CAPTCHA is enabled in Supabase Attack Protection.
    hcaptchaSiteKey: "",
    // Set to true once the bot-reply Edge Function is deployed (BACKEND.md).
    llmBot: false
};
