import { useRef, useCallback } from 'react';
import { useAppStore } from '../store/useAppStore';

interface SSEEvent {
  type: 'agent-start' | 'agent-complete' | 'agent-error' | 'log' | 'complete' | 'error';
  agent?: string;
  message?: string;
  error?: string;
  result?: any;
  assessmentId?: string;
  timestamp?: string;
}

type OnEvent = (event: SSEEvent) => void;
type OnComplete = (result: any, assessmentId?: string) => void;
type OnError = (error: string) => void;

export function useAssessmentStream() {
  const eventSourceRef = useRef<EventSource | null>(null);
  const { isDemoMode } = useAppStore();

  const startStream = useCallback(
    (assessmentId: string, onEvent: OnEvent, onComplete: OnComplete, onError: OnError) => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      const es = new EventSource(`/api/assessment/${encodeURIComponent(assessmentId)}/stream`);
      eventSourceRef.current = es;

      es.onmessage = (e) => {
        try {
          const data: SSEEvent = JSON.parse(e.data);
          onEvent(data);

          if (data.type === 'complete' && data.result) {
            onComplete(data.result, data.assessmentId);
            es.close();
          }

          if (data.type === 'error') {
            onError(data.message || data.error || 'Unknown error');
            es.close();
          }
        } catch {
          // ignore parse errors
        }
      };

      es.onerror = () => {
        onError('Connection lost. Please try again.');
        es.close();
      };
    },
    []
  );

  const stopStream = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  return { startStream, stopStream, isDemoMode };
}
