import express from 'express';
import { PaymentService } from '../services/paymentService.js';
import { seedContent, seedPeerProfiles } from '../db/seedData.js';
import { MIN_PAYOUT_THRESHOLD_INR } from '../config.js';

const router = express.Router();

let purchasesStore = [
  // Pre-seed sample purchase for user 'usr-rohit' for testing unlocked content stream
  {
    id: "purch_seed_1",
    user_id: "usr-rohit",
    content_id: "cnt-dbms-norm-video",
    amount_paid: 20.00,
    purchased_at: "2026-08-20T12:00:00Z"
  }
];

let paymentsStore = [];
let earningsLedger = [];
let payoutsStore = [];

/**
 * @route POST /api/payments/create-order
 * @desc Create Razorpay Checkout Order
 */
router.post('/payments/create-order', async (req, res) => {
  const { contentId, userId } = req.body;

  const contentItem = seedContent.find(c => c.id === contentId);
  if (!contentItem) {
    return res.status(404).json({ error: 'Content explanation not found.' });
  }

  // Check if already purchased
  const alreadyPurchased = purchasesStore.some(p => p.user_id === userId && p.content_id === contentId);
  if (alreadyPurchased) {
    return res.json({ alreadyPurchased: true, message: 'You already own this content.' });
  }

  const orderData = await PaymentService.createOrder({
    amountInRupees: contentItem.price,
    contentId,
    userId
  });

  res.json(orderData);
});

/**
 * @route POST /api/payments/verify-payment
 * @desc Verify Razorpay Payment Signature, unlock content, & record earnings split
 */
router.post('/payments/verify-payment', (req, res) => {
  const { orderId, paymentId, signature, contentId, userId } = req.body;

  if (!orderId || !contentId || !userId) {
    return res.status(400).json({ error: 'Order ID, Content ID, and User ID are required.' });
  }

  const isValid = PaymentService.verifySignature({ orderId, paymentId, signature });
  if (!isValid) {
    return res.status(400).json({ error: 'Payment signature verification failed. Unauthorized transaction.' });
  }

  const contentItem = seedContent.find(c => c.id === contentId);
  const amountPaid = contentItem ? contentItem.price : 20.00;

  // 1. Calculate Split
  const split = PaymentService.calculateSplit(amountPaid);

  // 2. Record Payment
  const paymentRecord = {
    id: `pay_${Date.now()}`,
    user_id: userId,
    content_id: contentId,
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId || `pay_mock_${Date.now()}`,
    amount: amountPaid,
    platform_fee: split.platformFee,
    gateway_fee: split.gatewayFee,
    tutor_amount: split.tutorAmount,
    status: 'captured',
    created_at: new Date().toISOString()
  };
  paymentsStore.push(paymentRecord);

  // 3. Unlock Content Purchase
  const purchaseRecord = {
    id: `purch_${Date.now()}`,
    user_id: userId,
    content_id: contentId,
    amount_paid: amountPaid,
    purchased_at: new Date().toISOString()
  };
  purchasesStore.push(purchaseRecord);

  if (contentItem) {
    contentItem.purchase_count += 1;
  }

  // 4. Update Tutor Earnings Balance
  if (contentItem) {
    const peer = seedPeerProfiles.find(p => p.user_id === contentItem.owner_id);
    if (peer) {
      peer.total_earnings = Number((peer.total_earnings + split.tutorAmount).toFixed(2));
      peer.available_balance = Number((peer.available_balance + split.tutorAmount).toFixed(2));
      peer.learners_helped += 1;

      earningsLedger.push({
        id: `earn_${Date.now()}`,
        peer_id: peer.id,
        payment_id: paymentRecord.id,
        gross_amount: amountPaid,
        platform_commission: split.platformFee,
        gateway_fee: split.gatewayFee,
        net_earnings: split.tutorAmount,
        status: 'available',
        created_at: new Date().toISOString()
      });
    }
  }

  res.json({
    success: true,
    message: 'Payment verified successfully! Content unlocked.',
    purchase: purchaseRecord,
    split
  });
});

/**
 * @route GET /api/purchases/user/:userId
 * @desc Get all purchases by user ID
 */
router.get('/purchases/user/:userId', (req, res) => {
  const userPurchases = purchasesStore.filter(p => p.user_id === req.params.userId);

  const hydrated = userPurchases.map(p => {
    const content = seedContent.find(c => c.id === p.content_id);
    return {
      ...p,
      content
    };
  });

  res.json(hydrated);
});

/**
 * @route GET /api/purchases/check-access
 * @desc Check if user has purchased specified content
 */
router.get('/purchases/check-access', (req, res) => {
  const { userId, contentId } = req.query;
  const content = seedContent.find(c => c.id === contentId);

  if (!content) {
    return res.json({ hasAccess: false });
  }

  if (content.is_free) {
    return res.json({ hasAccess: true, isFree: true });
  }

  const hasPurchased = purchasesStore.some(p => p.user_id === userId && p.content_id === contentId);
  res.json({ hasAccess: hasPurchased });
});

/**
 * @route POST /api/payouts/request
 * @desc Submit Peer Payout Request (Min ₹250 threshold)
 */
router.post('/payouts/request', (req, res) => {
  const { peer_id, amount } = req.body;
  const requestedAmount = Number(amount);

  if (requestedAmount < MIN_PAYOUT_THRESHOLD_INR) {
    return res.status(400).json({
      error: `Minimum payout threshold is ₹${MIN_PAYOUT_THRESHOLD_INR}. Requested: ₹${requestedAmount}.`
    });
  }

  const peer = seedPeerProfiles.find(p => p.id === peer_id || p.user_id === peer_id);
  if (!peer) {
    return res.status(404).json({ error: 'Peer profile not found.' });
  }

  if (peer.available_balance < requestedAmount) {
    return res.status(400).json({
      error: `Insufficient available balance. Balance: ₹${peer.available_balance}, Requested: ₹${requestedAmount}.`
    });
  }

  peer.available_balance = Number((peer.available_balance - requestedAmount).toFixed(2));

  const payout = {
    id: `payout_${Date.now()}`,
    peer_id: peer.id,
    amount: requestedAmount,
    status: 'requested',
    requested_at: new Date().toISOString()
  };
  payoutsStore.unshift(payout);

  res.json({
    message: 'Payout request submitted successfully. It will be processed by Admin.',
    payout,
    remainingBalance: peer.available_balance
  });
});

export default router;
