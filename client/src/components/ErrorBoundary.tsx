import { Component, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
            style={{ background: 'rgba(255, 71, 87, 0.1)' }}
          >
            <AlertTriangle size={32} style={{ color: 'var(--color-risk-critical)' }} />
          </div>
          <h2
            className="font-display text-2xl font-bold mb-3"
            style={{ color: 'var(--color-text-primary)' }}
          >
            Something went wrong
          </h2>
          <p className="text-sm mb-2 max-w-md" style={{ color: 'var(--color-text-secondary)' }}>
            An unexpected error occurred. Please try again.
          </p>
          <p className="text-xs mb-6 font-mono max-w-lg" style={{ color: 'var(--color-text-muted)' }}>
            {this.state.error?.message}
          </p>
          <button onClick={this.handleReset} className="btn-glow flex items-center gap-2">
            <RefreshCw size={16} /> Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
