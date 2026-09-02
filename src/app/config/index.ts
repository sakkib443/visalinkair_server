// ===================================================================
// visalinkair Backend - Configuration File
// কনফিগারেশন ফাইল - সব environment variables এখানে manage হবে
// ===================================================================

import dotenv from 'dotenv';
import path from 'path';

// Load .env file from root directory
// রুট ডিরেক্টরি থেকে .env ফাইল লোড করা হচ্ছে
dotenv.config({ path: path.join(process.cwd(), '.env') });

export default {
  // ==================== Server Configuration ====================
  // সার্ভার কনফিগারেশন
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,

  // ==================== Database Configuration ====================
  // ডাটাবেস কনফিগারেশন (MongoDB)
  database_url: process.env.DATABASE_URL || 'mongodb://localhost:27017/visalinkair',

  // ==================== JWT Configuration ====================
  // JWT টোকেন কনফিগারেশন (Authentication)
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET || 'your-super-secret-access-key',
    refresh_secret: process.env.JWT_REFRESH_SECRET || 'your-super-secret-refresh-key',
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || '1d',
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  // ==================== Bcrypt Configuration ====================
  // Password hashing এর জন্য salt rounds
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,

  // ==================== Upload / File Storage ====================
  // ফাইল আপলোড এখন নিজের হোস্টিংয়েই হয় (Cloudinary বাদ)।
  //   dir         → যেখানে ফাইল লেখা হবে। প্রোডাকশনে এটা অবশ্যই একটা
  //                 persistent volume হতে হবে, নাহলে প্রতি redeploy-এ সব মুছে যাবে।
  //   public_path → যে URL prefix-এ ফাইলগুলো সার্ভ হয়। DB-তে এই prefix সহ
  //                 relative path জমা থাকে (যেমন /uploads/blog/x.webp), পুরো URL নয় —
  //                 ফলে ডোমেইন বদলালেও পুরোনো ছবি ভাঙে না।
  upload: {
    dir: process.env.UPLOAD_DIR || path.join(process.cwd(), 'uploads'),
    public_path: '/uploads',
  },

  // ==================== Email Configuration ====================
  // ইমেইল পাঠানোর জন্য SMTP সেটিংস
  email: {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT) || 587,
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || '',
    from: process.env.EMAIL_FROM || 'info@visalinkair.com',
  },

  // ==================== Frontend URL ====================
  // Frontend URL (CORS এবং password reset link এর জন্য)
  frontend_url: process.env.FRONTEND_URL || 'http://localhost:3000',

  // ==================== Pagination Defaults ====================
  // ডিফল্ট পেজিনেশন সেটিংস
  pagination: {
    default_page: 1,
    default_limit: 10,
    max_limit: 100,
  },

  // ==================== bKash Payment Configuration ====================
  // বিকাশ পেমেন্ট গেটওয়ে সেটিংস
  bkash: {
    app_key: process.env.BKASH_APP_KEY || 'demo_app_key',
    app_secret: process.env.BKASH_APP_SECRET || 'demo_app_secret',
    username: process.env.BKASH_USERNAME || 'demo_username',
    password: process.env.BKASH_PASSWORD || 'demo_password',
    base_url: process.env.BKASH_BASE_URL || 'https://tokenized.sandbox.bka.sh/v1.2.0-beta',
  },

  // ==================== Nagad Payment Configuration ====================
  // নগদ পেমেন্ট গেটওয়ে সেটিংস
  nagad: {
    merchant_id: process.env.NAGAD_MERCHANT_ID || 'demo_merchant',
    merchant_number: process.env.NAGAD_MERCHANT_NUMBER || '01XXXXXXXXX',
    public_key: process.env.NAGAD_PUBLIC_KEY || '',
    private_key: process.env.NAGAD_PRIVATE_KEY || '',
    base_url: process.env.NAGAD_BASE_URL || 'https://sandbox-ssl.mynagad.com',
  },

  // ==================== SSLCommerz Configuration ====================
  // SSL Commerz পেমেন্ট গেটওয়ে সেটিংস
  sslcommerz: {
    store_id: process.env.SSL_STORE_ID || 'demo_store',
    store_password: process.env.SSL_STORE_PASSWORD || 'demo_password',
    is_live: process.env.SSL_IS_LIVE === 'true',
  },

  // ==================== Stripe Configuration ====================
  // Stripe পেমেন্ট গেটওয়ে সেটিংস
  stripe: {
    secret_key: process.env.STRIPE_SECRET_KEY || '',
    publishable_key: process.env.STRIPE_PUBLISHABLE_KEY || '',
    webhook_secret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },

  // ==================== WhatsApp Business Cloud API ====================
  // Meta WhatsApp Cloud API — শুধু .env-এ credential বসালেই সত্যিকারের WhatsApp
  // lead অটো ঢুকবে। Empty থাকলে integration নিষ্ক্রিয় থাকে; demo/simulate তবু চলে।
  //   verify_token       → Meta webhook setup-এ যেটা দিবেন, হুবহু এটাই হতে হবে
  //   access_token       → auto-reply পাঠাতে (খালি থাকলে reply পাঠাবে না)
  //   phone_number_id    → আপনার WhatsApp number-এর Cloud API id
  //   app_secret         → payload signature verify (খালি থাকলে verify skip)
  whatsapp: {
    verify_token: process.env.WHATSAPP_VERIFY_TOKEN || 'visalinkair_verify_token',
    access_token: process.env.WHATSAPP_ACCESS_TOKEN || '',
    phone_number_id: process.env.WHATSAPP_PHONE_NUMBER_ID || '',
    app_secret: process.env.WHATSAPP_APP_SECRET || '',
    api_version: process.env.WHATSAPP_API_VERSION || 'v21.0',
    // Auto-reply is on by default but only actually sends when access_token is set.
    auto_reply: process.env.WHATSAPP_AUTO_REPLY !== 'false',
    auto_reply_text:
      process.env.WHATSAPP_AUTO_REPLY_TEXT ||
      'Thank you for contacting Visalink Air! 🌍 Our team has received your message and will get back to you shortly.',
  },
};
