import { Headphones, Laptop, Monitor, Smartphone, Tablet, type LucideIcon, Watch } from 'lucide-react';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchCategories } from '../../features/category/categorySlice';
import { AppDispatch, RootState } from '../../store';

const iconMap: Record<string, LucideIcon> = {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Monitor,
};

export default function CategorySection() {
  const dispatch = useDispatch<AppDispatch>();
  const { items: categories, loading, error } = useSelector((state: RootState) => state.category);

  useEffect(() => {
    if (categories.length === 0 && !loading) {
      void dispatch(fetchCategories());
    }
  }, [categories.length, dispatch, loading]);

  return (
    <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Khám phá nhanh</p>
          <h2 className="mt-2 text-xl font-bold text-slate-900">Danh mục sản phẩm</h2>
        </div>
        <Link to="/products" className="text-sm font-semibold text-blue-600 hover:text-blue-700">
          Xem tất cả
        </Link>
      </div>

      {loading && categories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          Đang tải danh mục...
        </div>
      )}

      {error && categories.length === 0 && (
        <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50 px-4 py-8 text-center text-sm text-rose-600">
          Không tải được danh mục. Vui lòng thử lại.
        </div>
      )}

      {categories.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category) => {
            const Icon = iconMap[category.icon ?? ''] || Smartphone;

            return (
              <Link
                key={category.id}
                to={`/products?category=${category.id}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-slate-200 p-4 transition hover:-translate-y-1 hover:border-blue-200 hover:bg-blue-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                  <Icon size={24} />
                </div>
                <span className="text-center text-xs font-semibold text-slate-700 md:text-sm">{category.name}</span>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}
