import express from 'express';
import { seedProfiles, seedPeerProfiles, seedContent, seedInstitutions } from '../db/seedData.js';

const router = express.Router();

let peerProfilesList = [...seedPeerProfiles];

/**
 * @route GET /api/peers
 * @desc Get list of peers with filters (institution, subject, rating)
 */
router.get('/peers', (req, res) => {
  const { institution_id, subject_id, min_rating } = req.query;

  const result = peerProfilesList.map(peer => {
    const user = seedProfiles.find(u => u.id === peer.user_id) || {};
    const inst = seedInstitutions.find(i => i.id === user.institution_id) || {};
    const publishedCount = seedContent.filter(c => c.owner_id === peer.user_id && c.moderation_status === 'published').length;

    return {
      ...peer,
      user_name: user.full_name,
      avatar_url: user.avatar_url,
      institution_name: inst.name,
      verification_status: user.verification_status || 'verified',
      published_count: publishedCount
    };
  });

  let filtered = result;
  if (institution_id) {
    filtered = filtered.filter(p => p.institution_id === institution_id);
  }
  if (min_rating) {
    filtered = filtered.filter(p => p.average_rating >= Number(min_rating));
  }

  res.json(filtered);
});

/**
 * @route GET /api/peers/:id
 * @desc Get peer profile details by peerId or userId
 */
router.get('/peers/:id', (req, res) => {
  const peerIdOrUserId = req.params.id;
  const peer = peerProfilesList.find(p => p.id === peerIdOrUserId || p.user_id === peerIdOrUserId);

  if (!peer) {
    return res.status(404).json({ error: 'Peer profile not found.' });
  }

  const user = seedProfiles.find(u => u.id === peer.user_id) || {};
  const inst = seedInstitutions.find(i => i.id === user.institution_id) || {};
  const explanations = seedContent.filter(c => c.owner_id === peer.user_id);

  res.json({
    ...peer,
    full_name: user.full_name,
    email: user.email,
    avatar_url: user.avatar_url,
    institution_id: user.institution_id,
    institution_name: inst.name,
    verification_status: user.verification_status || 'verified',
    bio: peer.bio || user.bio,
    explanations
  });
});

/**
 * @route POST /api/peers/verify-request
 * @desc Peer Verification Submission
 */
router.post('/peers/verify-request', (req, res) => {
  const { user_id, institution_email, student_id_card_url } = req.body;
  if (!user_id || (!institution_email && !student_id_card_url)) {
    return res.status(400).json({ error: 'User ID and institution email or ID card are required.' });
  }

  const user = seedProfiles.find(u => u.id === user_id);
  if (user) {
    user.verification_status = 'pending';
    user.role = 'peer';
  }

  let peer = peerProfilesList.find(p => p.user_id === user_id);
  if (!peer) {
    peer = {
      id: `peer_${Date.now()}`,
      user_id,
      institution_email,
      student_id_card_url,
      bio: 'Newly registered peer educator.',
      total_earnings: 0,
      available_balance: 0,
      learners_helped: 0,
      average_rating: 5.0,
      total_reviews: 0,
      helpful_percentage: 100,
      created_at: new Date().toISOString()
    };
    peerProfilesList.push(peer);
  }

  res.json({
    message: 'Peer verification submitted successfully. Status is now PENDING review.',
    peer
  });
});

export default router;
