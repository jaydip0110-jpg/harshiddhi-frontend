import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchProductById } from "../redux/slices/productSlice";
import { addToCart } from "../redux/slices/cartSlice";
import {
  FiStar,
  FiShoppingCart,
  FiArrowLeft,
  FiTruck,
  FiShield,
  FiZap,
  FiHeart,
} from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import { addToWishlist } from "../redux/slices/wishlistSlice";
import api from "../services/api";
import toast from "react-hot-toast";

export default function ProductDetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: product, loading } = useSelector((s) => s.product);
  const { user } = useSelector((s) => s.auth);
  const wishlistItems = useSelector((s) => s.wishlist?.items || []);
  const isWishlisted = wishlistItems.some((i) => i._id === product?._id);

  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    dispatch(fetchProductById(id));
    setActiveImg(0);
    setSelectedSize("");
    setQty(1);
  }, [id, dispatch]);

  // Loading skeleton
  if (loading || !product)
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="skeleton aspect-[3/4] rounded-2xl" />
          <div className="space-y-4">
            {[80, 50, 30, 60, 40].map((w, i) => (
              <div
                key={i}
                className="skeleton h-5 rounded"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    );

  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  // ── Add to Cart ──
  const handleAddToCart = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      return toast.error("Please select a size first");
    }
    dispatch(
      addToCart({
        ...product,
        price: discountedPrice,
        qty,
        selectedSize: selectedSize || "",
      }),
    );
  };

  // ── Buy Now ──
  const handleBuyNow = () => {
    if (product.sizes?.length > 0 && !selectedSize) {
      return toast.error("Please select a size first");
    }
    dispatch(
      addToCart({
        ...product,
        price: discountedPrice,
        qty,
        selectedSize: selectedSize || "",
      }),
    );
    navigate("/cart");
  };

  // ── Submit Review ──
  const handleReview = async (e) => {
    e.preventDefault();
    setReviewing(true);
    try {
      await api.post(`/products/${id}/reviews`, { rating, comment });
      toast.success("Review submitted!");
      dispatch(fetchProductById(id));
      setComment("");
      setRating(5);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewing(false);
    }
  };

  const images = product.images?.length
    ? product.images
    : ["https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600"];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500
                   hover:text-primary transition-colors mb-6"
      >
        <FiArrowLeft size={16} /> Back
      </button>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* ── Images ── */}
        <div className="space-y-3">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden bg-gray-100 shadow-lg relative">
            <img
              src={images[activeImg]}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
            {/* Wishlist on detail page */}
            <button
              onClick={() => dispatch(addToWishlist(product))}
              className="absolute top-3 right-3 p-3 bg-white rounded-full shadow-lg
                         hover:scale-110 transition-all"
            >
              {isWishlisted ? (
                <FaHeart size={20} className="text-primary" />
              ) : (
                <FiHeart size={20} className="text-gray-400" />
              )}
            </button>
          </div>

          {/* Thumbnail Strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImg(i)}
                  className={`shrink-0 w-16 h-20 rounded-xl overflow-hidden border-2 transition-all
                    ${
                      i === activeImg
                        ? "border-primary shadow-md"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Product Info ── */}
        <div className="space-y-5">
          {/* Category + Name */}
          <div>
            <span className="badge bg-rose text-primary border border-primary/20 text-xs mb-2 inline-block">
              {product.category}
            </span>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 leading-snug">
              {product.name}
            </h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex text-gold">
              {Array.from({ length: 5 }).map((_, i) => (
                <FiStar
                  key={i}
                  size={16}
                  className={i < Math.round(product.rating) ? "fill-gold" : ""}
                />
              ))}
            </div>
            <span className="text-sm text-gray-500">
              ({product.numReviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-display text-3xl font-bold text-gray-900">
              ₹{discountedPrice.toLocaleString("en-IN")}
            </span>
            {product.discount > 0 && (
              <>
                <span className="text-lg text-gray-400">
                  (₹{product.price.toLocaleString("en-IN")})
                </span>
                <span className="badge bg-green-100 text-green-700 text-sm px-2 py-0.5 rounded-full">
                  {product.discount}% off
                </span>
              </>
            )}
          </div>

          {/* Details */}
          <div className="bg-cream rounded-xl p-4 space-y-2 text-sm">
            {product.fabric && (
              <div className="flex gap-3">
                <span className="text-gray-500 w-24 shrink-0">Fabric</span>
                <span className="font-medium">{product.fabric}</span>
              </div>
            )}
            {product.color && (
              <div className="flex gap-3">
                <span className="text-gray-500 w-24 shrink-0">Color</span>
                <span className="font-medium">{product.color}</span>
              </div>
            )}
            <div className="flex gap-3">
              <span className="text-gray-500 w-24 shrink-0">Availability</span>
              <span
                className={`font-semibold ${product.stock > 0 ? "text-green-600" : "text-red-500"}`}
              >
                {product.stock > 0
                  ? `In Stock (${product.stock} left)`
                  : "Out of Stock"}
              </span>
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-600 text-sm leading-relaxed">
            {product.description}
          </p>

          {/* ── Size Selector ── */}
          {product.sizes && product.sizes.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-gray-700">
                  Select Size
                </label>
                {selectedSize && (
                  <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full font-semibold">
                    Selected: {selectedSize}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() =>
                      setSelectedSize(selectedSize === size ? "" : size)
                    }
                    className={`px-4 py-2.5 rounded-xl text-sm font-semibold
                                border-2 transition-all duration-200
                      ${
                        selectedSize === size
                          ? "bg-primary text-white border-primary shadow-md scale-105"
                          : "bg-white text-gray-700 border-gray-200 hover:border-primary hover:text-primary"
                      }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              {!selectedSize && (
                <p className="text-xs text-amber-500 mt-2 flex items-center gap-1">
                  ⚠️ Please select a size before adding to cart
                </p>
              )}
            </div>
          )}

          {/* ── Quantity ── */}
          {product.stock > 0 && (
            <div className="flex items-center gap-4">
              <span className="text-sm font-semibold text-gray-700">Qty:</span>
              <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors font-bold text-lg"
                >
                  −
                </button>
                <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  className="px-4 py-2 hover:bg-gray-100 transition-colors font-bold text-lg"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* ── CTAs ── */}
          <div className="flex gap-3 flex-wrap">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-outline flex items-center gap-2 flex-1
                         justify-center min-w-[140px]"
            >
              <FiShoppingCart size={16} /> Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="btn-primary flex items-center gap-2 flex-1
                         justify-center min-w-[140px]"
            >
              <FiZap size={16} /> Buy Now
            </button>
          </div>

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            {[
              [FiTruck, "Free Delivery", "Orders above ₹999"],
              [FiShield, "Authentic", "100% genuine product"],
              [FiStar, "7-Day Return", "Easy return policy"],
            ].map(([Icon, t, d]) => (
              <div
                key={t}
                className="text-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm"
              >
                <Icon className="mx-auto text-primary mb-1" size={18} />
                <p className="text-xs font-semibold text-gray-700">{t}</p>
                <p className="text-xs text-gray-400">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Reviews ── */}
      <section className="mt-16">
        <h2 className="font-display text-2xl font-bold text-gray-800 mb-6">
          Customer Reviews
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Review List */}
          <div className="space-y-4">
            {product.reviews?.length === 0 && (
              <p className="text-gray-400 italic">
                No reviews yet. Be the first to review!
              </p>
            )}
            {product.reviews?.map((r) => (
              <div key={r._id} className="card p-4 border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-gold
                                    flex items-center justify-center text-white text-xs font-bold"
                    >
                      {r.name[0]}
                    </div>
                    <span className="font-semibold text-sm">{r.name}</span>
                  </div>
                  <div className="flex text-gold">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <FiStar key={i} size={12} className="fill-gold" />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 text-sm">{r.comment}</p>
              </div>
            ))}
          </div>

          {/* Write Review */}
          {user && (
            <div className="card p-6 border border-gray-100">
              <h3 className="font-semibold mb-4">Write a Review</h3>
              <form onSubmit={handleReview} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-600 mb-1 block">
                    Rating
                  </label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setRating(s)}
                      >
                        <FiStar
                          size={24}
                          className={
                            s <= rating
                              ? "fill-gold text-gold"
                              : "text-gray-300"
                          }
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience…"
                  rows={4}
                  className="input-field resize-none"
                  required
                />
                <button
                  type="submit"
                  disabled={reviewing}
                  className="btn-primary w-full"
                >
                  {reviewing ? "Submitting…" : "Submit Review"}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
