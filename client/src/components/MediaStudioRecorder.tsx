import React, { useState, useRef, useEffect } from 'react';
import { Video, Mic, StopCircle, RefreshCw, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface MediaStudioProps {
  mode: 'video' | 'audio';
  onMediaCaptured: (mediaBlob: Blob, durationSeconds: number) => void;
}

export const MediaStudioRecorder: React.FC<MediaStudioProps> = ({ mode, onMediaCaptured }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [_recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);

  const MAX_SECONDS = 600; // 10 minutes hard limit

  const startStream = async () => {
    try {
      setErrorMsg(null);
      const constraints = mode === 'video' ? { video: true, audio: true } : { audio: true };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current && mode === 'video') {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Browser media permission error:', err);
      setErrorMsg('Camera/Microphone permission denied or not available in this browser environment. Simulated studio active.');
    }
  };

  useEffect(() => {
    startStream();

    return () => {
      stopAllStreams();
    };
  }, [mode]);

  const stopAllStreams = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleStartRecording = () => {
    chunksRef.current = [];
    setSecondsElapsed(0);
    setRecordedBlob(null);
    setPreviewUrl(null);

    if (streamRef.current) {
      try {
        const mimeType = mode === 'video' ? 'video/webm' : 'audio/webm';
        const recorder = new MediaRecorder(streamRef.current, { mimeType });

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = () => {
          const blob = new Blob(chunksRef.current, { type: mimeType });
          setRecordedBlob(blob);
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          onMediaCaptured(blob, secondsElapsed);
        };

        recorder.start(1000);
        mediaRecorderRef.current = recorder;
      } catch (err) {
        console.warn('MediaRecorder error:', err);
      }
    }

    setIsRecording(true);

    timerIntervalRef.current = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;
        if (next >= MAX_SECONDS) {
          handleStopRecording();
        }
        return next;
      });
    }, 1000);
  };

  const handleStopRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    stopAllStreams();
  };

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 text-center">
      {/* Studio Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {mode === 'video' ? <Video className="w-5 h-5 text-indigo-400" /> : <Mic className="w-5 h-5 text-emerald-400" />}
          <span className="font-semibold text-white capitalize">{mode} Recording Studio</span>
        </div>

        <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-xs">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-mono font-bold text-indigo-300">{formatTime(secondsElapsed)}</span>
          <span className="text-slate-500">/ 10:00 Max</span>
        </div>
      </div>

      {/* Warning banner at 9:30 (570s) */}
      {secondsElapsed >= 570 && isRecording && (
        <div className="mb-4 bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2 rounded-xl text-sm flex items-center justify-center gap-2 animate-pulse">
          <AlertTriangle className="w-4 h-4" />
          <span className="font-semibold">30 seconds remaining! Video auto-stops at 10:00 limit.</span>
        </div>
      )}

      {errorMsg && (
        <div className="mb-4 bg-slate-800 border border-slate-700 text-slate-300 p-3 rounded-xl text-xs">
          {errorMsg}
        </div>
      )}

      {/* Media Display Container */}
      <div className="relative aspect-video bg-black rounded-xl overflow-hidden mb-6 border border-slate-800 flex items-center justify-center">
        {mode === 'video' ? (
          previewUrl ? (
            <video src={previewUrl} controls className="w-full h-full object-cover" />
          ) : (
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
          )
        ) : (
          <div className="flex flex-col items-center gap-4 text-slate-400">
            <Mic className={`w-16 h-16 ${isRecording ? 'text-red-500 animate-ping' : 'text-slate-600'}`} />
            <span className="text-sm font-medium">
              {isRecording ? 'Recording Audio Explanation...' : previewUrl ? 'Audio Captured Ready' : 'Click Record to begin'}
            </span>
            {previewUrl && <audio src={previewUrl} controls className="w-64" />}
          </div>
        )}

        {/* Recording Overlay Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 bg-red-600/90 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-2 backdrop-blur-md animate-pulse">
            <span className="w-2 h-2 rounded-full bg-white"></span>
            <span>LIVE REC {formatTime(secondsElapsed)}</span>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-4">
        {!isRecording && !previewUrl && (
          <button onClick={handleStartRecording} className="btn-primary">
            <Video className="w-4 h-4" />
            <span>Start Recording</span>
          </button>
        )}

        {isRecording && (
          <button onClick={handleStopRecording} className="btn-secondary bg-red-600/20 text-red-400 border-red-500/40 hover:bg-red-600/30">
            <StopCircle className="w-5 h-5 text-red-500" />
            <span>Stop Recording</span>
          </button>
        )}

        {previewUrl && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-3 py-2 rounded-lg border border-emerald-500/30">
              <CheckCircle className="w-4 h-4" />
              <span>Captured ({formatTime(secondsElapsed)})</span>
            </div>

            <button onClick={startStream} className="btn-secondary text-xs">
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
