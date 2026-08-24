const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api';

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({ error: 'API Request Failed' }));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }

  return res.json();
}

// Institution & Academic API
export const getInstitutions = (query = '', city = '', state = '') =>
  fetchApi<any[]>(`/institutions?query=${encodeURIComponent(query)}&city=${encodeURIComponent(city)}&state=${encodeURIComponent(state)}`);

export const getInstitutionTree = (instId: string) =>
  fetchApi<any>(`/institutions/${instId}/academic-tree`);

// Peer API
export const getPeers = (instId = '') =>
  fetchApi<any[]>(`/peers?institution_id=${instId}`);

export const getPeerDetails = (peerId: string) =>
  fetchApi<any>(`/peers/${peerId}`);

export const submitPeerVerification = (data: { user_id: string; institution_email?: string; student_id_card_url?: string }) =>
  fetchApi<any>('/peers/verify-request', { method: 'POST', body: JSON.stringify(data) });

// Content & Assignment API
export const getContentList = (params: { institution_id?: string; subject_id?: string; content_type?: string; is_free?: boolean; search?: string } = {}) => {
  const query = new URLSearchParams();
  if (params.institution_id) query.append('institution_id', params.institution_id);
  if (params.subject_id) query.append('subject_id', params.subject_id);
  if (params.content_type) query.append('content_type', params.content_type);
  if (params.is_free !== undefined) query.append('is_free', String(params.is_free));
  if (params.search) query.append('search', params.search);

  return fetchApi<any[]>(`/content?${query.toString()}`);
};

export const getAssignments = (params: { institution_id?: string; search?: string } = {}) => {
  const query = new URLSearchParams();
  if (params.institution_id) query.append('institution_id', params.institution_id);
  if (params.search) query.append('search', params.search);
  return fetchApi<any[]>(`/content/assignments?${query.toString()}`);
};

export const getContentDetails = (contentId: string) =>
  fetchApi<any>(`/content/${contentId}`);

export const createExplanation = (data: any) =>
  fetchApi<any>('/content/create', { method: 'POST', body: JSON.stringify(data) });

// Requests API
export const getRequests = (instId = '') =>
  fetchApi<any[]>(`/requests?institution_id=${instId}`);

export const createTopicRequest = (data: any) =>
  fetchApi<any>('/requests/create', { method: 'POST', body: JSON.stringify(data) });

// Payment & Access API
export const createRazorpayOrder = (contentId: string, userId: string) =>
  fetchApi<any>('/payments/create-order', { method: 'POST', body: JSON.stringify({ contentId, userId }) });

export const verifyPayment = (data: { orderId: string; paymentId: string; signature?: string; contentId: string; userId: string }) =>
  fetchApi<any>('/payments/verify-payment', { method: 'POST', body: JSON.stringify(data) });

export const checkAccess = (userId: string, contentId: string) =>
  fetchApi<{ hasAccess: boolean; isFree?: boolean }>(`/purchases/check-access?userId=${userId}&contentId=${contentId}`);

export const getUserPurchases = (userId: string) =>
  fetchApi<any[]>(`/purchases/user/${userId}`);

export const requestPayout = (peer_id: string, amount: number) =>
  fetchApi<any>('/payouts/request', { method: 'POST', body: JSON.stringify({ peer_id, amount }) });

// Ratings & Reports
export const submitRating = (data: { user_id: string; content_id: string; stars: number; is_helpful?: boolean; review_text?: string }) =>
  fetchApi<any>('/ratings', { method: 'POST', body: JSON.stringify(data) });

export const submitReport = (data: { reporter_id: string; target_type: string; target_id: string; reason: string; description?: string }) =>
  fetchApi<any>('/reports', { method: 'POST', body: JSON.stringify(data) });

// Admin API
export const getAdminAnalytics = () =>
  fetchApi<any>('/admin/analytics');

export const verifyPeerAdmin = (user_id: string, action: 'approve' | 'reject') =>
  fetchApi<any>('/admin/verify-peer', { method: 'POST', body: JSON.stringify({ user_id, action }) });

export const moderateContentAdmin = (content_id: string, action: 'approve' | 'reject' | 'remove') =>
  fetchApi<any>('/admin/moderate-content', { method: 'POST', body: JSON.stringify({ content_id, action }) });
