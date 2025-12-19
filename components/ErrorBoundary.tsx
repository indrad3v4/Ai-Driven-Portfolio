
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

// ErrorBoundary catches runtime errors in the component tree.
// Declaring state as a property and using explicit imports from 'react' ensures 'state' and 'props' are correctly recognized.
class ErrorBoundary extends Component<Props, State> {
  // Initialize state directly as a class property for better TypeScript inference
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // Save to localStorage for mobile debugging as requested
    const logs = JSON.parse(localStorage.getItem('INDRA_DEBUG_LOGS') || '[]');
    logs.push(`[RUNTIME_ERROR] ${new Date().toISOString()}: ${error.message}\n${errorInfo.componentStack}`);
    if (logs.length > 50) logs.shift();
    localStorage.setItem('INDRA_DEBUG_LOGS', JSON.stringify(logs));
  }

  public render(): ReactNode {
    // Correctly accessing state and props through explicit Component inheritance
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-[#0a0412] flex flex-col items-center justify-center p-8 font-mono text-[#ef4444] text-center z-[9999]">
          <h1 className="text-4xl mb-4 uppercase tracking-tighter">System Panic</h1>
          <p className="mb-8 opacity-70">A critical runtime failure has occurred in the neural interface.</p>
          <div className="bg-black/50 p-4 border border-[#ef4444]/30 rounded text-left text-[10px] max-w-2xl overflow-auto mb-8 whitespace-pre-wrap">
            {this.state.error?.toString()}
          </div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-2 border border-[#ef4444] hover:bg-[#ef4444] hover:text-black transition-all"
          >
            REBOOT CORE
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
