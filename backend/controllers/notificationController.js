import Notification from '../models/Notification.js';
import { sendEmail } from '../utils/mail.js';

// Helper to build email HTML
const buildEmailHtml = (notification) => {
  const { type, trackingNumber, subject, body, recipient } = notification;
  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>${subject}</title></head>
    <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #1A1A2E;">
      <div style="background-color: #F8F9FD; padding: 30px; border-radius: 12px; border: 1px solid #E2E5F0;">
        <div style="text-align: center; margin-bottom: 25px;">
          <img src="https://thecargogrid.com/logo.png" alt="The Cargo Grid" style="height: 50px;" />
          <h2 style="color: #2B0071; margin-top: 10px;">${subject}</h2>
        </div>
        <div style="background: white; padding: 25px; border-radius: 8px; border: 1px solid #E2E5F0;">
          <p style="font-size: 16px; line-height: 1.6; white-space: pre-wrap;">${body}</p>
          ${trackingNumber ? `<p style="margin-top: 20px; font-weight: bold;">Tracking Number: <span style="color: #2B0071;">${trackingNumber}</span></p>` : ''}
          <p style="margin-top: 10px; font-size: 14px; color: #666;">Notification Type: ${type}</p>
        </div>
        <div style="margin-top: 20px; text-align: center; font-size: 12px; color: #999;">
          <p>© ${new Date().getFullYear()} The Cargo Grid. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

// @desc    Get all notifications
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single notification by id
// @route   GET /api/notifications/:id
// @access  Private
export const getNotificationById = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ success: true, notification });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a notification (from system events)
// @route   POST /api/notifications
// @access  Private
export const createNotification = async (req, res, next) => {
  try {
    const { type, trackingNumber, recipient, subject, body, attachments, triggeredBy } = req.body;
    if (!type || !trackingNumber || !recipient || !subject || !body) {
      return res.status(400).json({ message: 'Type, tracking, recipient, subject, and body are required' });
    }

    // Create notification in DB with 'Pending' status
    const notification = await Notification.create({
      type,
      trackingNumber,
      recipient,
      subject,
      body,
      attachments: attachments || [],
      triggeredBy: triggeredBy || '',
      status: 'Pending',
      createdBy: req.userId,
    });

    // Send email via Resend
    const html = buildEmailHtml(notification);
    const result = await sendEmail({
      to: recipient,
      subject: subject,
      html: html,
    });

    // Update status based on email result
    if (result.success) {
      notification.status = 'Sent';
    } else {
      notification.status = 'Failed';
    }
    await notification.save();

    res.status(201).json({
      success: true,
      notification,
      emailSent: result.success,
      emailError: result.error || null,
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    next(err);
  }
};

// @desc    Resend a notification
// @route   POST /api/notifications/:id/resend
// @access  Private
export const resendNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Reset status to Pending
    notification.status = 'Pending';
    await notification.save();

    // Send email via Resend
    const html = buildEmailHtml(notification);
    const result = await sendEmail({
      to: notification.recipient,
      subject: notification.subject,
      html: html,
    });

    // Update status based on email result
    if (result.success) {
      notification.status = 'Sent';
    } else {
      notification.status = 'Failed';
    }
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification resent',
      emailSent: result.success,
      emailError: result.error || null,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update notification status
// @route   PUT /api/notifications/:id
// @access  Private
export const updateNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const allowedFields = ['status', 'type', 'subject', 'body', 'attachments'];
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        notification[field] = req.body[field];
      }
    });

    await notification.save();
    res.status(200).json({ success: true, notification });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete a notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    await notification.deleteOne();
    res.status(200).json({ success: true, message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc    Search notifications
// @route   GET /api/notifications/search?q=...
// @access  Private
export const searchNotifications = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    const notifications = await Notification.find({
      $or: [
        { trackingNumber: { $regex: q, $options: 'i' } },
        { recipient: { $regex: q, $options: 'i' } },
        { subject: { $regex: q, $options: 'i' } },
        { body: { $regex: q, $options: 'i' } },
      ]
    });
    res.status(200).json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

// @desc    Get notification statistics
// @route   GET /api/notifications/stats
// @access  Private
export const getNotificationStats = async (req, res, next) => {
  try {
    const total = await Notification.countDocuments();
    const sent = await Notification.countDocuments({ status: 'Sent' });
    const pending = await Notification.countDocuments({ status: 'Pending' });
    const failed = await Notification.countDocuments({ status: 'Failed' });

    res.status(200).json({
      success: true,
      stats: { total, sent, pending, failed }
    });
  } catch (err) {
    next(err);
  }
};