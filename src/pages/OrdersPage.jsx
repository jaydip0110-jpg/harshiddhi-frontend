import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyOrders } from "../redux/slices/orderSlice";
import { FiPackage, FiClock, FiX, FiAlertTriangle } from "react-icons/fi";
import toast from "react-hot-toast";

const STATUS_COLOR = {
  Pending: "bg-yellow-100 text-yellow-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-purple-100 text-purple-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const dispatch = useDispatch();
  const { myOrders } = useSelector((s) => s.order);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmId, setConfirmId] = useState(null);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  // Cancel Order Function
  const handleCancel = async (orderId) => {
    setConfirmId(null);
    setCancellingId(orderId);

    try {
      // Token get
      let token = localStorage.getItem("userToken");
      if (!token) {
        const userInfo = localStorage.getItem("userInfo");
        if (userInfo) token = JSON.parse(userInfo)?.token;
      }
      if (!token) {
        const persisted = localStorage.getItem("harshiddhi");
        if (persisted) token = JSON.parse(persisted)?.auth?.user?.token;
      }

      if (!token) {
        toast.error("Session expired! Please login again");
        return;
      }

      const hostname = window.location.hostname;
      const baseURL =
        import.meta.env.MODE === "production"
          ? "https://harshiddhi-backend.onrender.com/api"
          : "http://localhost:5000/api";

      // /cancel route use કરો — user માટે
      const response = await fetch(`${baseURL}/orders/${orderId}/cancel`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Cancel failed");
      }

      toast.success("Order cancelled successfully ✅");
      dispatch(fetchMyOrders());
    } catch (err) {
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  // Can cancel only Pending or Processing orders
  const canCancel = (status) => status === "Pending" || status === "Processing";

  if (!myOrders.length)
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center page-enter">
        <FiPackage size={64} className="mx-auto text-gray-200 mb-6" />
        <h2 className="font-display text-2xl text-gray-600 mb-2">
          No orders yet
        </h2>
        <p className="text-gray-400">Your order history will appear here.</p>
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-enter">
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-8">
        My Orders
      </h1>

      {/* Confirm Cancel Modal */}
      {confirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiAlertTriangle className="text-red-500" size={24} />
              </div>
              <div>
                <h3 className="font-bold text-gray-800">Cancel Order?</h3>
                <p className="text-sm text-gray-500">
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to cancel this order? If you paid online,
              refund will be processed in 5-7 days.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="flex-1 py-3 border border-gray-200 rounded-xl text-sm
                           font-semibold hover:bg-gray-50 transition-all"
              >
                Keep Order
              </button>
              <button
                onClick={() => handleCancel(confirmId)}
                className="flex-1 py-3 bg-red-500 text-white rounded-xl text-sm
                           font-semibold hover:bg-red-600 transition-all"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {myOrders.map((order) => (
          <div key={order._id} className="card p-5 border border-gray-100">
            {/* Header */}
            <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Order ID</p>
                <p className="font-mono text-sm font-semibold text-gray-700">
                  #{order._id.slice(-8).toUpperCase()}
                </p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                  <FiClock size={10} />
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                {/* Status Badge */}
                <span
                  className={`badge text-xs px-3 py-1.5 font-semibold rounded-full
                  ${STATUS_COLOR[order.status] || "bg-gray-100 text-gray-600"}`}
                >
                  {order.status}
                </span>

                {/* Cancel Button — Only for Pending/Processing */}
                {canCancel(order.status) && (
                  <button
                    onClick={() => setConfirmId(order._id)}
                    disabled={cancellingId === order._id}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold
                               text-red-500 border border-red-200 rounded-full
                               hover:bg-red-50 transition-all disabled:opacity-50"
                  >
                    <FiX size={12} />
                    {cancellingId === order._id
                      ? "Cancelling..."
                      : "Cancel Order"}
                  </button>
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
              {order.items.map((item, i) => (
                <div key={i} className="shrink-0 text-center">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-20 object-cover rounded-xl border border-gray-100"
                  />
                  <p className="text-xs text-gray-500 mt-1 max-w-[64px] truncate">
                    {item.name}
                  </p>
                  <p className="text-xs text-gray-400">×{item.qty}</p>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div
              className="flex flex-wrap justify-between items-center gap-2
                            pt-3 border-t border-gray-100"
            >
              <div className="text-xs text-gray-500 space-y-0.5">
                <p>
                  📍 {order.shippingAddress?.city},{" "}
                  {order.shippingAddress?.state}
                </p>
                <p>
                  💳 {order.paymentMethod} ·{" "}
                  {order.items.reduce((a, i) => a + i.qty, 0)} item(s)
                </p>
              </div>
              <p className="font-bold text-primary text-lg">
                ₹{order.totalPrice.toLocaleString("en-IN")}
              </p>
            </div>

            {/* Cancelled Message */}
            {order.status === "Cancelled" && (
              <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-100">
                <p className="text-xs text-red-600 font-medium">
                  ❌ This order has been cancelled.
                  {order.isPaid &&
                    " Refund will be processed in 5-7 business days."}
                </p>
              </div>
            )}

            {/* Delivered Message */}
            {order.status === "Delivered" && (
              <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
                <p className="text-xs text-green-600 font-medium">
                  ✅ Order delivered successfully! Thank you for shopping with
                  us 🌸
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
