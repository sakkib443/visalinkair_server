// ===================================================================
// Visalink Air - Main Application File
// Express app setup with all routes and middleware
// মূল এপ্লিকেশন ফাইল - সব routes এবং middleware এখানে connect হয়েছে
// ===================================================================

import cors from 'cors';
import express, { Application, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import { UPLOAD_DIR, PUBLIC_PATH } from './app/utils/fileStorage';

// ==================== Middleware Imports ====================
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFoundHandler from './app/middlewares/notFoundHandler';
import config from './app/config';

// ==================== Route Imports ====================
import { AuthRoutes } from './app/modules/auth/auth.routes';
import { UserRoutes } from './app/modules/user/user.routes';
import { uploadRoutes } from './app/modules/upload/upload.routes';
import { BlogRoutes } from './app/modules/blog/blog.routes';
// VisaCategoryRoutes removed with the Visa Categories feature.
import { VisaGuideRoutes } from './app/modules/visaGuide/visaGuide.routes';
// CountryRoutes removed with the Countries feature.
// TourRoutes removed with the Tour Packages feature.
import { HajjUmrahRoutes } from './app/modules/hajjUmrah/hajjUmrah.routes';
import { HotelRoutes } from './app/modules/hotel/hotel.routes';
// VisaDocumentRoutes removed with the Documents feature.
// VisaApplicationRoutes removed with the Visa Applications feature.
import { PdfExtractRoutes } from './app/modules/pdfExtract/pdfExtract.routes';
import { TestimonialRoutes } from './app/modules/testimonial/testimonial.routes';
import { SettingsRoutes } from './app/modules/settings/settings.routes';
import { HomeContentRoutes } from './app/modules/homeContent/homeContent.routes';
import { LegalPolicyRoutes } from './app/modules/legalPolicy/legalPolicy.routes';
import { ServiceRoutes } from './app/modules/service/service.routes';
import { InquiryRoutes } from './app/modules/inquiry/inquiry.routes';
import { RemarkRoutes } from './app/modules/remark/remark.routes';
import { AnalyticsRoutes } from './app/modules/analytics/analytics.routes';
import { CourseRoutes } from './app/modules/course/course.routes';

// ==================== App Initialization ====================
const app: Application = express();

// ==================== Global Middlewares ====================
// JSON body parser. `verify` stashes the raw bytes so the WhatsApp webhook can
// validate Meta's X-Hub-Signature-256 (does not alter parsing for other routes).
app.use(
  express.json({
    limit: '10mb',
    verify: (req, _res, buf) => {
      (req as unknown as { rawBody?: Buffer }).rawBody = buf;
    },
  })
);

// URL encoded parser
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parser (for refresh token)
app.use(cookieParser());

// CORS configuration - supports multiple origins for production
const allowedOrigins = [
  config.frontend_url,
  'http://localhost:3000',
  'https://visapro.vercel.app',
  'https://visalinkair.com',
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all origins in production for API
      }
    },
    credentials: true, // Allow cookies
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// ==================== Static Files (Uploads) ====================
// আপলোড করা ছবি/ফাইল এখান থেকেই সার্ভ হয়। ফাইলনেমে timestamp + random
// hash থাকে বলে একই URL-এর কনটেন্ট কখনো বদলায় না — তাই immutable + ১ বছর
// cache নিরাপদ, আর এতে বারবার একই ছবি ডাউনলোড হয় না।
app.use(
  PUBLIC_PATH,
  express.static(UPLOAD_DIR, {
    maxAge: '1y',
    immutable: true,
    // ডিরেক্টরি লিস্টিং বা লুকানো ফাইল সার্ভ করতে দেওয়া হবে না।
    index: false,
    dotfiles: 'ignore',
    setHeaders: (res) => {
      // আপলোড করা ফাইল ব্রাউজার যেন নিজের ইচ্ছেমতো HTML/JS ধরে না চালায়।
      res.setHeader('X-Content-Type-Options', 'nosniff');
    },
  })
);

// ==================== Health Check Route ====================
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: '🚀 Visalink Air API Server is running!',
    version: '1.0.0',
    environment: config.env,
    timestamp: new Date().toISOString(),
  });
});

// ==================== API Health Check ====================
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'API is healthy',
    uptime: process.uptime(),
  });
});

// ==================== API Routes ====================
// Authentication routes (public)
app.use('/api/auth', AuthRoutes);

// User routes (authenticated)
app.use('/api/users', UserRoutes);

// Upload routes (authenticated)
app.use('/api/upload', uploadRoutes);

// Blog routes (blog posts and comments)
app.use('/api/blogs', BlogRoutes);

// (Visa Category routes removed with the Visa Categories feature.)

// Visa Guide routes (admin-authored tourist/student visa detail pages —
// drives the public country search and the visa details page)
app.use('/api/visa-guides', VisaGuideRoutes);

// (Country routes removed with the Countries feature.)

// (Tour routes removed with the Tour Packages feature.)

// Hajj & Umrah routes
app.use('/api/hajj-umrah', HajjUmrahRoutes);

// Hotel routes
app.use('/api/hotels', HotelRoutes);

// (Visa Document routes removed with the Documents feature.)
// (Visa Application routes removed with the Visa Applications feature.)

// PDF Extract routes (admin ticket generator)
app.use('/api/pdf-extract', PdfExtractRoutes);

// Ticket CRUD routes (save/edit/list tickets)
import { TicketRoutes } from './app/modules/ticket/ticket.routes';
app.use('/api/tickets', TicketRoutes);

// (Document Entry routes removed with the Documents feature.)

// Testimonial routes (user reviews on homepage)
app.use('/api/testimonials', TestimonialRoutes);

// Settings routes (site contact/social — singleton, admin-controlled)
app.use('/api/settings', SettingsRoutes);

// Home Content routes (homepage sections — admin-controlled)
app.use('/api/home-content', HomeContentRoutes);

// Legal Policy routes (Privacy & Refund policies — admin-controlled)
app.use('/api/legal-policies', LegalPolicyRoutes);
app.use('/api/services', ServiceRoutes);
app.use('/api/inquiries', InquiryRoutes);
app.use('/api/remarks', RemarkRoutes);

// Analytics routes (admin dashboard financial & booking stats)
app.use('/api/analytics', AnalyticsRoutes);

// Course routes (admin-authored courses + dynamic course categories)
app.use('/api/courses', CourseRoutes);



// ==================== Error Handling ====================
// 404 Not Found handler (must be after all routes)
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
