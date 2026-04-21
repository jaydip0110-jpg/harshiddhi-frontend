import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, deleteProduct } from '../../redux/slices/productSlice';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { list: products, loading } = useSelector(s => s.product);
  const [search, setSearch] = useState('');

  useEffect(() => { dispatch(fetchProducts({ limit: 100 })); }, [dispatch]);

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await dispatch(deleteProduct(id)).unwrap();
      toast.success('Product deleted');
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 page-enter">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl font-bold text-gray-800">Products</h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2">
          <FiPlus size={16} /> Add Product
        </Link>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input value={search} onChange={e => setSearch(e.target.value)}
               placeholder="Search products…" className="input-field pl-10" />
      </div>

      {/* Table */}
      <div className="card border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-left">Product</th>
                <th className="px-4 py-3 text-left">Category</th>
                <th className="px-4 py-3 text-left">Price</th>
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3 text-left">Featured</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-4 py-4"><div className="skeleton h-4 rounded" /></td></tr>
                ))
              ) : filtered.map(product => (
                <tr key={product._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={product.images?.[0] || ''} alt={product.name}
                           className="w-12 h-14 object-cover rounded-lg shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-400">{product._id.slice(-8)}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="badge bg-rose text-primary text-xs">{product.category}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold">
                    ₹{product.price.toLocaleString('en-IN')}
                    {product.discount > 0 && (
                      <span className="ml-1 text-xs text-green-600">(-{product.discount}%)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${product.stock === 0 ? 'text-red-500' : product.stock < 5 ? 'text-amber-500' : 'text-green-600'}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`badge text-xs ${product.featured ? 'bg-gold/20 text-gold-dark' : 'bg-gray-100 text-gray-500'}`}>
                      {product.featured ? '★ Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/admin/products/${product._id}/edit`}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-all">
                        <FiEdit2 size={15} />
                      </Link>
                      <button onClick={() => handleDelete(product._id, product.name)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <FiTrash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">No products found</div>
          )}
        </div>
      </div>
    </div>
  );
}
