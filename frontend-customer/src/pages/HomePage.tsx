import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Headphones, Laptop, Loader2, ShieldCheck, Smartphone, Truck } from 'lucide-react';
import ProductGrid from '../components/common/ProductGrid';
import CategorySection from '../components/home/CategorySection';
import FlashSale from '../components/home/FlashSale';
import { fetchProducts } from '../features/product/productSlice';
import { AppDispatch, RootState } from '../store';

export default function HomePage() {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((state: RootState) => state.product);

  useEffect(() => {
    void dispatch(fetchProducts({}));
  }, [dispatch]);

  if (loading && items.length === 0) {
    return (
      <div className="flex items-center justify-center py-40">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  const phoneProducts = items.filter((product) => product.category === 'phones');
  const laptopProducts = items.filter((product) => product.category === 'laptops');
  const tabletProducts = items.filter((product) => product.category === 'tablets');
  const accessoryProducts = items.filter((product) => product.category === 'accessories' || product.category === 'watches');
  const featuredHighlights = [
    { icon: Smartphone, label: 'Điện thoại chính hãng', value: 'Hơn 200 mẫu hot' },
    { icon: Laptop, label: 'Laptop học tập và gaming', value: 'Giá tốt mỗi ngày' },
    { icon: Headphones, label: 'Phụ kiện đồng bộ', value: 'Nhiều ưu đãi kèm máy' },
  ];

  if (!loading && items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Không tải được dữ liệu trang chủ</h1>
        <p className="mt-3 text-sm text-slate-500">{error ?? 'Vui lòng thử tải lại trang sau ít phút.'}</p>
        <Link
          to="/products"
          className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Xem danh sách sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-12">
      <section className="mb-6">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-950 via-blue-900 to-blue-600 p-6 text-white shadow-xl md:p-12">
          <div className="relative z-10 max-w-2xl">
            <span className="mb-4 inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-blue-100">
              Bộ sưu tập mới
            </span>
            <h1 className="text-3xl font-black leading-tight md:text-6xl">
              iPhone 15 Series
              <br />
              Titanium đẳng cấp
            </h1>
            <p className="mt-4 max-w-xl text-sm text-blue-100 md:text-lg">
              Sở hữu ngay các mẫu điện thoại, laptop và phụ kiện nổi bật với ưu đãi tốt, trả góp 0% và giao nhanh toàn quốc.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/products?category=phones"
                className="rounded-full bg-blue px-6 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
              >
                Mua ngay
              </Link>
              <Link
                to="/products"
                className="rounded-full border border-white/30 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/10"
              >
                Xem toàn bộ sản phẩm
              </Link>
            </div>
          </div>

          <div className="absolute -right-16 top-1/2 hidden h-[120%] w-[45%] -translate-y-1/2 rounded-full bg-white/10 blur-3xl md:block" />
          <img
            src="https://cdn.tgdd.vn/Products/Images/42/305658/iphone-15-pro-max-blue-thumbnew-600x600.jpg"
            className="absolute -right-12 bottom-0 hidden h-[88%] rotate-[-8deg] object-contain drop-shadow-2xl md:block"
            alt="iPhone 15 Pro Max"
            referrerPolicy="no-referrer"
          />
        </div>
      </section>

      <section className="mb-8 grid gap-4 md:grid-cols-3">
        {featuredHighlights.map(({ icon: Icon, label, value }) => (
          <div key={label} className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm backdrop-blur">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Icon size={24} />
            </div>
            <h2 className="font-bold text-slate-900">{label}</h2>
            <p className="mt-1 text-sm text-slate-500">{value}</p>
          </div>
        ))}
      </section>

      <CategorySection />

      <FlashSale products={items} />

      <ProductGrid title="Điện thoại nổi bật" products={phoneProducts} viewAllLink="/products?category=phones" />

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-200">Laptop mùa tựu trường</p>
          <h2 className="mt-3 text-2xl font-bold">Giảm đến 5 triệu cho các mẫu laptop văn phòng và gaming</h2>
          <Link to="/products?category=laptops" className="mt-5 inline-flex rounded-full bg-blue px-5 py-2.5 text-sm font-bold text-slate-900">
            Khám phá ngay
          </Link>
        </div>
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500 to-rose-500 p-6 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-orange-100">Tablet & phụ kiện</p>
          <h2 className="mt-3 text-2xl font-bold">Combo làm việc linh hoạt với giá dễ tiếp cận</h2>
          <Link to="/products?category=tablets" className="mt-5 inline-flex rounded-full bg-blue px-5 py-2.5 text-sm font-bold text-rose-600">
            Xem ưu đãi
          </Link>
        </div>
      </section>

      <ProductGrid title="Laptop bán chạy" products={laptopProducts} viewAllLink="/products?category=laptops" />

      <ProductGrid title="Tablet giá tốt" products={tabletProducts} viewAllLink="/products?category=tablets" />

      <ProductGrid title="Phụ kiện và đồng hồ" products={accessoryProducts} viewAllLink="/products?category=accessories" />

      <section className="mt-10 grid gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-3">
        <div className="flex items-start gap-3">
          <Truck className="mt-1 text-blue-600" />
          <div>
            <h2 className="font-bold text-slate-900">Giao nhanh toàn quốc</h2>
            <p className="mt-1 text-sm text-slate-500">Xử lý đơn nhanh, hỗ trợ nhận hàng linh hoạt tại nhà hoặc cửa hàng.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 text-blue-600" />
          <div>
            <h2 className="font-bold text-slate-900">Cam kết chính hãng</h2>
            <p className="mt-1 text-sm text-slate-500">Sản phẩm rõ nguồn gốc, bảo hành minh bạch và hỗ trợ đổi trả khi cần.</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Headphones className="mt-1 text-blue-600" />
          <div>
            <h2 className="font-bold text-slate-900">Hỗ trợ tư vấn tận tâm</h2>
            <p className="mt-1 text-sm text-slate-500">Đội ngũ tư vấn luôn sẵn sàng giúp bạn chọn đúng cấu hình và nhu cầu.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
