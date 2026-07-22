import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import * as productService from '../services/productService';
import { useCartStore } from '../store/cartStore';
import PriceTag from '../components/common/PriceTag';
import Rating from '../components/common/Rating';
import StockIndicator from '../components/common/StockIndicator';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { getProductImage } from '../utils/productImages';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { featureFlags } from '../utils/featureFlags';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [socialProof, setSocialProof] = useState('');
  
  const { items, addItem, updateItem, removeItem } = useCartStore();
  const cartItem = items.find(item => String(item?.productId) === String(id));
  const qty = cartItem ? cartItem.quantity : 0;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await productService.getProduct(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!featureFlags.socialProofGamification || !isAuthenticated) return;
    api.get(`/phase8/social-proof/products/${id}`)
      .then(({ data }) => setSocialProof(data.message || ''))
      .catch(() => setSocialProof(''));
  }, [id, isAuthenticated]);

  if (isLoading) return <div className="p-8 text-center">Loading...</div>;
  if (!product) return <div className="p-8 text-center text-red-500">Product not found</div>;

  return (
    <div className="max-w-5xl mx-auto bg-white dark:bg-[#1A1C24] rounded-3xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-800/50">
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/2 p-8 bg-gray-50 dark:bg-[#0F111A] flex items-center justify-center">
          <img src={getProductImage(product)} alt={product.name} className="max-h-96 max-w-full rounded-xl object-contain" />
        </div>
        
        <div className="md:w-1/2 p-8 lg:p-12 space-y-6">
          <div>
            <span className="text-sm font-semibold text-[#8B5CF6] uppercase tracking-wider">{product.brand}</span>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-900 dark:text-white mt-2 leading-tight">{product.name}</h1>
            {socialProof && <p className="mt-3 rounded-full bg-[#ECFDF5] px-3 py-1 text-sm font-bold text-[#047857]">{socialProof}</p>}
            <div className="flex items-center gap-4 mt-4">
              <Rating value={product.rating || 4} />
              <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{product.unit}</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-6 border-y border-gray-100 dark:border-gray-800/50">
            <PriceTag price={product.price} mrp={product.mrp} className="text-4xl font-black text-gray-900 dark:text-white" />
            <StockIndicator inStock={product.inStock} stockCount={product.stockQty} />
          </div>

          <div className="py-2">
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
              {product.description || 'Premium quality product directly sourced for maximum freshness. Add to your cart to experience the best.'}
            </p>
          </div>

          <div className="pt-6">
            {qty > 0 ? (
              <div className="flex items-center w-full sm:w-48 bg-gray-100 dark:bg-[#0F111A] rounded-2xl h-14 border border-gray-200 dark:border-gray-700 shadow-inner">
                <button onClick={() => isAuthenticated ? (qty === 1 ? removeItem(cartItem._id) : updateItem(cartItem._id, qty - 1)) : navigate('/auth')} className="flex-1 flex justify-center text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors h-full items-center">
                  <Minus className="w-5 h-5" />
                </button>
                <span className="px-4 font-bold text-gray-900 dark:text-white text-xl">{qty}</span>
                <button onClick={() => isAuthenticated ? updateItem(cartItem._id, qty + 1) : navigate('/auth')} className="flex-1 flex justify-center text-[#8B5CF6] hover:text-[#7C3AED] transition-colors h-full items-center">
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => isAuthenticated ? addItem(product.id, 1, 'manual') : navigate('/auth')} 
                className="w-full sm:w-56 py-4 text-base font-bold flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F97316] text-white hover:opacity-90 transition-opacity shadow-lg shadow-[#EC4899]/20"
                disabled={!product.inStock}
              >
                <ShoppingCart className="w-5 h-5" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
