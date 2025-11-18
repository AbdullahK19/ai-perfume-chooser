import { Router, Request, Response } from 'express';
import prisma from '../db';
import {
  hashEmail,
  hashPhone,
  generateOTP,
  getOTPExpiry,
  isOTPValid,
} from '../utils/auth';

const router = Router();

/**
 * POST /api/auth/signup
 *
 * Create a new user account with email + phone
 *
 * Request body:
 * {
 *   email: string,
 *   phone: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string,
 *   otpCode: string  // Only in dev mode! In production, this would be sent via SMS
 * }
 */
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { email, phone } = req.body;

    // Validate input
    if (!email || !phone) {
      return res.status(400).json({
        success: false,
        error: 'Email and phone are required',
      });
    }

    // Hash the email and phone
    const emailHash = hashEmail(email);
    const phoneHash = hashPhone(phone);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { emailHash },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Account with this email already exists',
      });
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        emailHash,
        phoneHash,
      },
    });

    // Generate OTP code
    const code = generateOTP();
    const expiresAt = getOTPExpiry(5); // 5 minutes

    // Save the login code
    await prisma.loginCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    // In dev mode, return the OTP in the response
    // In production, you'd send this via SMS (Twilio, etc.)
    console.log(`\n📱 OTP for ${email}: ${code}`);
    console.log(`   Expires at: ${expiresAt.toISOString()}\n`);

    return res.status(201).json({
      success: true,
      message: 'Account created. Please verify with the code sent to your phone.',
      userId: user.id,
      // DEV ONLY: Include OTP in response for testing
      otpCode: code,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/login
 *
 * Login with email (sends OTP to phone)
 *
 * Request body:
 * {
 *   email: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string,
 *   otpCode: string  // Only in dev mode
 * }
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required',
      });
    }

    // Hash the email
    const emailHash = hashEmail(email);

    // Find the user
    const user = await prisma.user.findUnique({
      where: { emailHash },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email',
      });
    }

    // Generate new OTP code
    const code = generateOTP();
    const expiresAt = getOTPExpiry(5);

    // Save the login code
    await prisma.loginCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    // Dev mode: log the OTP
    console.log(`\n📱 OTP for ${email}: ${code}`);
    console.log(`   Expires at: ${expiresAt.toISOString()}\n`);

    return res.status(200).json({
      success: true,
      message: 'Verification code sent to your phone.',
      userId: user.id,
      // DEV ONLY
      otpCode: code,
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

/**
 * POST /api/auth/verify
 *
 * Verify OTP code and create session
 *
 * Request body:
 * {
 *   userId: string,
 *   code: string
 * }
 *
 * Response:
 * {
 *   success: true,
 *   message: string
 * }
 *
 * Sets a session cookie with the user ID
 */
router.post('/verify', async (req: Request, res: Response) => {
  try {
    const { userId, code } = req.body;

    if (!userId || !code) {
      return res.status(400).json({
        success: false,
        error: 'User ID and code are required',
      });
    }

    // Find the most recent valid code for this user
    const loginCode = await prisma.loginCode.findFirst({
      where: {
        userId,
        code,
        consumed: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!loginCode) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired code',
      });
    }

    // Check if code is expired
    if (!isOTPValid(loginCode.expiresAt)) {
      return res.status(401).json({
        success: false,
        error: 'Code has expired. Please request a new one.',
      });
    }

    // Mark code as consumed
    await prisma.loginCode.update({
      where: { id: loginCode.id },
      data: { consumed: true },
    });

    // Set session cookie
    // In production, you'd want to use a more secure session token
    // For now, we'll just store the user ID
    res.cookie('userId', userId, {
      httpOnly: true, // Can't be accessed by JavaScript
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });

    return res.status(200).json({
      success: true,
      message: 'Verification successful. You are now logged in.',
    });
  } catch (error) {
    console.error('Verify error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;