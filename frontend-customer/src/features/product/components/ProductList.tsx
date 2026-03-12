import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Loader2, SearchX } from 'lucide-react';
import { AppDispatch, RootState } from '../../../store';
import { fetchProducts, type ProductFilters } from '../productSlice';
import ProductCard from './ProductCard';

interface ProductListProps {
  filters?: ProductFilters;
}

export default function ProductList({ filters = {} }: ProductListProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { items, loading, error } = useSelector((state: RootState) => state.product);

  useEffect(() => {
    void dispatch(fetchProducts(filters));
  }, [dispatch, filters.brand, filters.category, filters.q]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  if (error) {
    return <div className="py-10 text-center text-red-500">{error}</div>;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <SearchX size={28} />
        </div>
        <h2 className="mb-2 text-xl font-bold text-slate-900">Không tìm thấy sản phẩm phù hợp</h2>
        <p className="mx-auto mb-6 max-w-xl text-sm text-slate-500">
          Hãy thử đổi từ khóa tìm kiếm hoặc quay lại danh mục đầy đủ để xem thêm sản phẩm khác.
        </p>
        <Link
          to="/products"
          className="inline-flex items-center justify-center rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Xem toàn bộ sản phẩm
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {items.map((product) => (
        <div key={product.id} className="h-full">
          <ProductCard product={product} />
        </div>
      ))}
    </div>
  );
}
