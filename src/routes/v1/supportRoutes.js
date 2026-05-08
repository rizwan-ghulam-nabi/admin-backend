const express = require('express');
const router = express.Router();
const SupportTicket = require('../../models/SupportTicket');
const { protect } = require('../../middleware/auth');

// ==================== ADMIN ROUTES ====================

// GET /api/v1/support/tickets - Get all tickets (admin only)
router.get('/tickets', protect, async (req, res) => {
  try {
    // Check if user is admin (you can adjust based on your role system)
    if (req.user && req.user.role !== 'admin' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const tickets = await SupportTicket.find().sort('-createdAt');
    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/support/tickets/:id - Get single ticket (admin only)
router.get('/tickets/:id', protect, async (req, res) => {
  try {
    if (req.user && req.user.role !== 'admin' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/v1/support/tickets/:id/status - Update ticket status (admin only)
router.put('/tickets/:id/status', protect, async (req, res) => {
  try {
    if (req.user && req.user.role !== 'admin' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const { status } = req.body;
    const validStatuses = ['pending', 'in-progress', 'resolved', 'closed'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status. Must be: pending, in-progress, resolved, closed' 
      });
    }
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/v1/support/tickets/:id/reply - Reply to ticket (admin only)
router.post('/tickets/:id/reply', protect, async (req, res) => {
  try {
    if (req.user && req.user.role !== 'admin' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const { reply } = req.body;
    
    if (!reply || !reply.trim()) {
      return res.status(400).json({ success: false, message: 'Reply message is required' });
    }
    
    const ticket = await SupportTicket.findByIdAndUpdate(
      req.params.id,
      { 
        adminReply: reply,
        repliedAt: new Date(),
        status: 'in-progress'
      },
      { new: true }
    );
    
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    
    res.json({ success: true, data: ticket });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/v1/support/tickets/:id - Delete ticket (admin only)
router.delete('/tickets/:id', protect, async (req, res) => {
  try {
    if (req.user && req.user.role !== 'admin' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const ticket = await SupportTicket.findByIdAndDelete(req.params.id);
    if (!ticket) {
      return res.status(404).json({ success: false, message: 'Ticket not found' });
    }
    res.json({ success: true, message: 'Ticket deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/v1/support/stats - Get ticket statistics (admin only)
router.get('/stats', protect, async (req, res) => {
  try {
    if (req.user && req.user.role !== 'admin' && req.user.role !== 'Super Admin') {
      return res.status(403).json({ success: false, message: 'Admin access required' });
    }
    
    const stats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const result = {
      total: 0,
      pending: 0,
      'in-progress': 0,
      resolved: 0,
      closed: 0
    };
    
    stats.forEach(stat => {
      result[stat._id] = stat.count;
      result.total += stat.count;
    });
    
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PUBLIC ROUTE (for customers) ====================
// POST /api/v1/support/contact - Create ticket (public - no auth required)
router.post('/contact', async (req, res) => {
  try {
    const { name, email, orderNumber, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide name, email, subject, and message' 
      });
    }
    
    const ticket = await SupportTicket.create({
      name,
      email,
      orderNumber: orderNumber || null,
      subject,
      message,
      status: 'pending'
    });
    
    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    console.error('Error creating ticket:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;