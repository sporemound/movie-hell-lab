import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
  onCrash?: (error: Error, info: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Fail-Soft Canvas Error Boundary
 * 
 * Implements Rebuild Directive Section 9:
 * "Canvas failure should not interrupt playback...
 *  canvas crashes -> canvas disappears -> video/chat/core continue."
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.warn('[Uniflora/CanvasBoundary] Canvas module crashed gracefully:', error, errorInfo);
    this.props.onCrash?.(error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          role="region"
          aria-label="Canvas Paused Notice"
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 99,
            background: 'rgba(20, 10, 15, 0.92)',
            border: '1px solid rgba(230, 57, 70, 0.6)',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#fff',
            fontSize: '0.82rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>🎨 Canvas paused (isolated fail-soft)</span>
          <button
            type="button"
            onClick={this.handleReset}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '4px',
              color: '#fff',
              padding: '2px 8px',
              fontSize: '0.75rem',
              cursor: 'pointer',
            }}
          >
            Restart Canvas
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
