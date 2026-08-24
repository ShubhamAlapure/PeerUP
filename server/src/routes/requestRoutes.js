import express from 'express';
import { seedRequests, seedProfiles, seedInstitutions, seedSubjects, seedTopics } from '../db/seedData.js';

const router = express.Router();
let requestStore = [...seedRequests];

/**
 * @route GET /api/requests
 * @desc Get all topic explanation requests
 */
router.get('/requests', (req, res) => {
  const { institution_id, subject_id, status } = req.query;

  let results = requestStore.map(reqItem => {
    const student = seedProfiles.find(u => u.id === reqItem.student_id) || {};
    const inst = seedInstitutions.find(i => i.id === reqItem.institution_id) || {};
    const subj = seedSubjects.find(s => s.id === reqItem.subject_id) || {};
    const top = seedTopics.find(t => t.id === reqItem.topic_id) || {};

    return {
      ...reqItem,
      student_name: student.full_name,
      student_avatar: student.avatar_url,
      institution_name: inst.name,
      subject_name: subj.name,
      topic_name: top.name
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

  res.json(results);
});

/**
 * @route POST /api/requests/create
 * @desc Student creates a topic request
 */
router.post('/requests/create', (req, res) => {
  const {
    student_id,
    institution_id,
    subject_id,
    topic_id,
    title,
    description,
    preferred_type = 'video',
    budget = 20,
    deadline
  } = req.body;

  if (!student_id || !institution_id || !subject_id || !title || !description) {
    return res.status(400).json({ error: 'Required fields missing: student_id, institution_id, subject_id, title, description.' });
  }

  const newRequest = {
    id: `req_${Date.now()}`,
    student_id,
    institution_id,
    subject_id,
    topic_id: topic_id || seedTopics[0].id,
    title,
    description,
    preferred_type,
    budget: Number(budget),
    deadline: deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
    status: 'open',
    created_at: new Date().toISOString()
  };

  requestStore.unshift(newRequest);
  res.status(201).json({ message: 'Explanation request submitted successfully.', request: newRequest });
});

export default router;
