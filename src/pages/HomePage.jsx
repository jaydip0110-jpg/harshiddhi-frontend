import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchFeatured, fetchProducts } from "../redux/slices/productSlice";
import ProductCard from "../components/product/ProductCard";
import { ProductCardSkeleton } from "../components/common/Skeleton";
import {
  FiArrowRight,
  FiTruck,
  FiShield,
  FiRotateCcw,
  FiStar,
} from "react-icons/fi";

const CATEGORIES = [
  {
    name: "Sarees",
    emoji: "🥻",
    color: "from-pink-100 to-rose-200",
    img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300",
  },
  {
    name: "Lehenga",
    emoji: "👗",
    color: "from-purple-100 to-pink-200",
    img: "https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=300",
  },
  {
    name: "Dresses",
    emoji: "✨",
    color: "from-amber-100 to-yellow-200",
    img: "https://images.unsplash.com/photo-1539008835657-9e8e9680c956?w=300",
  },
  {
    name: "Suits",
    emoji: "👘",
    color: "from-teal-100 to-green-200",
    img: "https://images.unsplash.com/photo-1594938298603-c8148c4b4468?w=300",
  },
  {
    name: "Kurtis",
    emoji: "🌸",
    color: "from-orange-100 to-amber-200",
    img: "https://images.unsplash.com/photo-1605763240000-7e93b172d754?w=300",
  },
  {
    name: "Dupattas",
    emoji: "🎀",
    color: "from-indigo-100 to-purple-200",
    img: "https://images.unsplash.com/photo-1602614628304-2ae3d2b0a4ab?w=300",
  },
];

const FEATURES = [
  { icon: FiTruck, title: "Free Shipping", desc: "On orders above ₹999" },
  {
    icon: FiShield,
    title: "100% Authentic",
    desc: "Genuine handcrafted products",
  },
  {
    icon: FiRotateCcw,
    title: "Easy Returns",
    desc: "7-day hassle-free returns",
  },
  {
    icon: FiStar,
    title: "Premium Quality",
    desc: "Curated by expert stylists",
  },
];

const TESTIMONIALS = [
  {
    name: "Priya Sharma",
    city: "Surat",
    rating: 5,
    text: "The Kanjivaram saree I ordered was absolutely stunning. Quality exceeded expectations!",
  },
  {
    name: "Anita Patel",
    city: "Ahmedabad",
    rating: 5,
    text: "Beautiful lehenga, perfect stitching. Got so many compliments at my daughter's wedding.",
  },
  {
    name: "Meera Desai",
    city: "Mumbai",
    rating: 5,
    text: "Fast delivery and amazing packaging. The saree color was exactly as shown. Will order again!",
  },
];

