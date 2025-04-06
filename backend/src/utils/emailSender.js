const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

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

// Email templates
const emailTemplates = {
  // Welcome email when a user registers
  welcome: (name) => ({
    subject: 'Welcome to BloodConnect',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 5px;">
               <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #e53e3e;">BloodConnect</h1>
        </div>
        <div>
          <h2>Welcome, ${name}!</h2>
          <p>Thank you for joining BloodConnect. We're excited to have you as part of our community dedicated to saving lives through blood donation.</p>
          <p>With your BloodConnect account, you can:</p>
          <ul>
            <li>Register as a blood donor</li>
            <li>Find blood donors in your area</li>
            <li>Make blood donation requests</li>
            <li>Track your donation history</li>
          </ul>
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:8081'}" style="background-color: #e53e3e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Visit BloodConnect</a>
          </div>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; font-size: 12px; color: #666;">
          <p>© ${new Date().getFullYear()} BloodConnect. All rights reserved.</p>
          <p>123 Blood Center St., City, State 12345</p>
        </div>
      </div>
    `
  }),

  // New blood request notification to potential donors
  donorMatch: (donorName, patientName, bloodType, hospital, location) => ({
    subject: `Urgent: Blood Donation Request for ${bloodType}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #e53e3e;">BloodConnect</h1>
        </div>
        <div>
          <h2>Hello, ${donorName}!</h2>
          <p>We have an urgent request for <strong>${bloodType}</strong> blood type in your area.</p>
          <p><strong>Patient:</strong> ${patientName}</p>
          <p><strong>Hospital:</strong> ${hospital}</p>
          <p><strong>Location:</strong> ${location}</p>
          <p>As a registered donor with a matching blood type, your help could save a life. If you're available to donate, please respond as soon as possible.</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:8081'}/login.html" style="background-color: #e53e3e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Respond to Request</a>
          </div>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; font-size: 12px; color: #666;">
          <p>© ${new Date().getFullYear()} BloodConnect. All rights reserved.</p>
          <p>If you no longer wish to receive these notifications, you can update your preferences in your profile settings.</p>
        </div>
      </div>
    `
  }),

  // Request status update to requester
  requestUpdate: (requesterName, patientName, status, donorCount) => ({
    subject: `Update on Blood Request for ${patientName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e5e5; border-radius: 5px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #e53e3e;">BloodConnect</h1>
        </div>
        <div>
          <h2>Hello, ${requesterName}!</h2>
          <p>We have an update on your blood request for ${patientName}.</p>
          <p>Status: <strong>${status}</strong></p>
          ${donorCount ? `<p>We've found ${donorCount} potential donors who have been notified of your request.</p>` : ''}
          <p>You can check the details and contact information of matched donors by logging into your account.</p>
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:8081'}/login.html" style="background-color: #e53e3e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Request Details</a>
          </div>
        </div>
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e5e5; text-align: center; font-size: 12px; color: #666;">
          <p>© ${new Date().getFullYear()} BloodConnect. All rights reserved.</p>
          <p>If you need immediate assistance, please contact our support team.</p>
        </div>
      </div>
    `
  })
};

// Send email function
const sendEmail = async (to, subject, html, options = {}) => {
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
const sendTemplatedEmail = async (to, templateName, templateData = {}, options = {}) => {
  try {
    // Get template function
    const templateFn = emailTemplates[templateName];
    
    if (!templateFn) {
      throw new Error(`Email template '${templateName}' not found`);
    }
    
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
const sendBulkEmails = async (emailsData) => {
  const results = [];
  
  for (const emailData of emailsData) {
    const { to, subject, html, options = {} } = emailData;
    const result = await sendEmail(to, subject, html, options);
    results.push(result);
  }
  
  return results;
};

// Send bulk templated emails
const sendBulkTemplatedEmails = async (templatedEmailsData) => {
  const results = [];
  
  for (const emailData of templatedEmailsData) {
    const { to, templateName, templateData = {}, options = {} } = emailData;
    const result = await sendTemplatedEmail(to, templateName, templateData, options);
    results.push(result);
  }
  
  return results;
};

module.exports = {
  sendEmail,
  sendTemplatedEmail,
  sendBulkEmails,
  sendBulkTemplatedEmails,
  emailTemplates
};
