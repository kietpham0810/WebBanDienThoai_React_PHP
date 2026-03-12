import { Link, useSearchParams } from 'react-router-dom';
import { categories } from '../data/mockData';
import ProductList from '../features/product/components/ProductList';
import { cn } from '../utils';

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const categoryId = searchParams.get('category');
  const searchQuery = searchParams.get('q');

  const categoryName = categoryId ? categories.find((category) => category.id === categoryId)?.name : 'Tất cả sản phẩm';
  const title = searchQuery ? `Kết quả tìm kiếm cho "${searchQuery}"` : categoryName;

  return (
    <div className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <div className="mb-6">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">Danh mục</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{title}</h1>
          <div className="mt-2 text-sm text-slate-500">
            <Link to="/" className="hover:text-blue-600">
              Trang chủ
            </Link>{' '}
            / <span>Sản phẩm</span>
          </div>
          {searchQuery && (
            <p className="mt-4 max-w-2xl text-sm text-slate-500">
              Gợi ý theo từ khóa tìm kiếm. Bạn có thể chuyển nhanh sang các danh mục phổ biến bên dưới.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-3">
          <Link
            to="/products"
            className={cn(
              'rounded-full px-4 py-2 text-sm font-semibold transition',
              !categoryId && !searchQuery ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
            )}
          >
            Tất cả
          </Link>
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.id}`}
              className={cn(
                'rounded-full px-4 py-2 text-sm font-semibold transition',
                categoryId === category.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200',
              )}
            >
              {category.name}
            </Link>
          ))}
        </div>
      </div>

      <ProductList filters={{ category: categoryId, q: searchQuery }} />
    </div>
  );
}
