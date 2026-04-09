import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
}

export default class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return {
      hasError: true,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AppErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-2xl rounded-3xl border border-rose-200 bg-white px-6 py-16 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-600">Giao diện gặp sự cố</p>
          <h1 className="mt-3 text-3xl font-bold text-slate-900">Trang vừa gặp lỗi nhưng không bị trắng nữa</h1>
          <p className="mt-3 text-sm text-slate-500">
            Bạn có thể tải lại trang hoặc quay về trang chủ để tiếp tục sử dụng frontend customer.
          </p>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Tải lại trang
            </button>
            <Link
              to="/"
              onClick={() => this.setState({ hasError: false })}
              className="rounded-full border border-slate-300 px-6 py-3 font-semibold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
            >
              Về trang chủ
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
