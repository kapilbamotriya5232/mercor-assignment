import { resend, EMAIL_CONFIG, formatEmailAddress } from './client';
import { ActivationEmail } from './templates/activation';
import { createActivationToken } from '../auth/activation-token';
import { renderAsync } from '@react-email/components';

export interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  react?: React.ReactElement;
  from?: string;
  replyTo?: string;
}

/**
 * Send an email using Resend
 */
export async function sendEmail(options: SendEmailOptions) {
  try {
    const result = await resend.emails.send({
      from: options.from || formatEmailAddress(EMAIL_CONFIG.from.email, EMAIL_CONFIG.from.name),
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      react: options.react,
      replyTo: options.replyTo || EMAIL_CONFIG.replyTo,
    });

    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to send email' };
  }
}

/**
 * Send activation email to new employee
 */
export async function sendActivationEmail(
  employeeId: string,
  email: string,
  name: string
) {
  try {
    // Create activation token
    const token = await createActivationToken(employeeId, email);
    
    // Build activation link
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const activationLink = `${baseUrl}/activate/${token}`;
    
    // Send email with React Email template
    console.log('sending email to :', email)
    const result = await sendEmail({
      to: email,
      subject: 'Activate your Mercor account',
      react: ActivationEmail({
        name,
        activationLink,
        expiresIn: '24 hours',
      }),
    });
    console.log('sent email  :', result)

    if (!result.success) {
      throw new Error(result.error);
    }

    return { 
      success: true, 
      data: {
        emailId: result.data?.data?.id,
        token,
        activationLink,
      }
    };
  } catch (error) {
    console.error('Failed to send activation email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send activation email' 
    };
  }
}

/**
 * Resend activation email (for cases where the original wasn't received)
 */
export async function resendActivationEmail(email: string) {
  try {
    // Find employee by email
    const { prisma } = await import('../db');
    const employee = await prisma.employee.findUnique({
      where: { email },
    });

    if (!employee) {
      return { success: false, error: 'Employee not found' };
    }

    // Check if already activated
    if (employee.authUserId) {
      const authUser = await prisma.authUser.findUnique({
        where: { id: employee.authUserId },
      });
      
      if (authUser?.isActive) {
        return { success: false, error: 'Account already activated' };
      }
    }

    // Invalidate any existing tokens
    await prisma.activationToken.updateMany({
      where: {
        employeeId: employee.id,
        used: false,
      },
      data: {
        used: true,
        usedAt: new Date(),
      },
    });

    // Send new activation email
    return await sendActivationEmail(employee.id, employee.email, employee.name);
  } catch (error) {
    console.error('Failed to resend activation email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to resend activation email' 
    };
  }
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  name: string,
  resetToken: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const resetLink = `${baseUrl}/reset-password/${resetToken}`;
  
  // For now, using a simple HTML email
  // You can create a React Email template for this later
  const html = `
    <h2>Reset Your Password</h2>
    <p>Hi ${name},</p>
    <p>You requested to reset your password. Click the link below to set a new password:</p>
    <p><a href="${resetLink}" style="background: #5469d4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Reset Password</a></p>
    <p>Or copy this link: ${resetLink}</p>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
  `;

  return await sendEmail({
    to: email,
    subject: 'Reset your Mercor password',
    html,
  });
}

/**
 * Send welcome email after successful activation
 */
export async function sendWelcomeEmail(
  email: string,
  name: string
) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const downloadLink = `${baseUrl}/download`;
  
  // Simple HTML for now
  const html = `
    <h2>Welcome to Mercor, ${name}!</h2>
    <p>Your account has been successfully activated.</p>
    <p>You can now download the Mercor desktop application to start tracking your time:</p>
    <p><a href="${downloadLink}" style="background: #5469d4; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Download Desktop App</a></p>
    <p>Need help getting started? Contact our support team at support@mercor.com</p>
  `;

  return await sendEmail({
    to: email,
    subject: 'Welcome to Mercor!',
    html,
  });
}

/**
 * Send notification email to admin when new employee is created
 */
export async function sendAdminNotificationEmail(
  adminEmail: string,
  employeeName: string,
  employeeEmail: string
) {
  const html = `
    <h3>New Employee Added</h3>
    <p>A new employee has been added to your organization:</p>
    <ul>
      <li><strong>Name:</strong> ${employeeName}</li>
      <li><strong>Email:</strong> ${employeeEmail}</li>
      <li><strong>Status:</strong> Activation email sent</li>
    </ul>
    <p>The employee will receive an activation email to complete their registration.</p>
  `;

  return await sendEmail({
    to: adminEmail,
    subject: `New employee added: ${employeeName}`,
    html,
  });
}
