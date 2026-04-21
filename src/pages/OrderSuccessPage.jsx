import { useLocation, Link } from 'react-router-dom';
import { FiCheckCircle, FiPackage, FiHome } from 'react-icons/fi';

export default function OrderSuccessPage() {
  const { state } = useLocation();
  const orderId   = state?.orderId;

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 page-enter">
      <div className="text-center max-w-md">
        {/* Animated checkmark */}
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="absolute w-32 h-32 bg-green-100 rounded-full animate-ping opacity-20" />
          <div className="relative w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-xl">
            <FiCheckCircle size={48} className="text-white" />
          </div>
        </div>

        <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          Order Placed! 🎉
        </h1>
        <p className="text-gray-500 text-lg mb-2">Thank you for shopping with Harshiddhi!</p>
        <p className="text-gray-400 text-sm mb-6">
          Your beautiful ethnic wear is on its way. We'll notify you once it's shipped.
        </p>

        {orderId && (
          <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 mb-8 inline-block">
            <p className="text-xs text-green-600 uppercase tracking-wide font-semibold mb-1">Order ID</p>
            <p className="font-mono text-green-800 font-bold text-sm break-all">{orderId}</p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/orders" className="btn-outline inline-flex items-center gap-2 justify-center">
            <FiPackage size={16} /> Track Orders
          </Link>
          <Link to="/" className="btn-primary inline-flex items-center gap-2 justify-center">
            <FiHome size={16} /> Continue Shopping
          </Link>
        </div>

        <div className="mt-10 grid grid-cols-3 gap-4 text-center">
          {[
            ['📦', 'Order Confirmed', 'We\'ve received your order'],
            ['🧵', 'Being Prepared',  'Your items are being packed'],
            ['🚚', 'On the Way',      'Delivery in 3–7 business days'],
          ].map(([emoji, title, desc]) => (
            <div key={title} className="p-3 bg-gray-50 rounded-xl">
              <div className="text-2xl mb-1">{emoji}</div>
              <p className="text-xs font-semibold text-gray-700">{title}</p>
              <p className="text-xs text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
