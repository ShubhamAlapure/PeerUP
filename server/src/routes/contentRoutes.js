import express from 'express';
import { seedContent, seedProfiles, seedInstitutions, seedSubjects, seedTopics } from '../db/seedData.js';
import { VideoService } from '../services/videoService.js';

const router = express.Router();

let contentStore = [...seedContent];

/**
 * @route GET /api/content
 * @desc Get all explanations & assignment references with filtering & search
 */
router.get('/content', (req, res) => {
  const { institution_id, subject_id, topic_id, content_type, is_free, search, difficulty } = req.query;

  let results = contentStore.map(item => {
    const owner = seedProfiles.find(u => u.id === item.owner_id) || {};
    const inst = seedInstitutions.find(i => i.id === item.institution_id) || {};
    const subj = seedSubjects.find(s => s.id === item.subject_id) || {};
    const top = seedTopics.find(t => t.id === item.topic_id) || {};

    return {
      ...item,
      owner_name: owner.full_name,
      owner_avatar: owner.avatar_url,
      owner_role: owner.role,
      institution_name: inst.name,
      subject_name: subj.name,
      topic_name: top.name
    };
  });

  if (institution_id) {
    results = results.filter(c => c.institution_id === institution_id);
  }
  if (subject_id) {
    results = results.filter(c => c.subject_id === subject_id);
  }
  if (topic_id) {
    results = results.filter(c => c.topic_id === topic_id);
  }
  if (content_type) {
    results = results.filter(c => c.content_type === content_type);
  }
  if (is_free !== undefined) {
    const freeBool = is_free === 'true';
    results = results.filter(c => c.is_free === freeBool);
  }
  if (difficulty) {
    results = results.filter(c => c.difficulty === difficulty);
  }
  if (search) {
    const q = search.toLowerCase();
    results = results.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      (c.subject_name && c.subject_name.toLowerCase().includes(q)) ||
      (c.topic_name && c.topic_name.toLowerCase().includes(q)) ||
      (c.owner_name && c.owner_name.toLowerCase().includes(q))
    );
  }

  res.json(results);
});

/**
 * @route GET /api/content/assignments
 * @desc Get Free Assignment References specifically
 */
router.get('/content/assignments', (req, res) => {
  const { institution_id, subject_id, search } = req.query;

  let assignments = contentStore
    .filter(c => c.content_type === 'pdf_explanation' || c.is_free)
    .map(item => {
      const owner = seedProfiles.find(u => u.id === item.owner_id) || {};
      const inst = seedInstitutions.find(i => i.id === item.institution_id) || {};
      const subj = seedSubjects.find(s => s.id === item.subject_id) || {};
      return {
        ...item,
        owner_name: owner.full_name,
        institution_name: inst.name,
        subject_name: subj.name,
        academic_integrity_notice: "For reference and learning purposes only. Do not submit another student's work as your own."
      };
    });

  if (institution_id) {
    assignments = assignments.filter(a => a.institution_id === institution_id);
  }
  if (subject_id) {
    assignments = assignments.filter(a => a.subject_id === subject_id);
  }
  if (search) {
    const q = search.toLowerCase();
    assignments = assignments.filter(a => a.title.toLowerCase().includes(q) || a.description.toLowerCase().includes(q));
  }

  res.json(assignments);
});

/**
 * @route GET /api/content/:id
 * @desc Get single content item by ID
 */
router.get('/content/:id', (req, res) => {
  const item = contentStore.find(c => c.id === req.params.id);
  if (!item) {
    return res.status(404).json({ error: 'Content explanation not found.' });
  }

  const owner = seedProfiles.find(u => u.id === item.owner_id) || {};
  const inst = seedInstitutions.find(i => i.id === item.institution_id) || {};
  const subj = seedSubjects.find(s => s.id === item.subject_id) || {};
  const top = seedTopics.find(t => t.id === item.topic_id) || {};

  res.json({
    ...item,
    owner_name: owner.full_name,
    owner_avatar: owner.avatar_url,
    institution_name: inst.name,
    subject_name: subj.name,
    topic_name: top.name,
    academic_integrity_notice: "For reference and learning purposes only. Do not submit another student's work as your own."
  });
});

/**
 * @route POST /api/content/create
 * @desc Publish new explanation (Text, Audio, Video, PDF)
 */
router.post('/content/create', async (req, res) => {
  const {
    owner_id,
    institution_id,
    subject_id,
    topic_id,
    title,
    description,
    content_type,
    price = 0,
    difficulty = 'intermediate',
    markdown_text,
    audio_url,
    video_url,
    duration_seconds,
    file_url,
    file_name
  } = req.body;

  if (!owner_id || !title || !content_type || !institution_id || !subject_id) {
    return res.status(400).json({ error: 'Required fields missing: owner_id, title, content_type, institution_id, subject_id.' });
  }

  // 10-Minute Video Constraint Check
  if (content_type === 'video') {
    const val = VideoService.validateDuration(duration_seconds || 300);
    if (!val.valid) {
      return res.status(400).json({ error: val.error });
    }
  }

  const numericPrice = Number(price);
  const is_free = numericPrice <= 0;

  const newItem = {
    id: `cnt_${Date.now()}`,
    owner_id,
    institution_id,
    subject_id,
    topic_id: topic_id || seedTopics[0].id,
    title,
    description: description || 'PeerUP student explanation.',
    content_type,
    price: numericPrice,
    is_free,
    moderation_status: 'published',
    difficulty,
    view_count: 0,
    purchase_count: 0,
    average_rating: 5.0,
    total_ratings: 0,
    created_at: new Date().toISOString()
  };

  if (content_type === 'text') {
    newItem.text = { body_markdown: markdown_text || title };
  } else if (content_type === 'video') {
    newItem.video = {
      id: `vid_${Date.now()}`,
      duration_seconds: duration_seconds || 300,
      mux_playback_id: `demo_mux_${Date.now()}`,
      video_url: video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail_url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80'
    };
  } else if (content_type === 'audio') {
    newItem.audio = {
      id: `aud_${Date.now()}`,
      audio_url: audio_url || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration_seconds: duration_seconds || 240,
      file_size: 2500000
    };
  } else if (content_type === 'pdf_explanation') {
    newItem.files = [
      {
        id: `file_${Date.now()}`,
        file_name: file_name || 'Assignment_Reference.pdf',
        file_url: file_url || 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        file_type: 'application/pdf',
        file_size: 500000,
        is_reference_only: true,
        disclaimer: "For reference and learning purposes only. Do not submit another student's work as your own."
      }
    ];
  }

  contentStore.unshift(newItem);
  res.status(201).json({ message: 'Explanation published successfully!', content: newItem });
});

/**
 * @route POST /api/content/direct-upload-url
 * @desc Get Mux or Storage Direct Upload endpoint
 */
router.post('/content/direct-upload-url', async (req, res) => {
  const result = await VideoService.createDirectUpload();
  res.json(result);
});

export default router;
