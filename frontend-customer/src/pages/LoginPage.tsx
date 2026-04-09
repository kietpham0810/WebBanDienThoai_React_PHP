import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { loginSuccess } from '../features/auth/authSlice';
import { ADMIN_LOGIN_EMAIL, ADMIN_LOGIN_PASSWORD, ADMIN_REDIRECT_URL, authService } from '../services/authService';
import { AppDispatch, RootState } from '../store';

interface LoginFormData {
  email: string;
  password: string;
}

interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
}

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    reset: resetLoginForm,
    formState: { errors: loginErrors, isSubmitting: isLoggingIn },
  } = useForm<LoginFormData>({
    defaultValues: {
      email: '',
      password: '',
    },
  });
  const {
    register: registerSignup,
    handleSubmit: handleRegisterSubmit,
    reset: resetRegisterForm,
    formState: { errors: registerErrors, isSubmitting: isRegistering },
  } = useForm<RegisterFormData>({
    defaultValues: {
      email: '',
      password: '',
      name: '',
      phone: '',
      address: '',
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

  const inputClassName = 'w-full rounded-xl border border-gray-300 p-3 outline-none focus:ring-2 focus:ring-blue-500';

  const onLoginSubmit = async (data: LoginFormData) => {
    try {
      const response = await authService.login(data.email, data.password);
      dispatch(loginSuccess(response));
      toast.success('Đăng nhập thành công.');

      if (response.user.role === 'admin') {
        window.location.assign(ADMIN_REDIRECT_URL);
        return;
      }

      navigate(redirectTo, { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đăng nhập thất bại. Vui lòng thử lại.';
      toast.error(message);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormData) => {
    try {
      await authService.register(data);
      toast.success('Đăng ký thành công. Bạn có thể đăng nhập ngay bằng email và mật khẩu vừa tạo.');
      resetLoginForm({
        email: data.email.trim().toLowerCase(),
        password: data.password,
      });
      resetRegisterForm({
        email: '',
        password: '',
        name: '',
        phone: '',
        address: '',
      });
      setMode('login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Đăng ký thất bại. Vui lòng thử lại.';
      toast.error(message);
    }
  };

  return (
    <div className="mx-auto mt-8 max-w-md rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
      <p className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Tài khoản</p>
      <h1 className="mt-2 text-center text-3xl font-bold text-slate-900">
        {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
      </h1>
      <p className="mt-3 text-center text-sm text-slate-500">
        {mode === 'login'
          ? 'Đăng nhập để tiếp tục thanh toán và đồng bộ giỏ hàng của bạn.'
          : 'Tạo tài khoản ngay tại đây để dùng email và mật khẩu vừa đăng ký đăng nhập lại.'}
      </p>

      <div className="mt-8 grid grid-cols-2 rounded-2xl bg-slate-100 p-1">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`rounded-2xl px-4 py-2 text-sm font-semibold transition ${
            mode === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
          }`}
        >
          Đăng ký
        </button>
      </div>

      {mode === 'login' ? (
        <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email đăng nhập</label>
            <input
              {...registerLogin('email', {
                required: 'Vui lòng nhập email.',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email không hợp lệ.',
                },
              })}
              type="email"
              autoComplete="email"
              placeholder="ban@example.com"
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-red-500">{loginErrors.email?.message}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              {...registerLogin('password', { required: 'Vui lòng nhập mật khẩu.' })}
              type="password"
              autoComplete="current-password"
              placeholder="Nhập mật khẩu"
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-red-500">{loginErrors.password?.message}</p>
          </div>
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isLoggingIn ? 'Đang xử lý...' : 'Đăng nhập'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Email đăng nhập</label>
            <input
              {...registerSignup('email', {
                required: 'Vui lòng nhập email.',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Email không hợp lệ.',
                },
              })}
              type="email"
              autoComplete="email"
              placeholder="ban@example.com"
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-red-500">{registerErrors.email?.message}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              {...registerSignup('password', { required: 'Vui lòng nhập mật khẩu.' })}
              type="password"
              autoComplete="new-password"
              placeholder="Tạo mật khẩu"
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-red-500">{registerErrors.password?.message}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Tên người dùng</label>
            <input
              {...registerSignup('name', { required: 'Vui lòng nhập tên người dùng.' })}
              type="text"
              placeholder="Nguyễn Văn A"
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-red-500">{registerErrors.name?.message}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Số điện thoại</label>
            <input
              {...registerSignup('phone', {
                required: 'Vui lòng nhập số điện thoại.',
                pattern: {
                  value: /^[0-9]{10,11}$/,
                  message: 'Số điện thoại phải gồm 10 đến 11 chữ số.',
                },
              })}
              type="tel"
              autoComplete="tel"
              placeholder="0901234567"
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-red-500">{registerErrors.phone?.message}</p>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Địa chỉ</label>
            <textarea
              {...registerSignup('address', { required: 'Vui lòng nhập địa chỉ.' })}
              rows={3}
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
              className={inputClassName}
            />
            <p className="mt-1 text-xs text-red-500">{registerErrors.address?.message}</p>
          </div>
          <button
            type="submit"
            disabled={isRegistering}
            className="w-full rounded-2xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700 disabled:bg-slate-400"
          >
            {isRegistering ? 'Đang xử lý...' : 'Tạo tài khoản'}
          </button>
        </form>
      )}

      <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">Tài khoản admin cố định</p>
        <p className="mt-1">
          Email: <span className="font-medium">{ADMIN_LOGIN_EMAIL}</span>
        </p>
        <p>
          Mật khẩu: <span className="font-medium">{ADMIN_LOGIN_PASSWORD}</span>
        </p>
        <p className="mt-2 text-xs text-amber-700">
          
        </p>
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
