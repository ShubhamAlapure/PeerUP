import express from 'express';
import { seedContent, seedPeerProfiles } from '../db/seedData.js';

const router = express.Router();
let ratingsStore = [];

/**
 * @route POST /api/ratings
 * @desc Rate explanation content (1-5 stars, is_helpful boolean, review)
 */
router.post('/ratings', (req, res) => {
  const { user_id, content_id, stars, is_helpful = true, review_text } = req.body;

  if (!user_id || !content_id || !stars) {
    return res.status(400).json({ error: 'User ID, Content ID, and Star rating are required.' });
  }

  const existing = ratingsStore.find(r => r.user_id === user_id && r.content_id === content_id);
  if (existing) {
    return res.status(400).json({ error: 'You have already rated this explanation.' });
  }

  const numStars = Math.min(5, Math.max(1, Number(stars)));
  const ratingRecord = {
    id: `rat_${Date.now()}`,
    user_id,
    content_id,
    stars: numStars,
    is_helpful: Boolean(is_helpful),
    review_text: review_text || '',
    created_at: new Date().toISOString()
  };
  ratingsStore.push(ratingRecord);

  // Update Content average rating
  const contentItem = seedContent.find(c => c.id === content_id);
  if (contentItem) {
    const allRatings = ratingsStore.filter(r => r.content_id === content_id);
    const sum = allRatings.reduce((acc, r) => acc + r.stars, 0);
    contentItem.average_rating = Number((sum / allRatings.length).toFixed(1));
    contentItem.total_ratings = allRatings.length;

    // Update Peer rating
    const peer = seedPeerProfiles.find(p => p.user_id === contentItem.owner_id);
    if (peer) {
      peer.total_reviews += 1;
      const helpfulCount = allRatings.filter(r => r.is_helpful).length;
      peer.helpful_percentage = Math.round((helpfulCount / allRatings.length) * 100);
    }
  }

  res.status(201).json({ message: 'Rating submitted successfully!', rating: ratingRecord });
});

/**
 * @route GET /api/ratings/content/:contentId
 * @desc Get all ratings for a content explanation
 */
router.get('/ratings/content/:contentId', (req, res) => {
  const list = ratingsStore.filter(r => r.content_id === req.params.contentId);
  res.json(list);
});

export default router;
