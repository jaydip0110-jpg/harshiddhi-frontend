import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../redux/slices/productSlice';
import { fetchAllOrders } from '../../redux/slices/orderSlice';
import { FiPackage, FiShoppingBag, FiUsers, FiDollarSign, FiArrowRight } from 'react-icons/fi';

export default function AdminDashboard() {
  const dispatch  = useDispatch();
  const { list: products } = useSelector(s => s.product);
  const { allOrders }      = useSelector(s => s.order);

  useEffect(() => {
    dispatch(fetchProducts({ limit: 100 }));
    dispatch(fetchAllOrders());
  }, [dispatch]);

  const revenue    = allOrders.reduce((a, o) => a + o.totalPrice, 0);
  const delivered  = allOrders.filter(o => o.status === 'Delivered').length;
  const pending    = allOrders.filter(o => o.status === 'Pending').length;

  const stats = [
    { icon: FiShoppingBag, label: 'Total Products', value: products.length, color: 'from-pink-400 to-rose-500', link: '/admin/products' },
    { icon: FiPackage,      label: 'Total Orders',   value: allOrders.length, color: 'from-purple-400 to-indigo-500', link: '/admin/orders' },
    { icon: FiDollarSign,  label: 'Total Revenue',  value: `₹${revenue.toLocaleString('en-IN')}`, color: 'from-amber-400 to-orange-500', link: '/admin/orders' },
    { icon: FiUsers,       label: 'Pending Orders', value: pending, color: 'from-teal-400 to-green-500', link: '/admin/orders' },
  ];

  const recentOrders = allOrders.slice(0, 5);

  const STATUS_COLOR = {
    Pending: 'text-yellow-600 bg-yellow-50', Processing: 'text-blue-600 bg-blue-50',
    Shipped: 'text-purple-600 bg-purple-50', Delivered: 'text-green-600 bg-green-50',
    Cancelled: 'text-red-600 bg-red-50',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Harshiddhi Saari &amp; Dresses</p>
        </div>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          + Add Product
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color, link }) => (
          <Link key={label} to={link} className="card p-5 border border-gray-100 hover:border-primary/30 transition-all">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-3`}>
              <Icon className="text-white" size={22} />
            </div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-sm text-gray-500">{label}</p>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="card p-5 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-gray-800">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <FiArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map(order => (
              <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div>
                  <p className="text-xs font-mono text-gray-500">{order._id.slice(-8).toUpperCase()}</p>
                  <p className="text-sm font-semibold">{order.user?.name || 'Customer'}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                  <span className={`badge text-xs ${STATUS_COLOR[order.status]}`}>{order.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card p-5 border border-gray-100">
          <h2 className="font-display font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Add New Product',  link: '/admin/products/new', emoji: '➕' },
              { label: 'Manage Products',  link: '/admin/products',     emoji: '📦' },
              { label: 'View All Orders',  link: '/admin/orders',       emoji: '🛒' },
              { label: 'Visit Storefront', link: '/products',           emoji: '🏪' },
            ].map(({ label, link, emoji }) => (
              <Link key={label} to={link}
                    className="p-4 bg-cream rounded-xl hover:bg-rose-100 transition-all text-center group">
                <div className="text-2xl mb-1">{emoji}</div>
                <p className="text-sm font-semibold text-gray-700 group-hover:text-primary transition-colors">{label}</p>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