export default function HomePage() {
  const dispatch = useDispatch();
  const {
    featured,
    list: allProducts,
    loading,
  } = useSelector((s) => s.product);

  useEffect(() => {
    // Featured + Latest products fetch
    dispatch(fetchFeatured());
    dispatch(fetchProducts({ limit: 8, page: 1 }));
  }, [dispatch]);

  // Latest 4 products — newly added
  const latestProducts = [...allProducts]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 4);

  return (
    <div className="page-enter">
      {/* ── Hero Banner ── */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-[#1a0a10] via-[#2d1018] to-[#1a0a10]">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23D4AF37' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
          }}
        />
        <div className="absolute right-0 top-0 h-full w-1/2 opacity-30 md:opacity-50">
          <img
            src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800"
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a0a10] to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20">
          <div className="max-w-2xl">
            <p className="text-gold text-sm font-body tracking-[0.3em] uppercase mb-4 animate-fade-in">
              ✦ New Collection 2024 ✦
            </p>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight mb-6 animate-slide-up">
              Wear the
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gold-light to-gold">
                Elegance
              </span>
              of India
            </h1>
            <p className="text-gray-300 text-lg mb-8 font-body leading-relaxed animate-fade-in">
              Discover our curated collection of handcrafted sarees, bridal
              lehengas, and designer dresses.
            </p>
            <div className="flex flex-wrap gap-4 animate-slide-up">
              <Link
                to="/products"
                className="btn-gold text-base px-8 py-3.5 inline-flex items-center gap-2"
              >
                Shop Now <FiArrowRight />
              </Link>
              <Link
                to="/products?category=Sarees"
                className="border-2 border-white/30 text-white px-8 py-3.5 rounded-full font-semibold
                               hover:border-gold hover:text-gold transition-all duration-300"
              >
                Explore Sarees
              </Link>
            </div>
            <div className="flex gap-8 mt-12 pt-8 border-t border-white/10">
              {[
                ["500+", "Products"],
                ["10K+", "Happy Customers"],
                ["4.9★", "Rating"],
              ].map(([num, label]) => (
                <div key={label}>
                  <div className="font-display text-2xl font-bold text-gold">
                    {num}
                  </div>
                  <div className="text-gray-400 text-xs">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Bar ── */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 p-3">
              <div className="p-2.5 bg-rose rounded-xl shrink-0">
                <Icon className="text-primary" size={20} />
              </div>
              <div>
                <p className="font-semibold text-sm text-gray-800">{title}</p>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <h2 className="section-title">Shop by Category</h2>
        <p className="section-subtitle">
          Explore our wide range of ethnic Indian wear
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className="group flex flex-col items-center"
            >
              <div
                className={`w-full aspect-square rounded-2xl bg-gradient-to-br ${cat.color}
                              overflow-hidden shadow-md group-hover:shadow-xl transition-all
                              duration-300 group-hover:-translate-y-1`}
              >
                <img
                  src={cat.img}
                  alt={cat.name}
                  className="w-full h-full object-cover mix-blend-multiply opacity-70
                                group-hover:opacity-90 transition-all duration-300 group-hover:scale-105"
                />
              </div>
              <span className="mt-2 font-semibold text-sm text-gray-700 group-hover:text-primary transition-colors">
                {cat.emoji} {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── NEW Arrivals — Admin Add કરેલ Latest Products ── */}
      {latestProducts.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="section-title text-left mb-0">New Arrivals</h2>
              <Link
                to="/products?sort=newest"
                className="text-primary text-sm font-semibold hover:underline flex items-center gap-1"
              >
                View All <FiArrowRight size={14} />
              </Link>
            </div>
            <p className="text-gray-500 mb-8 text-sm">
              Fresh picks just added to our collection
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {loading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <ProductCardSkeleton key={i} />
                  ))
                : latestProducts.map((p) => (
                    <ProductCard key={p._id} product={p} />
                  ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Featured Collection ── */}
      <section className="py-16 bg-cream">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="section-title">Featured Collection</h2>
          <p className="section-subtitle">
            Hand-picked pieces loved by our customers
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))
              : featured.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
          <div className="text-center mt-10">
            <Link
              to="/products"
              className="btn-outline inline-flex items-center gap-2"
            >
              View All Products <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Promo Banner ── */}
      <section className="py-16 max-w-7xl mx-auto px-4">
        <div className="rounded-3xl overflow-hidden relative bg-gradient-to-r from-primary to-primary-dark text-white">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='1' fill-rule='evenodd'%3E%3Cpath d='M0 40L40 0H20L0 20M40 40V20L20 40'/%3E%3C/g%3E%3C/svg%3E\")",
            }}
          />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-8 md:px-16 py-12 gap-6">
            <div>
              <p className="text-gold font-body tracking-widest text-sm uppercase mb-2">
                Limited Time Offer
              </p>
              <h3 className="font-display text-3xl md:text-4xl font-bold mb-2">
                Bridal Season Sale
              </h3>
              <p className="text-white/80 text-lg">
                Up to 40% off on bridal lehengas & wedding sarees
              </p>
            </div>
            <Link
              to="/products?category=Lehenga"
              className="btn-gold shrink-0 text-base px-8 py-4 inline-flex items-center gap-2"
            >
              Shop Bridal <FiArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="section-title">What Our Customers Say</h2>
          <p className="section-subtitle">
            Trusted by thousands of happy customers across India
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, city, rating, text }) => (
              <div key={name} className="card p-6 border border-gray-100">
                <div className="flex text-gold mb-3">
                  {Array.from({ length: rating }).map((_, i) => (
                    <FiStar key={i} className="fill-gold" size={16} />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
                  "{text}"
                </p>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-gold
                                  flex items-center justify-center text-white font-bold text-sm"
                  >
                    {name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{name}</p>
                    <p className="text-xs text-gray-500">{city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
