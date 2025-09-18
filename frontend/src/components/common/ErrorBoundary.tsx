import * as React from 'react';

type State = { hasError: boolean; error: Error | null };

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, error: null };
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    // Log error to service
    // eslint-disable-next-line no-console
    console.error(error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
          <p className="mb-4 text-gray-500">{this.state.error?.message}</p>
          <button className="px-4 py-2 bg-accent text-white rounded" onClick={() => this.setState({ hasError: false, error: null })}>
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
export default ErrorBoundary;