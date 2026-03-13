import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="mx-auto max-w-3xl rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-20 text-center shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-600">404</p>
      <h1 className="mt-3 text-4xl font-black text-slate-900">Trang bạn tìm không tồn tại</h1>
      <p className="mx-auto mt-4 max-w-xl text-sm text-slate-500">
        Liên kết có thể đã thay đổi hoặc nội dung chưa được xuất bản. Bạn có thể quay lại trang chủ hoặc tiếp tục xem sản phẩm.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
          Về trang chủ
        </Link>
        <Link to="/products" className="rounded-full bg-slate-100 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200">
          Xem sản phẩm
        </Link>
      </div>
    </div>
  );
}
