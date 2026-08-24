import express from 'express';
import { seedProfiles, seedPeerProfiles, seedInstitutions, seedContent } from '../db/seedData.js';
import { reportsStore } from './reportRoutes.js';

const router = express.Router();

/**
 * @route GET /api/admin/analytics
 * @desc Overall Platform Metrics & Financial Analytics
 */
router.get('/admin/analytics', (req, res) => {
  const totalUsers = seedProfiles.length;
  const totalInstitutions = seedInstitutions.length;
  const verifiedPeers = seedProfiles.filter(p => p.role === 'peer' && p.verification_status === 'verified').length;
  const pendingVerifications = seedProfiles.filter(p => p.role === 'peer' && p.verification_status === 'pending').length;
  const totalContent = seedContent.length;

  const totalPurchases = seedContent.reduce((acc, c) => acc + (c.purchase_count || 0), 0);
  const totalGrossRevenue = seedContent.reduce((acc, c) => acc + ((c.purchase_count || 0) * c.price), 0);
  const platformRevenue = Number((totalGrossRevenue * 0.25).toFixed(2));
  const tutorPayoutsTotal = Number((totalGrossRevenue * 0.73).toFixed(2));

  res.json({
    metrics: {
      totalUsers,
      totalInstitutions,
      verifiedPeers,
      pendingVerifications,
      totalContent,
      totalPurchases,
      totalGrossRevenue,
      platformRevenue,
      tutorPayoutsTotal,
      pendingReportsCount: reportsStore.filter(r => r.status === 'pending').length
    }
  });
});

/**
 * @route POST /api/admin/verify-peer
 * @desc Approve or Reject Peer Verification
 */
router.post('/admin/verify-peer', (req, res) => {
  const { user_id, action } = req.body; // action = 'approve' | 'reject'
  const user = seedProfiles.find(u => u.id === user_id);

  if (!user) {
    return res.status(404).json({ error: 'User profile not found.' });
  }

  if (action === 'approve') {
    user.verification_status = 'verified';
    user.role = 'peer';
    const peer = seedPeerProfiles.find(p => p.user_id === user_id);
    if (peer) peer.verification_status = 'verified';
  } else {
    user.verification_status = 'rejected';
  }

  res.json({ message: `Peer verification ${action}d successfully.`, user });
});

/**
 * @route POST /api/admin/moderate-content
 * @desc Approve, Reject, or Remove Content Explanation
 */
router.post('/api/admin/moderate-content', (req, res) => {
  const { content_id, action } = req.body; // action = 'approve' | 'reject' | 'remove'
  const content = seedContent.find(c => c.id === content_id);

  if (!content) {
    return res.status(404).json({ error: 'Content item not found.' });
  }

  if (action === 'approve') content.moderation_status = 'published';
  else if (action === 'reject') content.moderation_status = 'rejected';
  else if (action === 'remove') content.moderation_status = 'removed';

  res.json({ message: `Content ${action}d successfully.`, content });
});

export default router;
