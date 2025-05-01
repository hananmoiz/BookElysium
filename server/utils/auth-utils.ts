import crypto from 'crypto';
import { db } from '../db.js';
import { users, User } from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Generate a random token
 */
export function generateToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Create a verification token for a user
 */
export async function createVerificationToken(userId: number): Promise<string> {
  const token = generateToken();
  
  await db
    .update(users)
    .set({
      verificationToken: token,
    })
    .where(eq(users.id, userId));
  
  return token;
}

/**
 * Verify a user using their verification token
 */
export async function verifyUser(token: string): Promise<boolean> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.verificationToken, token));
    
    if (!user) {
      return false;
    }
    
    await db
      .update(users)
      .set({
        isVerified: true,
        verificationToken: null,
      })
      .where(eq(users.id, user.id));
    
    return true;
  } catch (error) {
    console.error('Error verifying user:', error);
    return false;
  }
}

/**
 * Create a password reset token for a user
 */
export async function createPasswordResetToken(email: string): Promise<{ token: string, userId: number } | null> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    
    if (!user) {
      return null;
    }
    
    const token = generateToken();
    const expires = new Date(Date.now() + 3600000); // 1 hour from now
    
    await db
      .update(users)
      .set({
        resetPasswordToken: token,
        resetPasswordExpires: expires,
      })
      .where(eq(users.id, user.id));
    
    return { token, userId: user.id };
  } catch (error) {
    console.error('Error creating password reset token:', error);
    return null;
  }
}

/**
 * Verify a password reset token
 */
export async function verifyPasswordResetToken(token: string): Promise<User | null> {
  try {
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.resetPasswordToken, token));
    
    if (!user) {
      return null;
    }
    
    // Check if the token has expired
    if (user.resetPasswordExpires && user.resetPasswordExpires < new Date()) {
      return null;
    }
    
    return user;
  } catch (error) {
    console.error('Error verifying password reset token:', error);
    return null;
  }
}

/**
 * Reset a user's password using their reset token
 */
export async function resetPassword(token: string, newPassword: string): Promise<boolean> {
  try {
    const user = await verifyPasswordResetToken(token);
    
    if (!user) {
      return false;
    }
    
    await db
      .update(users)
      .set({
        password: newPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      })
      .where(eq(users.id, user.id));
    
    return true;
  } catch (error) {
    console.error('Error resetting password:', error);
    return false;
  }
}