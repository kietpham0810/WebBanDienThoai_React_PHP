import { type ReactNode } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../components/layout/Footer';
import Header from '../components/layout/Header';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-transparent text-gray-900">
      <Header />
      <main className="container mx-auto flex-grow px-4 py-8">{children}</main>
      <Footer />
      <ToastContainer
        position="bottom-right"
        autoClose={3000}
        aria-label="Thông báo hệ thống"
        closeOnClick
        theme="light"
      />
    </div>
  );
}
