import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';

// Load environment variables from .env file
dotenv.config();

// Create Express application instance
const app = express();

// Get port from environment variable, or default to 4000
const PORT = process.env.PORT || 4000;

/**
 * MIDDLEWARE SETUP
 *
 * Middleware are functions that run BEFORE your route handlers.
 * Think of them as "filters" or "preprocessors" for every incoming request.
 */

// 1. CORS middleware - allows frontend (on port 3000) to make requests to backend (on port 4000)
app.use(cors({
  origin: 'http://localhost:3000', // Only allow requests from our frontend
  credentials: true // Allow cookies to be sent with requests (needed for auth)
}));

// 2. JSON body parser - automatically parses JSON request bodies into JavaScript objects
// Without this, req.body would be undefined when frontend sends JSON data
app.use(express.json());

// 3. Cookie parser - allows reading and setting cookies
app.use(cookieParser());

/**
 * ROUTES
 *
 * Routes define what happens when a client makes a request to a specific URL
 */

// Health check route - lets us verify the server is running
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    message: 'Perfume recommender backend is running',
    timestamp: new Date().toISOString()
  });
});

// Test route to demonstrate request/response flow
app.get('/api/hello', (req: Request, res: Response) => {
  res.json({
    message: 'Hello from the backend!',
    receivedAt: new Date().toISOString()
  });
});

// Auth routes - handles signup, login, and verification
app.use('/api/auth', authRoutes);

/**
 * START THE SERVER
 *
 * This tells Express to start listening for HTTP requests on the specified port
 */
app.listen(PORT, () => {
  console.log(`🚀 Backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});