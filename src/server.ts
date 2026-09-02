// ===================================================================
// Visalink Air - Server Entry Point
// সার্ভার শুরু করার মূল ফাইল - MongoDB connect এবং server start
// ===================================================================

import mongoose from 'mongoose';
import app from './app';
import config from './app/config';

// ==================== Uncaught Exception Handler ====================
// Synchronous errors যা try-catch দিয়ে catch হয়নি
process.on('uncaughtException', (error) => {
  console.error('💥 UNCAUGHT EXCEPTION! Shutting down...');
  console.error('Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});

// ==================== Cleanup Stale Indexes ====================
// Remove old indexes that cause duplicate key errors
async function cleanupStaleIndexes() {
  try {
    const db = mongoose.connection.db;
    if (!db) return;

    const collections = await db.listCollections().toArray();
    const usersCollection = collections.find(c => c.name === 'users');

    if (usersCollection) {
      const indexes = await db.collection('users').indexes();
      const staleIndex = indexes.find((idx: any) => idx.name === 'id_1');

      if (staleIndex) {
        await db.collection('users').dropIndex('id_1');
        console.log('🧹 Dropped stale id_1 index from users collection');
      }
    }
  } catch (error) {
    // Silently ignore if index doesn't exist
  }
}

// ==================== Database Connection ====================
async function bootstrap() {
  try {
    // Connect to MongoDB
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(config.database_url);
    console.log('✅ MongoDB connected successfully!');

    // Cleanup stale indexes
    await cleanupStaleIndexes();

    // Start server
    const server = app.listen(config.port, () => {
      console.log('');
      console.log('╔══════════════════════════════════════════════╗');
      console.log('║                                              ║');
      console.log('║   🛂 Visalink Air API Server Started!              ║');
      console.log('║                                              ║');
      console.log(`║   🌐 URL: http://localhost:${config.port}               ║`);
      console.log(`║   🔧 Environment: ${config.env.padEnd(21)}   ║`);
      console.log('║                                              ║');
      console.log('╚══════════════════════════════════════════════╝');
      console.log('');
      console.log('📚 API Endpoints:');
      console.log('   • POST   /api/auth/register   - Student registration');
      console.log('   • POST   /api/auth/login      - User login');
      console.log('   • GET    /api/courses         - List courses');
      console.log('   • GET    /api/categories      - List categories');
      console.log('   • GET    /api/products        - Digital products');
      console.log('');
    });

    // ==================== Unhandled Rejection Handler ====================
    // Async errors যা catch হয়নি
    process.on('unhandledRejection', (error: Error) => {
      console.error('💥 UNHANDLED REJECTION! Shutting down...');
      console.error('Error:', error.message);

      // Gracefully close server
      server.close(() => {
        process.exit(1);
      });
    });

    // ==================== SIGTERM Handler ====================
    // For graceful shutdown (Docker, Heroku etc.)
    process.on('SIGTERM', () => {
      console.log('👋 SIGTERM received. Shutting down gracefully...');
      server.close(() => {
        console.log('💤 Process terminated.');
      });
    });

  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    process.exit(1);
  }
}

// ==================== Start Server ====================
bootstrap();
