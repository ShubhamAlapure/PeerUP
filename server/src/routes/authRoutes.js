import express from 'express';
import { seedProfiles, seedInstitutions } from '../db/seedData.js';

const router = express.Router();
let memoryProfiles = [...seedProfiles];

/**
 * @route POST /api/auth/register
 * @desc Register user profile
 */
router.post('/register', (req, res) => {
  const { full_name, email, institution_id, role = 'student' } = req.body;
  if (!full_name || !email) {
    return res.status(400).json({ error: 'Full name and email are required.' });
  }

  const existing = memoryProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.json({ message: 'User logged in', user: existing });
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    full_name,
    email,
    avatar_url: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80`,
    institution_id: institution_id || seedInstitutions[0].id,
    role,
    verification_status: role === 'peer' ? 'pending' : 'verified',
    bio: `${role === 'peer' ? 'Peer Educator' : 'Student'} on PeerUP.`,
    created_at: new Date().toISOString()
  };

  memoryProfiles.push(newUser);
  res.status(201).json({ message: 'Registration successful', user: newUser });
});

/**
 * @route POST /api/auth/login
 * @desc Demo Login / Session auth
 */
router.post('/login', (req, res) => {
  const { email } = req.body;
  const user = memoryProfiles.find(p => p.email.toLowerCase() === (email || '').toLowerCase());

  if (!user) {
    // Return default student profile if not found
    return res.json({ user: memoryProfiles[2] });
  }

  res.json({ message: 'Login successful', user });
});

/**
 * @route GET /api/auth/me/:userId
 * @desc Get current user profile
 */
router.get('/me/:userId', (req, res) => {
  const user = memoryProfiles.find(p => p.id === req.params.userId) || memoryProfiles[2];
  res.json(user);
});

export default router;
