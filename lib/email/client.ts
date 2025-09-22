import { Resend } from 'resend';

// Initialize Resend client
export const resend = new Resend(process.env.RESEND_API_KEY);

// Email configuration
export const EMAIL_CONFIG = {
  from: {
    name: 'Mercor',
    email: process.env.RESEND_FROM_EMAIL || 'onboarding@mercor.com',
  },
  replyTo: process.env.RESEND_REPLY_EMAIL || 'support@mercor.com',
};

// Email domains for validation
export const ALLOWED_EMAIL_DOMAINS = process.env.ALLOWED_EMAIL_DOMAINS?.split(',') || [];

/**
 * Validate email domain if domain restrictions are configured
 */
export function isEmailAllowed(email: string): boolean {
  if (ALLOWED_EMAIL_DOMAINS.length === 0) return true;
  
  const domain = email.split('@')[1];
  return ALLOWED_EMAIL_DOMAINS.includes(domain);
}

/**
 * Format email address with name
 */
export function formatEmailAddress(email: string, name?: string): string {
  if (!name) return email;
  return `${name} <${email}>`;
}
