import { useState, type FormEvent } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Search, ShoppingCart, User, X } from 'lucide-react';
import { logout } from '../../features/auth/authSlice';
import { AppDispatch, RootState } from '../../store';

export default function Header() {
  const { items } = useSelector((state: RootState) => state.cart);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigationLinks = [
    { to: '/', label: 'Trang chủ' },
    { to: '/products?category=phones', label: 'Điện thoại' },
    { to: '/products?category=laptops', label: 'Laptop' },
    { to: '/products?category=tablets', label: 'Tablet' },
    { to: '/products?category=accessories', label: 'Phụ kiện' },
  ];

  const totalItems = items.reduce((accumulator, item) => accumulator + item.quantity, 0);

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedSearch = searchTerm.trim();

    if (normalizedSearch) {
      navigate(`/products?q=${encodeURIComponent(normalizedSearch)}`);
    } else {
      navigate('/products');
    }

    setIsMenuOpen(false);
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsMenuOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/70 bg-white/90 backdrop-blur">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-6">
          <Link to="/" className="shrink-0">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-blue-600 px-3 py-2 text-xl font-black tracking-tighter text-white">N</div>
              <div>
                <span className="block text-xl font-bold tracking-tight text-gray-900">Novatech</span>
                <span className="hidden text-xs uppercase tracking-[0.25em] text-slate-400 md:block">Electronics Store</span>
              </div>
            </div>
          </Link>

          <form onSubmit={handleSearch} className="relative hidden max-w-2xl flex-1 md:flex">
            <input
              type="text"
              placeholder="Tìm kiếm điện thoại, laptop, phụ kiện..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-full border border-transparent bg-slate-100 py-3 pl-11 pr-4 text-sm outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          </form>

          <div className="flex items-center gap-4 md:gap-6">
            <Link to="/cart" className="relative flex items-center gap-2 text-gray-600 transition hover:text-blue-600">
              <ShoppingCart size={24} />
              {totalItems > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                  {totalItems}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="group relative">
                <button type="button" className="flex items-center gap-2 text-gray-600 transition hover:text-blue-600">
                  <User size={24} />
                  <span className="hidden max-w-[120px] truncate text-sm font-medium md:block">{user?.name}</span>
                </button>
                <div className="absolute right-0 mt-2 hidden w-56 rounded-2xl border border-gray-100 bg-white py-2 shadow-lg group-hover:block">
                  <div className="border-b border-gray-100 px-4 py-3 text-sm text-gray-700">
                    <p className="font-semibold text-slate-900">{user?.name}</p>
                    <p className="mt-1 text-slate-500">{user?.email}</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm text-red-600 hover:bg-gray-100"
                  >
                    <LogOut size={14} /> Đăng xuất
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden items-center gap-2 text-gray-600 transition hover:text-blue-600 md:flex">
                <User size={24} />
                <span className="text-sm font-medium">Đăng nhập</span>
              </Link>
            )}

            <button
              type="button"
              className="text-gray-600 md:hidden"
              onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
              aria-label={isMenuOpen ? 'Đóng menu' : 'Mở menu'}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        <nav className="mt-4 hidden flex-wrap gap-2 md:flex">
          {navigationLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200 hover:text-slate-900"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {isMenuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-4 md:hidden">
          <form onSubmit={handleSearch} className="relative mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full rounded-full border border-slate-200 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </form>

          <div className="grid grid-cols-2 gap-2">
            {navigationLinks.map((item) => (
              <Link
                key={item.label}
                to={item.to}
                className="rounded-2xl bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-700"
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {!isAuthenticated && (
            <Link
              to="/login"
              className="mt-4 block rounded-2xl bg-blue-600 px-4 py-3 text-center text-sm font-semibold text-white"
              onClick={() => setIsMenuOpen(false)}
            >
              Đăng nhập
            </Link>
          )}

          {isAuthenticated && (
            <button
              type="button"
              onClick={handleLogout}
              className="mt-4 w-full rounded-2xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600"
            >
              Đăng xuất
            </button>
          )}
        </div>
      )}
    </header>
  );
}
