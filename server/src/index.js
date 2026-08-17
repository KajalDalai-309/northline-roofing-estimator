import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { seedDatabase } from './config/seedRunner.js';
import apiRouter from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Cross-Origin Resource Sharing
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'Northline Roofing API'
  });
});

// Mount REST API routes
app.use('/api', apiRouter);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err.stack);
  res.status(500).json({
    error: 'An internal server error occurred.',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found.` });
});

// ... (API Routes above)

// --- Production Frontend Serving ---
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build
  app.use(express.static(path.join(__dirname, '../../client/dist')));

  // Catch-all route to serve index.html for React Router
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
} else {
  // 404 Handler for API (Development mode only)
  app.use((req, res) => {
    res.status(404).json({ error: `Route ${req.originalUrl} not found.` });
  });
}

// Start Server after connecting to Database and auto-verifying seed
async function startServer() {
  await connectDB();
  await seedDatabase(false); // Seed only if database is empty

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(` Northline Roofing API Server running on port ${PORT}`);
    console.log(` Public Config:   http://localhost:${PORT}/api/config`);
    console.log(` Health Check:    http://localhost:${PORT}/health`);
    console.log(`=======================================================`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
