import { type MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { ShoppingCart, Star } from 'lucide-react';
import { toast } from 'react-toastify';
import { addToCart } from '../../cart/cartSlice';
import { AppDispatch } from '../../../store';
import { formatCurrency } from '../../../utils';
import type { Product } from '../productSlice';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const dispatch = useDispatch<AppDispatch>();
  const discountPercentage = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    dispatch(
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1,
      }),
    );
    toast.success(`Đã thêm ${product.name} vào giỏ hàng.`);
  };

  return (
    <article className="group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl">
      <Link to={`/products/${product.id}`} className="flex h-full flex-col">
        <div className="relative mb-5 overflow-hidden rounded-2xl bg-slate-50">
          {discountPercentage > 0 && (
            <span className="absolute left-3 top-3 z-10 rounded-full bg-rose-500 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
              -{discountPercentage}%
            </span>
          )}

          <div className="flex h-52 items-center justify-center p-4">
            <img
              src={product.image}
              alt={product.name}
              className="h-40 object-contain transition-transform duration-500 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        <div className="flex flex-1 flex-col">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{product.brand}</p>
          <h3 className="line-clamp-2 min-h-12 text-sm font-semibold text-slate-900 transition-colors group-hover:text-blue-600 md:text-base">
            {product.name}
          </h3>

          <div className="mt-auto pt-4">
            <div className="mb-3 flex flex-wrap items-baseline gap-2">
              <span className="text-lg font-bold text-blue-600">{formatCurrency(product.price)}</span>
              {product.originalPrice && (
                <span className="text-sm text-slate-400 line-through">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>

            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Star size={14} className="fill-amber-400 text-amber-400" />
              <span className="font-semibold text-slate-700">{product.rating}</span>
              <span>({product.reviews} đánh giá)</span>
            </div>
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={handleAddToCart}
        className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700 transition hover:border-blue-600 hover:bg-blue-600 hover:text-white"
      >
        <ShoppingCart size={18} />
        Thêm vào giỏ
      </button>
    </article>
  );
}
