import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../../redux/slices/orderSlice';
import toast from 'react-hot-toast';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];
const STATUS_COLOR = {
  Pending: 'text-yellow-700 bg-yellow-100', Processing: 'text-blue-700 bg-blue-100',
  Shipped: 'text-purple-700 bg-purple-100', Delivered: 'text-green-700 bg-green-100',
  Cancelled: 'text-red-700 bg-red-100',
};

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { allOrders } = useSelector(s => s.order);
  const [filter, setFilter] = useState('');

  useEffect(() => { dispatch(fetchAllOrders()); }, [dispatch]);

  const filtered = filter ? allOrders.filter(o => o.status === filter) : allOrders;

  const handleStatusChange = async (id, status) => {
    try {
      await dispatch(updateOrderStatus({ id, status })).unwrap();
      toast.success(`Order updated to ${status}`);
    } catch { toast.error('Failed to update order'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-800">Orders</h1>
        <span className="text-sm text-gray-500">{allOrders.length} total orders</span>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {['All', ...STATUSES].map(s => (
          <button
            key={s}
            onClick={() => setFilter(s === 'All' ? '' : s)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all
              ${(s === 'All' && !filter) || s === filter ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-primary'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(order => (
          <div key={order._id} className="card p-5 border border-gray-100">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                <p className="font-mono text-sm font-bold text-gray-700">{order._id}</p>
                <p className="text-sm text-gray-600 mt-1">{order.user?.name || '—'} · {order.user?.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <p className="font-bold text-lg text-primary">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                <select
                  value={order.status}
                  onChange={e => handleStatusChange(order._id, e.target.value)}
                  className={`badge text-xs cursor-pointer border-0 focus:ring-0 ${STATUS_COLOR[order.status]} rounded-full px-3 py-1.5`}
                >
                  {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            {/* Items */}
            <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
              {order.items.map((item, i) => (
                <div key={i} className="shrink-0 text-center">
                  <img src={item.image} alt={item.name}
                       className="w-14 h-18 object-cover rounded-lg border border-gray-100" />
                  <p className="text-xs text-gray-500 mt-1">×{item.qty}</p>
                </div>
              ))}
            </div>

            {/* Shipping */}
            <div className="mt-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
              📍 {order.shippingAddress?.name} · {order.shippingAddress?.city}, {order.shippingAddress?.state} - {order.shippingAddress?.pincode}
              &nbsp;|&nbsp;📞 {order.shippingAddress?.phone}
              &nbsp;|&nbsp;💳 {order.paymentMethod}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">No orders found</div>
        )}
      </div>
    </div>
  );
}
