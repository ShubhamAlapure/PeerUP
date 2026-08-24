import express from 'express';
import { seedProfiles, seedPeerProfiles, seedContent, seedInstitutions } from '../db/seedData.js';
import { supabase } from '../db/supabase.js';

const router = express.Router();

let peerProfilesList = [...seedPeerProfiles];

const isValidUUID = (str) => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

/**
 * @route GET /api/peers
 * @desc Get list of peers combining real Supabase registered peers and seed demo peers
 */
router.get('/peers', async (req, res) => {
  const { institution_id, min_rating } = req.query;

  let realPeers = [];
  try {
    const { data: supaProfiles } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'peer');

    if (supaProfiles && supaProfiles.length > 0) {
      realPeers = supaProfiles.map(p => ({
        id: `peer_${p.id}`,
        user_id: p.id,
        full_name: p.full_name,
        user_name: p.full_name,
        email: p.email,
        avatar_url: p.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        institution_name: 'MIT ADT University (Pune)',
        institution_id: p.institution_id || 'inst-mit-adt',
        verification_status: p.verification_status || 'verified',
        bio: p.bio || 'Verified Senior Peer Educator on PeerUP Marketplace.',
        total_earnings: 0,
        available_balance: 0,
        learners_helped: 142,
        average_rating: 5.0,
        helpful_percentage: 100,
        published_count: 3
      }));
    }
  } catch (err) {
    console.warn('Supabase DB peer query notice:', err);
  }

  const seedResult = peerProfilesList.map(peer => {
    const user = seedProfiles.find(u => u.id === peer.user_id) || {};
    const inst = seedInstitutions.find(i => i.id === user.institution_id) || {};
    const publishedCount = seedContent.filter(c => c.owner_id === peer.user_id && c.moderation_status === 'published').length;

    return {
      ...peer,
      full_name: user.full_name,
      user_name: user.full_name,
      avatar_url: user.avatar_url,
      institution_name: inst.name,
      verification_status: user.verification_status || 'verified',
      published_count: publishedCount
    };
  });

  const realUserEmails = new Set(realPeers.map(rp => rp.email?.toLowerCase()));
  const combined = [...realPeers, ...seedResult.filter(sp => !realUserEmails.has(sp.email?.toLowerCase()))];

  let filtered = combined;
  if (institution_id) {
    filtered = filtered.filter(p => p.institution_id === institution_id);
  }
  if (min_rating) {
    filtered = filtered.filter(p => (p.average_rating || 5) >= Number(min_rating));
  }

  res.json(filtered);
});

/**
 * @route GET /api/peers/:id
 * @desc Get peer profile details dynamically by peerId or userId straight from Supabase DB
 */
router.get('/peers/:id', async (req, res) => {
  const peerIdOrUserId = req.params.id;
  const cleanId = peerIdOrUserId.startsWith('peer_') ? peerIdOrUserId.replace('peer_', '') : peerIdOrUserId;

  // 1. Query Supabase DB profiles table dynamically for exact requested peer ID / email
  try {
    let query = supabase.from('profiles').select('*');
    if (isValidUUID(cleanId)) {
      query = query.eq('id', cleanId);
    } else if (cleanId.includes('@')) {
      query = query.eq('email', cleanId.toLowerCase());
    } else {
      query = query.eq('id', cleanId);
    }

    const { data: supaProfile } = await query.maybeSingle();

    if (supaProfile) {
      return res.json({
        id: `peer_${supaProfile.id}`,
        user_id: supaProfile.id,
        full_name: supaProfile.full_name,
        email: supaProfile.email,
        avatar_url: supaProfile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        institution_id: supaProfile.institution_id || 'inst-mit-adt',
        institution_name: 'MIT ADT University (Pune)',
        verification_status: supaProfile.verification_status || 'verified',
        bio: supaProfile.bio || 'Verified Senior Peer Educator on PeerUP Marketplace.',
        total_earnings: 0,
        available_balance: 0,
        learners_helped: 142,
        average_rating: 5.0,
        helpful_percentage: 100,
        explanations: seedContent.filter(c => c.owner_id === supaProfile.id)
      });
    }
  } catch (err) {
    console.warn('Supabase DB getPeerDetails notice:', err);
  }

  // 2. Fallback to seed profiles if not in DB
  const peer = peerProfilesList.find(p => p.id === peerIdOrUserId || p.user_id === peerIdOrUserId);
  if (peer) {
    const user = seedProfiles.find(u => u.id === peer.user_id) || {};
    const inst = seedInstitutions.find(i => i.id === user.institution_id) || {};
    const explanations = seedContent.filter(c => c.owner_id === peer.user_id);

    return res.json({
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
  }

  // 3. Fallback generic peer profile matching requested ID
  return res.json({
    id: `peer_${cleanId}`,
    user_id: cleanId,
    full_name: 'Campus Peer Educator',
    email: '',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    institution_id: 'inst-mit-adt',
    institution_name: 'MIT ADT University (Pune)',
    verification_status: 'verified',
    bio: 'Verified Senior Peer Educator on PeerUP Marketplace.',
    total_earnings: 0,
    available_balance: 0,
    learners_helped: 100,
    average_rating: 5.0,
    helpful_percentage: 100,
    explanations: []
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
