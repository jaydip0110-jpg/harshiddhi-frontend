import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  removeFromCart,
  updateQty,
  selectCartTotal,
} from "../redux/slices/cartSlice";
import { FiTrash2, FiArrowRight, FiShoppingBag } from "react-icons/fi";

export default function CartPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const total = useSelector(selectCartTotal);

  const shipping = total >= 999 ? 0 : 99;
  const tax = Math.round(total * 0.05);
  const grand = total + shipping + tax;

  if (items.length === 0)
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center page-enter">
        <FiShoppingBag size={64} className="mx-auto text-gray-200 mb-6" />
        <h2 className="font-display text-2xl text-gray-600 mb-2">
          Your cart is empty
        </h2>
        <p className="text-gray-400 mb-8">
          Add some beautiful pieces to get started!
        </p>
        <Link
          to="/products"
          className="btn-primary inline-flex items-center gap-2"
        >
          Browse Products <FiArrowRight />
        </Link>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-8">
        Shopping Cart
      </h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="card p-4 flex gap-4 border border-gray-100"
            >
              {/* Image */}
              <Link to={`/products/${item._id}`} className="shrink-0">
                <img
                  src={
                    item.images?.[0] ||
                    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=200"
                  }
                  alt={item.name}
                  className="w-24 h-32 object-cover rounded-xl"
                />
              </Link>
              {/* Details */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="text-xs text-primary font-semibold uppercase tracking-wide">
                      {item.category}
                    </p>
                    <Link to={`/products/${item._id}`}>
                      <h3 className="font-display font-semibold text-gray-800 hover:text-primary transition-colors line-clamp-2">
                        {item.name}
                      </h3>
                    </Link>
                  </div>
                  <button
                    onClick={() => dispatch(removeFromCart(item._id))}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all shrink-0"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                {item.color && (
                  <p className="text-xs text-gray-500">Color: {item.color}</p>
                )}
                {item.fabric && (
                  <p className="text-xs text-gray-500">Fabric: {item.fabric}</p>
                )}
                {item.selectedSize && (
                  <p className="text-xs text-primary font-semibold">
                    Size: {item.selectedSize}
                  </p>
                )}

                <div className="flex items-center justify-between mt-3">
                  {/* Qty */}
                  <div className="flex items-center border border-gray-200 rounded-full overflow-hidden text-sm">
                    <button
                      onClick={() =>
                        item.qty > 1
                          ? dispatch(
                              updateQty({ id: item._id, qty: item.qty - 1 }),
                            )
                          : dispatch(removeFromCart(item._id))
                      }
                      className="px-3 py-1.5 hover:bg-gray-100 transition-colors font-bold"
                    >
                      −
                    </button>
                    <span className="px-3 py-1.5 font-semibold min-w-[2rem] text-center">
                      {item.qty}
                    </span>
                    <button
                      onClick={() =>
                        dispatch(
                          updateQty({
                            id: item._id,
                            qty: Math.min(item.stock, item.qty + 1),
                          }),
                        )
                      }
                      className="px-3 py-1.5 hover:bg-gray-100 transition-colors font-bold"
                    >
                      +
                    </button>
                  </div>
                  {/* Price */}
                  <p className="font-bold text-gray-900">
                    ₹{(item.price * item.qty).toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 border border-gray-100 sticky top-24">
            <h2 className="font-display text-xl font-bold text-gray-800 mb-5">
              Order Summary
            </h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>
                  Subtotal ({items.reduce((a, i) => a + i.qty, 0)} items)
                </span>
                <span className="font-semibold">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span
                  className={`font-semibold ${shipping === 0 ? "text-green-600" : ""}`}
                >
                  {shipping === 0 ? "FREE" : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5%)</span>
                <span className="font-semibold">₹{tax}</span>
              </div>
              {shipping > 0 && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
                  Add ₹{(999 - total).toLocaleString("en-IN")} more for FREE
                  shipping!
                </p>
              )}
              <div className="border-t border-gray-200 pt-3 flex justify-between text-base font-bold">
                <span>Total</span>
                <span className="text-primary">
                  ₹{grand.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                user
                  ? navigate("/checkout")
                  : navigate("/login?redirect=/checkout")
              }
              className="btn-primary w-full mt-6 flex items-center justify-center gap-2 text-base py-4"
            >
              {user ? "Proceed to Checkout" : "Login to Checkout"}{" "}
              <FiArrowRight />
            </button>
            <Link
              to="/products"
              className="block text-center text-sm text-gray-500 hover:text-primary mt-3 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
