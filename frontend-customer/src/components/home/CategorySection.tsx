import { Headphones, Laptop, Monitor, Smartphone, Tablet, type LucideIcon, Watch } from 'lucide-react';
import { Link } from 'react-router-dom';
import { categories } from '../../data/mockData';

const iconMap: Record<string, LucideIcon> = {
  Smartphone,
  Laptop,
  Tablet,
  Watch,
  Headphones,
  Monitor,
};

export default function CategorySection() {
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

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {categories.map((category) => {
          const Icon = iconMap[category.icon] || Smartphone;

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
    </section>
  );
}
