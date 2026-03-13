import { CreditCard, Facebook, Instagram, MapPin, Phone, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-slate-200 bg-white pt-10 text-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 gap-8 pb-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-base font-bold text-slate-900">Tổng đài hỗ trợ</h3>
            <ul className="space-y-3 text-slate-600">
              <li>
                <span>Gọi mua: </span>
                <a href="tel:18001234" className="font-bold text-blue-600">
                  1800.1234
                </a>
                <span className="ml-1 text-xs">(7:30 - 22:00)</span>
              </li>
              <li>
                <span>Khiếu nại: </span>
                <a href="tel:18001235" className="font-bold text-blue-600">
                  1800.1235
                </a>
                <span className="ml-1 text-xs">(8:00 - 21:30)</span>
              </li>
              <li>
                <span>Bảo hành: </span>
                <a href="tel:18001236" className="font-bold text-blue-600">
                  1800.1236
                </a>
                <span className="ml-1 text-xs">(8:00 - 21:00)</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-base font-bold text-slate-900">Về Novatech</h3>
            <ul className="space-y-3 text-slate-600">
              <li>
                <Link to="/" className="hover:text-blue-600">
                  Giới thiệu hệ thống
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-blue-600">
                  Danh mục sản phẩm
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-blue-600">
                  Giỏ hàng của bạn
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-blue-600">
                  Tài khoản khách hàng
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-base font-bold text-slate-900">Chính sách mua hàng</h3>
            <ul className="space-y-3 text-slate-600">
              <li>Đổi trả trong 7 ngày với lỗi kỹ thuật từ nhà sản xuất.</li>
              <li>Hỗ trợ trả góp 0% cho nhiều dòng điện thoại và laptop.</li>
              <li>Xuất hóa đơn VAT và giao nhanh tại các thành phố lớn.</li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-base font-bold text-slate-900">Kết nối với chúng tôi</h3>
            <div className="mb-6 flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700">
                <Facebook size={20} />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-red-600 text-white transition hover:bg-red-700">
                <Youtube size={20} />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-600 text-white transition hover:bg-pink-700">
                <Instagram size={20} />
              </a>
            </div>
            <div className="space-y-3 text-slate-600">
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-blue-600" />
                <span>Hotline: 1800.1234</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-600" />
                <span>128 Trần Quang Khải, Quận 1, TP.HCM</span>
              </div>
            </div>
          </div>
        </div>

        <div className="-mx-4 mt-2 border-t border-slate-200 bg-slate-50 px-4 pb-6 pt-6">
          <div className="container mx-auto flex flex-col gap-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <p>© {currentYear}. Công ty cổ phần Novatech. GPĐKKD: 0303217354 do Sở KH & ĐT TP.HCM cấp.</p>
              <p>Địa chỉ: 128 Trần Quang Khải, P. Tân Định, Q.1, TP.HCM. Email: cskh@novatech.vn.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-2">
                <CreditCard size={16} />
                <span>Tiền mặt / Chuyển khoản</span>
              </div>
              <div className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-3 py-2">
                <MapPin size={16} />
                <span>Hệ thống cửa hàng toàn quốc</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
