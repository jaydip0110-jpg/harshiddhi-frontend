import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { clearCart, selectCartTotal } from "../redux/slices/cartSlice";
import { FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";

const STEPS = ["Shipping", "Payment", "Confirm"];

// Token get from all places
const getToken = () => {
  try {
    const t1 = localStorage.getItem("userToken");
    if (t1) return t1;

    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const t2 = JSON.parse(userInfo)?.token;
      if (t2) return t2;
    }

    const persisted = localStorage.getItem("harshiddhi");
    if (persisted) {
      const t3 = JSON.parse(persisted)?.auth?.user?.token;
      if (t3) return t3;
    }
  } catch (_) {}
  return null;
};

// Dynamic API URL
const getBaseURL = () => {
  if (import.meta.env.MODE === "production") {
    return "https://harshiddhi-backend.onrender.com/api";
  }
  return "http://localhost:5000/api";
};

export default function CheckoutPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items } = useSelector((s) => s.cart);
  const { user } = useSelector((s) => s.auth);
  const subtotal = useSelector(selectCartTotal);

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [shipping, setShipping] = useState({
    name: user?.name || "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
  });

  const shippingCost = subtotal >= 999 ? 0 : 99;
  const tax = Math.round(subtotal * 0.05);
  const total = subtotal + shippingCost + tax;

  const handleShippingSubmit = (e) => {
    e.preventDefault();
    const { name, phone, street, city, state, pincode } = shipping;
    if (!name || !phone || !street || !city || !state || !pincode) {
      return toast.error("Please fill all fields");
    }
    setStep(1);
  };

  const handlePlaceOrder = async () => {
    setLoading(true);

    try {
      // Token get
      const token = getToken();
      console.log("Token:", token ? "Found ✅" : "Not found ❌");

      if (!token) {
        toast.error("Session expired! Please login again");
        navigate("/login");
        return;
      }

      const baseURL = getBaseURL();

      const orderData = {
        items: items.map((i) => ({
          product: i._id,
          name: i.name,
          image: i.images?.[0] || "",
          price: i.price,
          qty: i.qty,
        })),
        shippingAddress: shipping,
        paymentMethod,
        itemsPrice: subtotal,
        shippingPrice: shippingCost,
        taxPrice: tax,
        totalPrice: total,
      };

      console.log("Placing order to:", `${baseURL}/orders`);
      console.log("Order data:", orderData);

      const response = await fetch(`${baseURL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();
      console.log("Order response:", data);

      if (!response.ok) {
        throw new Error(data.message || `Order failed: ${response.status}`);
      }

      dispatch(clearCart());
      toast.success("Order placed successfully! 🎉");
      navigate("/order/success", { state: { orderId: data._id } });
    } catch (err) {
      console.error("Order error:", err);
      toast.error(err.message || "Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-enter">
      <h1 className="font-display text-3xl font-bold text-gray-800 mb-8">
        Checkout
      </h1>

      {/* Stepper */}
      <div className="flex items-center justify-center mb-10">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center">
            <div
              className={`flex items-center justify-center w-9 h-9 rounded-full
                            text-sm font-bold transition-all
              ${
                i < step
                  ? "bg-green-500 text-white"
                  : i === step
                    ? "bg-primary text-white"
                    : "bg-gray-200 text-gray-500"
              }`}
            >
              {i < step ? <FiCheck size={16} /> : i + 1}
            </div>
            <span
              className={`ml-2 text-sm font-medium hidden sm:block
              ${i === step ? "text-primary" : "text-gray-400"}`}
            >
              {s}
            </span>
            {i < STEPS.length - 1 && (
              <div
                className={`mx-3 h-0.5 w-12 sm:w-20 transition-all
                ${i < step ? "bg-green-500" : "bg-gray-200"}`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 0 — Shipping */}
          {step === 0 && (
            <form
              onSubmit={handleShippingSubmit}
              className="card p-6 border border-gray-100"
            >
              <h2 className="font-display text-xl font-bold mb-5">
                Shipping Address
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600 mb-1 block">
                    Full Name *
                  </label>
                  <input
                    value={shipping.name}
                    onChange={(e) =>
                      setShipping((p) => ({ ...p, name: e.target.value }))
                    }
                    className="input-field"
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Phone Number *
                  </label>
                  <input
                    value={shipping.phone}
                    onChange={(e) =>
                      setShipping((p) => ({ ...p, phone: e.target.value }))
                    }
                    className="input-field"
                    placeholder="+91 XXXXX XXXXX"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Pincode *
                  </label>
                  <input
                    value={shipping.pincode}
                    onChange={(e) =>
                      setShipping((p) => ({ ...p, pincode: e.target.value }))
                    }
                    className="input-field"
                    placeholder="395001"
                    required
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-sm text-gray-600 mb-1 block">
                    Street Address *
                  </label>
                  <input
                    value={shipping.street}
                    onChange={(e) =>
                      setShipping((p) => ({ ...p, street: e.target.value }))
                    }
                    className="input-field"
                    placeholder="House no., Street, Area"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    City *
                  </label>
                  <input
                    value={shipping.city}
                    onChange={(e) =>
                      setShipping((p) => ({ ...p, city: e.target.value }))
                    }
                    className="input-field"
                    placeholder="Surat"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    State *
                  </label>
                  <input
                    value={shipping.state}
                    onChange={(e) =>
                      setShipping((p) => ({ ...p, state: e.target.value }))
                    }
                    className="input-field"
                    placeholder="Gujarat"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary w-full mt-6 py-3.5">
                Continue to Payment
              </button>
            </form>
          )}

          {/* Step 1 — Payment */}
          {step === 1 && (
            <div className="card p-6 border border-gray-100">
              <h2 className="font-display text-xl font-bold mb-5">
                Payment Method
              </h2>
              <div className="space-y-3">
                {[
                  {
                    value: "COD",
                    label: "Cash on Delivery",
                    desc: "Pay when your order arrives",
                  },
                  {
                    value: "UPI",
                    label: "UPI Payment",
                    desc: "GPay, PhonePe, Paytm, etc.",
                  },
                  {
                    value: "Card",
                    label: "Debit / Credit Card",
                    desc: "All major cards accepted",
                  },
                  {
                    value: "NetBanking",
                    label: "Net Banking",
                    desc: "All major banks",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all
                      ${
                        paymentMethod === opt.value
                          ? "border-primary bg-rose/50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={opt.value}
                      checked={paymentMethod === opt.value}
                      onChange={() => setPaymentMethod(opt.value)}
                      className="accent-primary w-4 h-4"
                    />
                    <div>
                      <p className="font-semibold text-sm">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(0)}
                  className="btn-outline flex-1"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  className="btn-primary flex-1"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {/* Step 2 — Confirm */}
          {step === 2 && (
            <div className="card p-6 border border-gray-100">
              <h2 className="font-display text-xl font-bold mb-5">
                Order Confirmation
              </h2>

              {/* Items */}
              <div className="space-y-3 mb-6">
                {items.map((item) => (
                  <div key={item._id} className="flex gap-3 items-center">
                    <img
                      src={item.images?.[0] || ""}
                      alt={item.name}
                      className="w-16 h-20 object-cover rounded-xl shrink-0"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                      <p className="text-xs text-primary font-semibold">
                        ₹{(item.price * item.qty).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Summary */}
              <div className="bg-cream rounded-xl p-4 text-sm space-y-1.5 mb-6">
                <p>
                  <strong>Name:</strong> {shipping.name}
                </p>
                <p>
                  <strong>Phone:</strong> {shipping.phone}
                </p>
                <p>
                  <strong>Address:</strong> {shipping.street}, {shipping.city} -{" "}
                  {shipping.pincode}
                </p>
                <p>
                  <strong>State:</strong> {shipping.state}
                </p>
                <p>
                  <strong>Payment:</strong> {paymentMethod}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="btn-outline flex-1"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={loading}
                  className="btn-primary flex-1 py-3.5 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div
                        className="w-4 h-4 border-2 border-white border-t-transparent
                                      rounded-full animate-spin"
                      />
                      Placing Order...
                    </>
                  ) : (
                    "🌸 Place Order"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Price Summary */}
        <div className="card p-5 border border-gray-100 h-fit sticky top-24">
          <h3 className="font-display font-bold text-gray-800 mb-4">
            Price Details
          </h3>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span
                className={
                  shippingCost === 0 ? "text-green-600 font-semibold" : ""
                }
              >
                {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Tax (5%)</span>
              <span>₹{tax}</span>
            </div>
            <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary">
                ₹{total.toLocaleString("en-IN")}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
