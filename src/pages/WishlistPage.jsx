import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { removeFromWishlist } from "../redux/slices/wishlistSlice";
import { addToCart } from "../redux/slices/cartSlice";
import {
  FiHeart,
  FiShoppingCart,
  FiTrash2,
  FiArrowRight,
} from "react-icons/fi";

export default function WishlistPage() {
  const dispatch = useDispatch();
  const { items } = useSelector((s) => s.wishlist);

  if (items.length === 0)
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center page-enter">
        <FiHeart size={64} className="mx-auto text-gray-200 mb-6" />
        <h2 className="font-display text-2xl text-gray-600 mb-2">
          Your wishlist is empty
        </h2>
        <p className="text-gray-400 mb-8">Save your favourite items here!</p>
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-gray-800">
            My Wishlist
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {items.length} items saved
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((product) => {
          const discountedPrice = product.discount
            ? Math.round(product.price * (1 - product.discount / 100))
            : product.price;

          return (
            <div key={product._id} className="card overflow-hidden group">
              {/* Image */}
              <Link
                to={`/products/${product._id}`}
                className="block relative overflow-hidden aspect-[3/4]"
              >
                <img
                  src={product.images?.[0] || ""}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                {product.discount > 0 && (
                  <span className="absolute top-2 left-2 badge bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                    {product.discount}% OFF
                  </span>
                )}
              </Link>

              {/* Info */}
              <div className="p-3">
                <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">
                  {product.category}
                </p>
                <Link to={`/products/${product._id}`}>
                  <h3
                    className="font-display font-semibold text-gray-800 text-sm line-clamp-2
                                 hover:text-primary transition-colors"
                  >
                    {product.name}
                  </h3>
                </Link>

                {/* Price */}
                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                  <span className="font-bold text-gray-900">
                    ₹{discountedPrice.toLocaleString("en-IN")}
                  </span>
                  {product.discount > 0 && (
                    <span className="text-xs text-gray-400">
                      (₹{product.price.toLocaleString("en-IN")})
                    </span>
                  )}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      dispatch(
                        addToCart({ ...product, price: discountedPrice }),
                      );
                      dispatch(removeFromWishlist(product._id));
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2
                               bg-primary text-white rounded-xl text-xs font-semibold
                               hover:bg-primary-dark transition-all"
                  >
                    <FiShoppingCart size={13} /> Add to Cart
                  </button>
                  <button
                    onClick={() => dispatch(removeFromWishlist(product._id))}
                    className="p-2 text-red-400 hover:bg-red-50 rounded-xl transition-all"
                  >
                    <FiTrash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
