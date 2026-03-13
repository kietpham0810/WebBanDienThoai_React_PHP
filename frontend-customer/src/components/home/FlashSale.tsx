import { Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductCard from '../../features/product/components/ProductCard';
import type { Product } from '../../features/product/productSlice';

interface FlashSaleProps {
  products: Product[];
}

export default function FlashSale({ products }: FlashSaleProps) {
  const saleProducts = [...products]
    .filter((product) => product.originalPrice && product.originalPrice > product.price)
    .sort((firstProduct, secondProduct) => {
      const firstDiscount = (firstProduct.originalPrice ?? firstProduct.price) - firstProduct.price;
      const secondDiscount = (secondProduct.originalPrice ?? secondProduct.price) - secondProduct.price;

      return secondDiscount - firstDiscount;
    })
    .slice(0, 5);

  if (saleProducts.length === 0) {
    return null;
  }

  return (
    <section className="mb-8 rounded-[2rem] bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 p-4 text-white shadow-md md:p-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2 md:gap-4">
          <h2 className="flex items-center gap-2 text-2xl font-black uppercase tracking-tight md:text-3xl">
            <Zap className="animate-pulse fill-yellow-300 text-yellow-300" />
            Flash Sale
          </h2>
          <div className="hidden items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-bold md:flex">
            <span>Kết thúc trong:</span>
            <div className="flex gap-1">
              <span className="rounded bg-black px-1.5 text-white">02</span>:
              <span className="rounded bg-black px-1.5 text-white">15</span>:
              <span className="rounded bg-black px-1.5 text-white">45</span>
            </div>
          </div>
        </div>
        <Link to="/products" className="text-sm font-medium text-white/90 underline decoration-white/50 hover:text-white hover:decoration-white">
          Xem tất cả
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
        {saleProducts.map((product) => (
          <div key={product.id} className="h-full rounded-2xl bg-white/20 p-1">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </section>
  );
}
