import express from 'express';

const router = express.Router();
export let reportsStore = [];

/**
 * @route POST /api/reports
 * @desc Report content, peer, assignment, or academic integrity issue
 */
router.post('/reports', (req, res) => {
  const { reporter_id, target_type, target_id, reason, description } = req.body;

  if (!reporter_id || !target_type || !target_id || !reason) {
    return res.status(400).json({ error: 'Reporter ID, target_type, target_id, and reason are required.' });
  }

  const report = {
    id: `rep_${Date.now()}`,
    reporter_id,
    target_type,
    target_id,
    reason,
    description: description || '',
    status: 'pending',
    created_at: new Date().toISOString()
  };

  reportsStore.unshift(report);
  res.status(201).json({ message: 'Report submitted. Our moderation team will review it.', report });
});

/**
 * @route GET /api/reports
 * @desc List reports for Admin review
 */
router.get('/reports', (req, res) => {
  res.json(reportsStore);
});

export default router;
