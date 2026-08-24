import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '../.env' });
dotenv.config();

export const PORT = process.env.PORT || 5001;
export const SUPABASE_URL = process.env.SUPABASE_URL || 'https://peerup.supabase.co';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'mock-anon-key';
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'mock-service-key';

export const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_peerup_sandbox';
export const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'razorpay_secret_peerup_sandbox';

export const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID || 'mux_token_sandbox';
export const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET || 'mux_secret_sandbox';

export const PLATFORM_COMMISSION_PERCENT = Number(process.env.PLATFORM_COMMISSION_PERCENT) || 25;
export const MIN_PAYOUT_THRESHOLD_INR = Number(process.env.MIN_PAYOUT_THRESHOLD_INR) || 250;

// Initialize Supabase Client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
