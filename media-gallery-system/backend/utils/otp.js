const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Create transporter for Gmail
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_EMAIL,
      pass: process.env.GMAIL_APP_PASSWORD // Use app-specific password
    }
  });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return crypto.randomInt(100000, 999999).toString();
};

// Generate OTP with expiration time (15 minutes)
const generateOTPWithExpiry = () => {
  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
  return { code, expiresAt };
};

// Verify OTP
const verifyOTP = (storedOTP, providedOTP) => {
  if (!storedOTP || !storedOTP.code || !storedOTP.expiresAt) {
    return { valid: false, message: 'No OTP found' };
  }
  
  if (new Date() > storedOTP.expiresAt) {
    return { valid: false, message: 'OTP has expired' };
  }
  
  if (storedOTP.code !== providedOTP) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  return { valid: true, message: 'OTP verified successfully' };
};

// Send verification email
const sendVerificationEmail = async (email, name, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Media Gallery System',
        address: process.env.GMAIL_EMAIL
      },
      to: email,
      subject: 'Email Verification - Media Gallery System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; padding: 20px; text-align: center; border-radius: 8px; border: 2px dashed #667eea; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Media Gallery System!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Thank you for registering with Media Gallery System. To complete your account verification, please use the OTP code below:</p>
              
              <div class="otp-box">
                <p>Your verification code is:</p>
                <div class="otp-code">${otp}</div>
                <p><small>This code will expire in 15 minutes</small></p>
              </div>
              
              <p>If you didn't create an account with us, please ignore this email.</p>
              
              <div class="footer">
                <p>Best regards,<br>Media Gallery System Team</p>
                <p><small>This is an automated email. Please do not reply to this message.</small></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset email
const sendPasswordResetEmail = async (email, name, otp) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Media Gallery System',
        address: process.env.GMAIL_EMAIL
      },
      to: email,
      subject: 'Password Reset - Media Gallery System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #ff6b6b 0%, #feca57 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .otp-box { background: white; padding: 20px; text-align: center; border-radius: 8px; border: 2px dashed #ff6b6b; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #ff6b6b; letter-spacing: 4px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>We received a request to reset your password for your Media Gallery System account. Use the OTP code below to proceed:</p>
              
              <div class="otp-box">
                <p>Your password reset code is:</p>
                <div class="otp-code">${otp}</div>
                <p><small>This code will expire in 15 minutes</small></p>
              </div>
              
              <div class="warning">
                <strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email and your password will remain unchanged.
              </div>
              
              <div class="footer">
                <p>Best regards,<br>Media Gallery System Team</p>
                <p><small>This is an automated email. Please do not reply to this message.</small></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email (after successful verification)
const sendWelcomeEmail = async (email, name) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: {
        name: 'Media Gallery System',
        address: process.env.GMAIL_EMAIL
      },
      to: email,
      subject: 'Welcome to Media Gallery System!',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #26de81 0%, #20bf6b 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .feature-list { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .feature { display: flex; align-items: center; margin: 10px 0; }
            .feature-icon { width: 20px; height: 20px; background: #26de81; border-radius: 50%; margin-right: 15px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
            .button { display: inline-block; background: #26de81; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome Aboard!</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Congratulations! Your account has been successfully verified and you're now part of the Media Gallery System community.</p>
              
              <div class="feature-list">
                <h3>What you can do now:</h3>
                <div class="feature">
                  <div class="feature-icon"></div>
                  <span>Upload and organize your media files</span>
                </div>
                <div class="feature">
                  <div class="feature-icon"></div>
                  <span>Create personal and shared galleries</span>
                </div>
                <div class="feature">
                  <div class="feature-icon"></div>
                  <span>Download media as ZIP files</span>
                </div>
                <div class="feature">
                  <div class="feature-icon"></div>
                  <span>Tag and search your content</span>
                </div>
              </div>
              
              <p style="text-align: center;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" class="button">Start Exploring</a>
              </p>
              
              <div class="footer">
                <p>Best regards,<br>Media Gallery System Team</p>
                <p><small>Need help? Contact us at ${process.env.GMAIL_EMAIL}</small></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('Welcome email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generateOTP,
  generateOTPWithExpiry,
  verifyOTP,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail
};