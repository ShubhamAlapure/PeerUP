import { MUX_TOKEN_ID, MUX_TOKEN_SECRET } from '../config.js';

export class VideoService {
  /**
   * Validate Video Duration (Hard limit 10 minutes = 600 seconds)
   */
  static validateDuration(durationSeconds) {
    const maxAllowed = 600; // 10 minutes
    if (!durationSeconds || durationSeconds <= 0) {
      return { valid: false, error: 'Video duration must be greater than 0 seconds.' };
    }
    if (durationSeconds > maxAllowed) {
      return {
        valid: false,
        error: `Video exceeds the maximum allowed duration of 10 minutes (600s). Provided duration: ${Math.round(durationSeconds)}s.`
      };
    }
    return { valid: true };
  }

  /**
   * Generate Direct Upload URL (Mux API or Local Streamer Sandbox)
   */
  static async createDirectUpload() {
    if (MUX_TOKEN_ID && MUX_TOKEN_SECRET && !MUX_TOKEN_ID.includes('sandbox')) {
      try {
        const auth = Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64');
        const response = await fetch('https://api.mux.com/video/v1/uploads', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${auth}`
          },
          body: JSON.stringify({
            new_asset_settings: {
              playback_policy: ['public'],
              max_resolution_tier: '1080p'
            },
            cors_origin: '*'
          })
        });
        const data = await response.json();
        if (data && data.data) {
          return {
            uploadUrl: data.data.url,
            uploadId: data.data.id,
            status: data.data.status
          };
        }
      } catch (err) {
        console.warn('Mux direct upload API error, fallback to sandbox video uploader:', err.message);
      }
    }

    // Local Sandbox Mode
    const mockUploadId = `mux_upload_${Date.now()}`;
    return {
      uploadUrl: `/api/content/direct-upload-sandbox/${mockUploadId}`,
      uploadId: mockUploadId,
      status: 'waiting',
      isSandbox: true
    };
  }

  /**
   * Get Authorized Playback Access URL
   */
  static getAuthorizedPlaybackUrl(videoRecord, userHasPurchased) {
    if (!userHasPurchased && videoRecord.is_paid) {
      return { authorized: false, error: 'Access denied. Purchase required to stream video.' };
    }

    if (videoRecord.mux_playback_id) {
      return {
        authorized: true,
        playbackUrl: `https://stream.mux.com/${videoRecord.mux_playback_id}.m3u8`,
        thumbnailUrl: `https://image.mux.com/${videoRecord.mux_playback_id}/thumbnail.png?time=5`
      };
    }

    return {
      authorized: true,
      playbackUrl: videoRecord.video_url || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnailUrl: videoRecord.thumbnail_url || 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80'
    };
  }
}
