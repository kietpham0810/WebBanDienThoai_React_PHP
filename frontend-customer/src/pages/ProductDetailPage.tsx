import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShieldCheck, ShoppingCart, Star, Truck } from 'lucide-react';
import { toast } from 'react-toastify';
import { addToCart } from '../features/cart/cartSlice';
import { fetchProductById } from '../features/product/productSlice';
import { AppDispatch, RootState } from '../store';
import { formatCurrency } from '../utils';

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { selectedProduct: product, loading, error } = useSelector((state: RootState) => state.product);
  const productId = Number(id);
  const isValidProductId = Number.isInteger(productId) && productId > 0;
  const currentProduct = product?.id === productId ? product : null;
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (id && isValidProductId) {
      void dispatch(fetchProductById(productId));
    }
  }, [dispatch, id, isValidProductId, productId]);

  useEffect(() => {
    setActiveIndex(0);
  }, [currentProduct?.id]);

  if (!isValidProductId) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Liên kết sản phẩm không hợp lệ</h1>
        <p className="mt-3 text-sm text-slate-500">Vui lòng kiểm tra lại đường dẫn hoặc quay lại danh sách sản phẩm.</p>
        <Link
          to="/products"
          className="mt-6 inline-flex rounded-full bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
        >
          Xem danh sách sản phẩm
        </Link>
      </div>
    );
  }

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Đang tải sản phẩm...</div>;
  }

  if (!currentProduct) {
    return (
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
        <h2 className="mb-3 text-2xl font-bold text-slate-900">Không tìm thấy sản phẩm</h2>
        <p className="mb-6 text-slate-500">{error ?? 'Sản phẩm không tồn tại hoặc đã được gỡ khỏi hệ thống.'}</p>
        <button
          type="button"
          onClick={() => navigate('/products')}
          className="rounded-full bg-blue-600 px-6 py-3 font-bold text-white transition hover:bg-blue-700"
        >
          Quay lại danh sách sản phẩm
        </button>
      </div>
    );
  }

  const galleryImages = currentProduct.images?.length ? currentProduct.images : [currentProduct.image];
  const activeImage = galleryImages[activeIndex] ?? galleryImages[0];
  const specificationLabels: Record<string, string> = {
    ram: 'RAM',
    storage: 'Bộ nhớ',
    screen: 'Màn hình',
  };

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: currentProduct.id,
        name: currentProduct.name,
        price: currentProduct.price,
        image: currentProduct.image,
        quantity: 1,
      }),
    );

    toast.success('Đã thêm sản phẩm vào giỏ hàng.');
  };

  return (
    <div className="mx-auto max-w-6xl">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center gap-2 text-gray-500 hover:text-blue-600"
      >
        <ArrowLeft size={20} /> Quay lại
      </button>

      <div className="grid gap-10 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2 md:p-8">
        <div className="space-y-4">
          <div className="flex h-[420px] items-center justify-center rounded-3xl bg-slate-50 p-8">
            <img src={activeImage} alt={currentProduct.name} className="max-h-full object-contain" referrerPolicy="no-referrer" />
          </div>

          <div className="grid grid-cols-4 gap-3">
            {galleryImages.map((image, index) => (
              <button
                key={`${currentProduct.id}-${index}`}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`rounded-2xl border p-2 transition ${
                  activeIndex === index ? 'border-blue-600 bg-blue-50' : 'border-slate-200 bg-slate-50 hover:border-blue-300'
                }`}
              >
                <img src={image} alt={`${currentProduct.name} ${index + 1}`} className="h-20 w-full object-contain" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-600">{currentProduct.brand}</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900">{currentProduct.name}</h1>

          <div className="mb-6 mt-4 flex items-center gap-4">
            <div className="flex items-center gap-1 text-amber-400">
              <Star fill="currentColor" size={18} />
              <span className="font-medium text-slate-700">{currentProduct.rating}</span>
            </div>
            <span className="text-slate-300">|</span>
            <span className="text-slate-500">{currentProduct.reviews} đánh giá</span>
          </div>

          <div className="mb-8 flex items-baseline gap-4 rounded-3xl bg-slate-50 px-5 py-4">
            <span className="text-3xl font-bold text-blue-600">{formatCurrency(currentProduct.price)}</span>
            {currentProduct.originalPrice && (
              <span className="text-lg text-slate-400 line-through">{formatCurrency(currentProduct.originalPrice)}</span>
            )}
          </div>

          {currentProduct.description && (
            <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-5">
              <h2 className="text-lg font-bold text-slate-900">Mô tả sản phẩm</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{currentProduct.description}</p>
            </div>
          )}

          <div className="mb-8 grid grid-cols-2 gap-4">
            {Object.entries(currentProduct.specs).map(([key, value]) => (
              <div key={key} className="rounded-2xl bg-slate-50 p-4">
                <span className="mb-1 block text-xs uppercase tracking-[0.2em] text-slate-400">
                  {specificationLabels[key] ?? key}
                </span>
                <span className="font-semibold text-slate-900">{value}</span>
              </div>
            ))}
          </div>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row">
            <button
              type="button"
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 py-3 font-bold text-white transition hover:bg-blue-700"
            >
              <ShoppingCart size={20} /> Thêm vào giỏ
            </button>
            <Link
              to="/cart"
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-100 py-3 font-bold text-slate-900 transition hover:bg-slate-200"
            >
              <CreditCard size={20} /> Mua ngay
            </Link>
          </div>

          <div className="space-y-3 border-t border-slate-200 pt-6 text-sm text-slate-600">
            <div className="flex items-center gap-3">
              <Truck size={20} className="text-blue-600" />
              <span>Giao hàng miễn phí toàn quốc với đơn từ 500.000đ</span>
            </div>
            <div className="flex items-center gap-3">
              <ShieldCheck size={20} className="text-blue-600" />
              <span>Bảo hành chính hãng và hỗ trợ kỹ thuật tận nơi</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
