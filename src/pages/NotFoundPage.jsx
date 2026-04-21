import { Link } from 'react-router-dom';
import { FiHome, FiArrowRight } from 'react-icons/fi';

export default function NotFoundPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 text-center page-enter">
      <div>
        <div className="text-8xl font-display font-bold text-primary/20 mb-4">404</div>
        <h1 className="font-display text-3xl font-bold text-gray-800 mb-3">Page Not Found</h1>
        <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn-primary inline-flex items-center gap-2">
            <FiHome size={16}/> Go Home
          </Link>
          <Link to="/products" className="btn-outline inline-flex items-center gap-2">
            Browse Products <FiArrowRight size={16}/>
          </Link>
        </div>
      </div>
    </div>
  );
}
