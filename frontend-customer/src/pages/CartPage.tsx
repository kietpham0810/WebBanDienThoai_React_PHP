import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { removeFromCart, updateQuantity } from '../features/cart/cartSlice';
import { AppDispatch, RootState } from '../store';
import { formatCurrency } from '../utils';

export default function CartPage() {
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length === 0) {
    return (
      <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <ShoppingBag size={30} />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Giỏ hàng đang trống</h1>
        <p className="mt-3 text-slate-500">Bạn chưa thêm sản phẩm nào. Hãy chọn vài món phù hợp rồi quay lại thanh toán.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700">
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Giỏ hàng</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{totalItems} sản phẩm đã chọn</h1>
        </div>
        <Link to="/products" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Tiếp tục mua sắm
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              <img
                src={item.image}
                alt={item.name}
                className="h-24 w-24 rounded-2xl bg-slate-50 object-contain"
                referrerPolicy="no-referrer"
              />

              <div className="flex-1">
                <h2 className="font-semibold text-slate-900">{item.name}</h2>
                <p className="mt-1 text-sm text-slate-500">Đơn giá</p>
                <p className="text-lg font-bold text-blue-600">{formatCurrency(item.price)}</p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity - 1 }))}
                  disabled={item.quantity === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Minus size={14} />
                </button>
                <span className="w-8 text-center font-semibold">{item.quantity}</span>
                <button
                  type="button"
                  onClick={() => dispatch(updateQuantity({ id: item.id, quantity: item.quantity + 1 }))}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 transition hover:bg-slate-200"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="min-w-[120px] text-left sm:text-right">
                <p className="text-sm text-slate-500">Thành tiền</p>
                <p className="font-bold text-slate-900">{formatCurrency(item.price * item.quantity)}</p>
              </div>

              <button
                type="button"
                onClick={() => dispatch(removeFromCart(item.id))}
                className="p-2 text-slate-400 transition hover:text-red-500"
              >
                <Trash2 size={20} />
              </button>
            </div>
          ))}
        </div>

        <aside className="h-fit rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
          <h2 className="text-xl font-bold text-slate-900">Tổng đơn hàng</h2>
          <div className="mt-5 flex justify-between text-slate-600">
            <span>Tạm tính</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="mt-3 flex justify-between text-slate-600">
            <span>Giảm giá</span>
            <span>0đ</span>
          </div>
          <div className="mt-3 flex justify-between text-slate-600">
            <span>Vận chuyển</span>
            <span>Miễn phí</span>
          </div>
          <div className="mt-6 flex justify-between border-t border-slate-200 pt-4">
            <span className="text-lg font-bold">Tổng cộng</span>
            <span className="text-xl font-bold text-blue-600">{formatCurrency(totalAmount)}</span>
          </div>
          <button
            type="button"
            onClick={() => navigate('/checkout')}
            className="mt-6 w-full rounded-2xl bg-blue-600 py-3.5 font-bold text-white transition hover:bg-blue-700"
          >
            Tiến hành thanh toán
          </button>
        </aside>
      </div>
    </div>
  );
}
