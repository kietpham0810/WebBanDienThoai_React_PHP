import { Link } from 'react-router-dom';
import ProductCard from '../../features/product/components/ProductCard';
import type { Product } from '../../features/product/productSlice';

interface ProductGridProps {
  products: Product[];
  title?: string;
  viewAllLink?: string;
}

export default function ProductGrid({ products, title, viewAllLink }: ProductGridProps) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mb-8">
      {title && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-xl font-bold uppercase text-slate-900 md:text-2xl">{title}</h2>
          {viewAllLink && (
            <Link to={viewAllLink} className="text-sm font-semibold text-blue-600 hover:text-blue-700">
              Xem tất cả
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {products.map((product) => (
          <div key={product.id} className="h-full">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
