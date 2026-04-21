import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FiShoppingCart, FiStar, FiHeart } from 'react-icons/fi';
import { addToCart } from '../../redux/slices/cartSlice';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const discountedPrice = product.discount
    ? Math.round(product.price * (1 - product.discount / 100))
    : product.price;

  return (
    <div className="card group overflow-hidden">
      {/* Image */}
      <Link to={`/products/${product._id}`} className="block relative overflow-hidden aspect-[3/4]">
        <img
          src={product.images?.[0] || 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400'}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {product.discount > 0 && (
            <span className="badge bg-primary text-white text-xs">{product.discount}% OFF</span>
          )}
          {product.stock === 0 && (
            <span className="badge bg-gray-700 text-white text-xs">Out of Stock</span>
          )}
        </div>
        {/* Wishlist */}
        <button className="absolute top-2 right-2 p-2 bg-white rounded-full shadow opacity-0 group-hover:opacity-100
                           transition-all duration-300 hover:bg-primary hover:text-white">
          <FiHeart size={14} />
        </button>
        {/* Quick add */}
        <div className="absolute bottom-0 left-0 right-0 bg-primary text-white text-center py-2.5 text-sm font-semibold
                        translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          Quick View
        </div>
      </Link>

      {/* Info */}
      <div className="p-3">
        <p className="text-xs text-primary font-semibold uppercase tracking-wide mb-1">{product.category}</p>
        <Link to={`/products/${product._id}`}>
          <h3 className="font-display font-semibold text-gray-800 text-sm leading-snug line-clamp-2 hover:text-primary transition-colors">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        {product.numReviews > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <FiStar className="text-gold fill-gold" size={12} />
            <span className="text-xs text-gray-600">{product.rating?.toFixed(1)} ({product.numReviews})</span>
          </div>
        )}

        {/* Price + Cart */}
        <div className="flex items-center justify-between mt-2">
          <div>
            <span className="font-bold text-gray-900">₹{discountedPrice.toLocaleString('en-IN')}</span>
            {product.discount > 0 && (
              <span className="text-xs text-gray-400 line-through ml-1.5">₹{product.price.toLocaleString('en-IN')}</span>
            )}
          </div>
          <button
            onClick={() => dispatch(addToCart({ ...product, price: discountedPrice }))}
            disabled={product.stock === 0}
            className="p-2 bg-rose text-primary rounded-full hover:bg-primary hover:text-white
                       transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiShoppingCart size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
