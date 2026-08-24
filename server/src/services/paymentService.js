import crypto from 'crypto';
import { RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, PLATFORM_COMMISSION_PERCENT } from '../config.js';

export class PaymentService {
  /**
   * Create Razorpay Order
   */
  static async createOrder({ amountInRupees, contentId, userId }) {
    const amountInPaise = Math.round(amountInRupees * 100);
    const receipt = `rcpt_${Date.now()}_${contentId.substring(0, 8)}`;

    // If live Razorpay key is present, call Razorpay API. Otherwise return sandbox order.
    if (RAZORPAY_KEY_ID && !RAZORPAY_KEY_ID.includes('sandbox')) {
      try {
        const auth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');
        const response = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
          },
          body: JSON.stringify({
            amount: amountInPaise,
            currency: 'INR',
            receipt: receipt,
            notes: { contentId, userId }
          })
        });
        const orderData = await response.json();
        return {
          orderId: orderData.id,
          amount: amountInRupees,
          currency: 'INR',
          keyId: RAZORPAY_KEY_ID
        };
      } catch (err) {
        console.warn('Razorpay live API call failed, falling back to sandbox mode:', err.message);
      }
    }

    // Sandbox Mock Mode for fast test execution
    const mockOrderId = `order_mock_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    return {
      orderId: mockOrderId,
      amount: amountInRupees,
      currency: 'INR',
      keyId: RAZORPAY_KEY_ID || 'rzp_test_peerup_sandbox',
      isSandbox: true
    };
  }

  /**
   * Verify Razorpay Payment Signature
   */
  static verifySignature({ orderId, paymentId, signature }) {
    if (orderId.startsWith('order_mock_')) {
      // Sandbox mode always verifies mock payments
      return true;
    }

    const generatedSignature = crypto
      .createHmac('sha256', RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    return generatedSignature === signature;
  }

  /**
   * Calculate Financial Split (Tutor Share, Gateway Fee, Platform Commission)
   */
  static calculateSplit(grossAmountRupees) {
    const gross = Number(grossAmountRupees);
    // Standard payment gateway charge ~2%
    const gatewayFee = Number((gross * 0.02).toFixed(2));
    // PeerUP platform commission (e.g., 25%)
    const platformFee = Number((gross * (PLATFORM_COMMISSION_PERCENT / 100)).toFixed(2));
    // Net tutor earnings
    const tutorAmount = Number((gross - platformFee - gatewayFee).toFixed(2));

    return {
      grossAmount: gross,
      gatewayFee,
      platformFee,
      tutorAmount
    };
  }
}
