import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginSuccess } from '../features/auth/authSlice';
import { AppDispatch, RootState } from '../store';

interface LoginFormData {
  email: string;
  password: string;
}

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: 'user@example.com',
      password: '123456',
    },
  });
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();
  const location = useLocation();
  const redirectTo = location.state?.from?.pathname ?? '/';

  useEffect(() => {
    if (isAuthenticated) {
      navigate(redirectTo, { replace: true });
    }
  }, [isAuthenticated, navigate, redirectTo]);

  const onSubmit = (data: LoginFormData) => {
    if (data.email === 'user@example.com' && data.password === '123456') {
      dispatch(
        loginSuccess({
          user: { id: '1', name: 'Nguyễn Văn User', email: data.email },
          token: 'mock-jwt-token',
        }),
      );
      toast.success('Đăng nhập thành công.');
      navigate(redirectTo, { replace: true });
    } else {
      toast.error('Email hoặc mật khẩu chưa đúng. Tài khoản demo: user@example.com / 123456');
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Tài khoản</p>
      <h1 className="mt-2 text-center text-3xl font-bold text-slate-900">Đăng nhập</h1>
      <p className="mt-3 text-center text-sm text-slate-500">
        Đăng nhập để tiếp tục thanh toán và đồng bộ giỏ hàng của bạn.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
          <input
            {...register('email', { required: 'Vui lòng nhập email.' })}
            type="email"
            className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="mt-1 text-xs text-red-500">{errors.email?.message}</p>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu</label>
          <input
            {...register('password', { required: 'Vui lòng nhập mật khẩu.' })}
            type="password"
            className="w-full rounded-xl border border-gray-300 p-3 focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="mt-1 text-xs text-red-500">{errors.password?.message}</p>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 disabled:bg-slate-400"
        >
          {isSubmitting ? 'Đang xử lý...' : 'Đăng nhập'}
        </button>
      </form>

      <div className="mt-6 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
        <p className="font-semibold text-slate-900">Tài khoản demo</p>
        <p className="mt-1">Email: user@example.com</p>
        <p>Mật khẩu: 123456</p>
      </div>

      <p className="mt-5 text-center text-sm text-slate-500">
        Muốn xem sản phẩm trước?{' '}
        <Link to="/products" className="font-semibold text-blue-600 hover:text-blue-700">
          Quay lại danh sách
        </Link>
      </p>
    </div>
  );
}
