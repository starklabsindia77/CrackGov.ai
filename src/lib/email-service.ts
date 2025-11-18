/**
 * Email service integration
 * Supports Resend and SendGrid
 */

interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send email using Resend
 */
async function sendWithResend(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const from = options.from || process.env.RESEND_FROM_EMAIL || "noreply@crackgov.ai";

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to send email");
  }

  const data = await response.json();
  return {
    success: true,
    messageId: data.id,
  };
}

/**
 * Send email using SendGrid
 */
async function sendWithSendGrid(options: EmailOptions): Promise<EmailResult> {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (!apiKey) {
    throw new Error("SENDGRID_API_KEY is not configured");
  }

  const from = options.from || process.env.SENDGRID_FROM_EMAIL || "noreply@crackgov.ai";

  const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { email: from },
      personalizations: [
        {
          to: [{ email: options.to }],
          subject: options.subject,
        },
      ],
      content: [
        {
          type: "text/html",
          value: options.html || options.text || "",
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || "Failed to send email");
  }

  return {
    success: true,
    messageId: response.headers.get("X-Message-Id") || undefined,
  };
}

/**
 * Send email (auto-detects provider)
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  // In development, log to console
  if (process.env.NODE_ENV === "development" && !process.env.RESEND_API_KEY && !process.env.SENDGRID_API_KEY) {
    console.log("Email (stubbed):", {
      to: options.to,
      subject: options.subject,
      html: options.html?.substring(0, 100) + "...",
    });
    return {
      success: true,
      messageId: "stubbed",
    };
  }

  // Try Resend first, then SendGrid
  if (process.env.RESEND_API_KEY) {
    try {
      return await sendWithResend(options);
    } catch (error: any) {
      console.error("Resend error:", error);
      // Fallback to SendGrid if Resend fails
      if (process.env.SENDGRID_API_KEY) {
        return await sendWithSendGrid(options);
      }
      throw error;
    }
  }

  if (process.env.SENDGRID_API_KEY) {
    return await sendWithSendGrid(options);
  }

  throw new Error("No email service configured. Set RESEND_API_KEY or SENDGRID_API_KEY");
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(
  email: string,
  resetToken: string
): Promise<void> {
  const resetUrl = `${process.env.NEXTAUTH_URL}/auth/reset-password?token=${resetToken}`;
  
  await sendEmail({
    to: email,
    subject: "Reset Your Password - CrackGov.ai",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Reset Your Password</h1>
        <p>Click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #14b8a6; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Reset Password
        </a>
        <p>Or copy and paste this link into your browser:</p>
        <p style="word-break: break-all;">${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `,
    text: `Reset your password: ${resetUrl}`,
  });
}

/**
 * Send welcome email
 */
export async function sendWelcomeEmail(email: string, name: string): Promise<void> {
  const dashboardUrl = `${process.env.NEXTAUTH_URL}/app/dashboard`;
  
  await sendEmail({
    to: email,
    subject: "Welcome to CrackGov.ai!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome, ${name}!</h1>
        <p>Thank you for joining CrackGov.ai. We're excited to help you ace your government exams!</p>
        <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background-color: #14b8a6; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Get Started
        </a>
        <p>Happy studying!</p>
      </div>
    `,
    text: `Welcome to CrackGov.ai! Get started: ${dashboardUrl}`,
  });
}

/**
 * Send test result email
 */
export async function sendTestResultEmail(
  email: string,
  testResult: {
    exam: string;
    score: number;
    total: number;
    accuracy: number;
    weakTopics?: string[];
  }
): Promise<void> {
  const resultUrl = `${process.env.NEXTAUTH_URL}/app/test-history`;
  
  await sendEmail({
    to: email,
    subject: `Test Results - ${testResult.exam}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Your Test Results</h1>
        <p><strong>Exam:</strong> ${testResult.exam}</p>
        <p><strong>Score:</strong> ${testResult.score}/${testResult.total}</p>
        <p><strong>Accuracy:</strong> ${testResult.accuracy.toFixed(1)}%</p>
        ${testResult.weakTopics && testResult.weakTopics.length > 0 ? `
          <p><strong>Areas to improve:</strong> ${testResult.weakTopics.join(", ")}</p>
        ` : ""}
        <a href="${resultUrl}" style="display: inline-block; padding: 12px 24px; background-color: #14b8a6; color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          View Detailed Results
        </a>
      </div>
    `,
    text: `Test Results: ${testResult.score}/${testResult.total} (${testResult.accuracy.toFixed(1)}%) - View: ${resultUrl}`,
  });
}

