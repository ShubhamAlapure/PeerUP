import express from 'express';
import { seedRequests, seedProfiles, seedInstitutions, seedSubjects, seedTopics } from '../db/seedData.js';
import { supabase } from '../config.js';

const router = express.Router();
let requestStore = [...seedRequests];

const isValidUUID = (str) => {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

/**
 * @route GET /api/requests
 * @desc Get all topic explanation requests
 */
router.get('/requests', async (req, res) => {
  const { institution_id, subject_id, status, requested_peer_id } = req.query;

  let supaResults = [];
  try {
    const { data } = await supabase
      .from('requests')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) supaResults = data;
  } catch (err) {
    console.warn('Supabase DB requests query notice:', err);
  }

  const combined = [...supaResults, ...requestStore];

  let results = combined.map(reqItem => {
    const student = seedProfiles.find(u => u.id === reqItem.student_id) || {};
    const inst = seedInstitutions.find(i => i.id === reqItem.institution_id) || {};
    const subj = seedSubjects.find(s => s.id === reqItem.subject_id) || {};
    const top = seedTopics.find(t => t.id === reqItem.topic_id) || {};

    return {
      ...reqItem,
      student_name: reqItem.student_name || student.full_name || 'Student Learner',
      student_avatar: reqItem.student_avatar || student.avatar_url,
      institution_name: inst.name || 'MIT ADT University (Pune)',
      subject_name: reqItem.subject_name || subj.name || 'General Computer Science',
      topic_name: reqItem.title || top.name
    };
  });

  if (institution_id) {
    results = results.filter(r => r.institution_id === institution_id);
  }
  if (subject_id) {
    results = results.filter(r => r.subject_id === subject_id);
  }
  if (status) {
    results = results.filter(r => r.status === status);
  }
  if (requested_peer_id) {
    results = results.filter(r => r.requested_peer_id === requested_peer_id || !r.requested_peer_id);
  }

  res.json(results);
});

/**
 * @route POST /api/requests/create
 * @desc Student creates a topic request sent to a peer
 */
router.post('/requests/create', async (req, res) => {
  try {
    const {
      student_id,
      requested_peer_id,
      institution_id = 'inst-mit-adt',
      subject_name,
      title,
      description,
      budget = 50
    } = req.body;

    if (!student_id || !title || !description) {
      return res.status(400).json({ error: 'Required fields missing: student_id, title, description.' });
    }

    const newRequest = {
      id: `req_${Date.now()}`,
      student_id,
      requested_peer_id,
      institution_id,
      subject_name: subject_name || 'General Academic Request',
      title,
      description,
      budget: Number(budget),
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      await supabase.from('requests').insert([{
        student_id: isValidUUID(student_id) ? student_id : null,
        requested_peer_id: isValidUUID(requested_peer_id) ? requested_peer_id : null,
        institution_id: isValidUUID(institution_id) ? institution_id : null,
        subject_name: subject_name || 'General Academic Request',
        title,
        description,
        offered_bounty: Number(budget),
        status: 'pending'
      }]);
    } catch (err) {
      console.warn('Supabase request insert notice:', err?.message || err);
    }

    requestStore.unshift(newRequest);
    return res.status(201).json({ message: 'Topic request submitted successfully.', request: newRequest });
  } catch (globalErr) {
    console.error('Create request error:', globalErr);
    return res.status(500).json({ error: 'Internal Server Error submitting topic request.' });
  }
});

export default router;
