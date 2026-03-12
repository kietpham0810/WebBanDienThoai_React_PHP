import { useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDispatch, useSelector } from 'react-redux';
import { type Resolver, useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import * as yup from 'yup';
import { clearCart } from '../features/cart/cartSlice';
import { AppDispatch, RootState } from '../store';
import { formatCurrency } from '../utils';

interface CheckoutFormData {
  fullName: string;
  phone: string;
  address: string;
  paymentMethod: 'cod' | 'banking';
}

const schema: yup.ObjectSchema<CheckoutFormData> = yup
  .object({
    fullName: yup.string().trim().required('Vui lòng nhập họ và tên.'),
    phone: yup
      .string()
      .trim()
      .matches(/^[0-9]{10}$/, 'Số điện thoại phải gồm đúng 10 chữ số.')
      .required('Vui lòng nhập số điện thoại.'),
    address: yup.string().trim().required('Vui lòng nhập địa chỉ nhận hàng.'),
    paymentMethod: yup
      .mixed<CheckoutFormData['paymentMethod']>()
      .oneOf(['cod', 'banking'], 'Vui lòng chọn phương thức thanh toán.')
      .required('Vui lòng chọn phương thức thanh toán.'),
  })
  .required();

export default function CheckoutPage() {
  const { items, totalAmount } = useSelector((state: RootState) => state.cart);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutFormData>({
    resolver: yupResolver(schema) as Resolver<CheckoutFormData>,
    defaultValues: {
      fullName: '',
      phone: '',
      address: '',
      paymentMethod: 'cod',
    },
  });

  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [items.length, navigate]);

  const onSubmit = async (data: CheckoutFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    console.log('Order Data:', { ...data, items, total: totalAmount });
    dispatch(clearCart());
    toast.success('Đặt hàng thành công. Nhân viên sẽ liên hệ xác nhận sớm.');
    navigate('/');
  };

  if (items.length === 0) {
    return <div className="py-20 text-center text-gray-500">Đang chuyển hướng về giỏ hàng...</div>;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Thanh toán</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900">Thông tin giao hàng</h1>
            <p className="mt-2 max-w-xl text-sm text-slate-500">
              Điền chính xác thông tin để đơn hàng được xử lý nhanh và giao đúng địa chỉ.
            </p>
          </div>
          <Link to="/cart" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
            Quay lại giỏ hàng
          </Link>
        </div>

        <form id="checkout-form" onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Họ và tên</label>
            <input
              {...register('fullName')}
              className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Nguyen Van A"
            />
            <p className="mt-1 text-xs text-red-500">{errors.fullName?.message}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input
              {...register('phone')}
              className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0901234567"
            />
            <p className="mt-1 text-xs text-red-500">{errors.phone?.message}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Địa chỉ nhận hàng</label>
            <textarea
              {...register('address')}
              className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
              rows={3}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành..."
            />
            <p className="mt-1 text-xs text-red-500">{errors.address?.message}</p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phương thức thanh toán</label>
            <select
              {...register('paymentMethod')}
              className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="cod">Thanh toán khi nhận hàng (COD)</option>
              <option value="banking">Chuyển khoản ngân hàng</option>
            </select>
            <p className="mt-1 text-xs text-red-500">{errors.paymentMethod?.message}</p>
          </div>
        </form>
      </section>

      <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-6 shadow-sm lg:sticky lg:top-24">
        <h2 className="text-lg font-bold text-slate-900">Đơn hàng của bạn</h2>
        <p className="mt-1 text-sm text-slate-500">{items.length} sản phẩm đang chờ xác nhận</p>

        <div className="my-6 max-h-[320px] space-y-4 overflow-y-auto pr-2">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between gap-3 text-sm">
              <div className="flex gap-3">
                <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-500">{item.quantity}x</span>
                <span className="line-clamp-2 max-w-[220px] text-slate-900">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-700">{formatCurrency(item.price * item.quantity)}</span>
            </div>
          ))}
        </div>

        <div className="space-y-3 border-y border-slate-200 py-4 text-sm">
          <div className="flex items-center justify-between text-slate-500">
            <span>Tạm tính</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span>Phí vận chuyển</span>
            <span>Miễn phí</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-5">
          <span className="text-lg font-bold">Tổng cộng</span>
          <span className="text-2xl font-bold text-blue-600">{formatCurrency(totalAmount)}</span>
        </div>

        <button
          type="submit"
          form="checkout-form"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-blue-600 py-3.5 font-bold text-white transition hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Đang xử lý...' : 'Xác nhận đặt hàng'}
        </button>
      </aside>
    </div>
  );
}
