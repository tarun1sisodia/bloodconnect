import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'bloodconnect.noreply@gmail.com',
    pass: process.env.EMAIL_PASSWORD || ''
  },
  from: process.env.EMAIL_FROM || 'BloodConnect <bloodconnect.noreply@gmail.com>'
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: emailConfig.host,
    port: emailConfig.port,
    secure: emailConfig.secure,
    auth: {
      user: emailConfig.auth.user,
      pass: emailConfig.auth.pass
    }
  });
};

// Send email function
export const sendEmail = async (to, subject, html, options = {}) => {
  try {
    // Check if email sending is disabled in development
    if (process.env.NODE_ENV === 'development' && process.env.DISABLE_EMAILS === 'true') {
      console.log('Email sending is disabled in development mode');
      console.log(`Would send email to: ${to}`);
      console.log(`Subject: ${subject}`);
      console.log(`Content: ${html.substring(0, 100)}...`);
      
      return { 
        success: true, 
        message: 'Email sending skipped in development',
        info: null
      };
    }
    
    // Create transporter
    const transporter = createTransporter();
    
    // Setup email data
    const mailOptions = {
      from: emailConfig.from,
      to,
      subject,
      html,
      ...options
    };
    
    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log(`Email sent to ${to}: ${info.messageId}`);
    
    return { 
      success: true, 
      message: 'Email sent successfully',
      info 
    };
  } catch (error) {
    console.error('Error sending email:', error);
    
    return { 
      success: false, 
      message: `Failed to send email: ${error.message}`,
      error 
    };
  }
};

// Send templated email
export const sendTemplatedEmail = async (to, templateFn, templateData = {}, options = {}) => {
  try {
    // Get email content from template
    const { subject, html } = templateFn(...Object.values(templateData));
    
    // Send the email
    return await sendEmail(to, subject, html, options);
  } catch (error) {
    console.error('Error sending templated email:', error);
    
    return { 
      success: false, 
      message: `Failed to send templated email: ${error.message}`,
      error 
    };
  }
};

// Send bulk emails
export const sendBulkEmails = async (emailsData) => {
  const results = [];
  
  for (const emailData of emailsData) {
    const { to, subject, html, options = {} } = emailData;
    const result = await sendEmail(to, subject, html, options);
    results.push(result);
  }
  
  return results;
};

// Send bulk templated emails
export const sendBulkTemplatedEmails = async (templatedEmailsData) => {
  const results = [];
  
  for (const emailData of templatedEmailsData) {
    const { to, templateFn, templateData = {}, options = {} } = emailData;
    const result = await sendTemplatedEmail(to, templateFn, templateData, options);
    results.push(result);
  }
  
  return results;
};

// Email templates
export const emailTemplates = {
  // Welcome email template
  welcome: (name) => {
    return {
      subject: 'Welcome to BloodConnect!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e53e3e;">Welcome to BloodConnect!</h1>
          <p>Hello ${name},</p>
          <p>Thank you for joining BloodConnect. We're excited to have you as part of our community dedicated to saving lives through blood donation.</p>
          <p>With your account, you can:</p>
          <ul>
            <li>Find blood donors in your area</li>
            <li>Create blood donation requests</li>
            <li>Track your donation history</li>
            <li>Connect with people in need</li>
          </ul>
          <p>If you have any questions, please don't hesitate to contact us.</p>
          <p>Best regards,<br>The BloodConnect Team</p>
        </div>
      `
    };
  },
  
  // Blood request created template
  requestCreated: (requestDetails) => {
    return {
      subject: 'Your Blood Request Has Been Created',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e53e3e;">Blood Request Created</h1>
          <p>Your blood request for ${requestDetails.patientName} has been created successfully.</p>
          <p>Request details:</p>
          <ul>
            <li>Blood Type: ${requestDetails.bloodType}</li>
            <li>Units Needed: ${requestDetails.units}</li>
            <li>Hospital: ${requestDetails.hospital}</li>
            <li>Urgency: ${requestDetails.urgency}</li>
          </ul>
          <p>We will notify you when we find matching donors.</p>
          <p>Best regards,<br>The BloodConnect Team</p>
        </div>
      `
    };
  },
  
  // Donor match notification template
  donorMatch: (requestDetails, donorCount) => {
    return {
      subject: 'Matching Donors Found for Your Blood Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e53e3e;">Matching Donors Found</h1>
          <p>Good news! We've found ${donorCount} potential donors for your blood request.</p>
          <p>Request details:</p>
          <ul>
            <li>Patient: ${requestDetails.patientName}</li>
            <li>Blood Type: ${requestDetails.bloodType}</li>
            <li>Hospital: ${requestDetails.hospital}</li>
          </ul>
          <p>The donors have been notified and will contact you if they're available to donate.</p>
          <p>Best regards,<br>The BloodConnect Team</p>
        </div>
      `
    };
  },
  
  // Donation request notification template
  donationRequest: (requesterName, requestDetails) => {
    return {
      subject: 'Urgent: Blood Donation Request',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #e53e3e;">Blood Donation Request</h1>
          <p>Hello,</p>
          <p>${requesterName} is looking for blood donors with blood type ${requestDetails.bloodType}.</p>
          <p>Request details:</p>
          <ul>
            <li>Patient: ${requestDetails.patientName}</li>
            <li>Blood Type: ${requestDetails.bloodType}</li>
            <li>Units Needed: ${requestDetails.units}</li>
            <li>Hospital: ${requestDetails.hospital}</li>
            <li>Location: ${requestDetails.location}</li>
            <li>Urgency: ${requestDetails.urgency}</li>
          </ul>
          <p>If you're available to donate, please log in to your BloodConnect account and volunteer for this request.</p>
          <p>Your donation can save a life!</p>
          <p>Best regards,<br>The BloodConnect Team</p>
        </div>
      `
    };
  }
};
