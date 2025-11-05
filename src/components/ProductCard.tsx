import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';
import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import type { Product } from '../lib/types';
import { toggleWishlist, isInWishlist } from '../lib/wishlist';

// Re-export Product type for backwards compatibility
export type { Product } from '../lib/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
}

export function ProductCard({ product, onAddToCart, onProductClick }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const themeColor = product.store === 'healthcare' ? 'healthcare' : 'electronics';
  const priceWithVAT = product.price;
  const priceExclVAT = product.price / 1.15;

  // Check if product is in wishlist on mount
  useEffect(() => {
    isInWishlist(product.id).then(setIsWishlisted);
  }, [product.id]);

  const handleWishlistClick = async () => {
    const success = await toggleWishlist({
      product_id: product.id,
      product_title: product.name,
      product_price: Math.round(product.price * 100), // Convert to cents
      product_thumbnail: product.image,
      product_handle: product.handle,
    });
    if (success) {
      setIsWishlisted(!isWishlisted);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -8 }}
      className="group cursor-pointer h-full"
    >
      <Card className="overflow-hidden border-2 border-gray-100 hover:border-gray-200 hover:shadow-2xl transition-all duration-500 h-full flex flex-col rounded-2xl relative">
        {/* Subtle gradient overlay on hover */}
        <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 pointer-events-none ${themeColor === 'healthcare' ? 'bg-gradient-to-br from-cyan-500 to-teal-600' : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`} />
        
        {/* Image */}
        <div 
          className="relative aspect-square bg-gray-50 overflow-hidden"
          onClick={() => onProductClick(product)}
        >
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
          />
          
          {/* Rating Badge - Only show for rated products */}
          {product.rating > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="absolute top-3 left-3 bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs flex items-center gap-1 shadow-lg backdrop-blur-sm"
            >
              <Star className="w-3 h-3 fill-current" />
              {product.rating.toFixed(1)}
            </motion.div>
          )}
          
          {/* Wishlist Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          >
            <Button
              size="icon"
              variant="ghost"
              className="w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleWishlistClick();
              }}
            >
              <motion.div
                animate={isWishlisted ? { scale: [1, 1.3, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart className={`w-5 h-5 transition-colors duration-300 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-700'}`} />
              </motion.div>
            </Button>
          </motion.div>

          {/* Quick Add Overlay */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileHover={{ opacity: 1, y: 0 }}
            className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                size="sm"
                className={`w-full ${themeColor === 'healthcare' ? 'healthcare-gradient' : 'electronics-gradient'} text-white hover:opacity-90 rounded-xl h-10 shadow-lg`}
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Quick Add
              </Button>
            </motion.div>
          </motion.div>
        </div>

        {/* Content */}
        <div className="p-5 flex-1 flex flex-col relative z-10">
          <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{product.category}</div>
          <h3 
            className="text-base font-medium mb-3 line-clamp-2 min-h-[3rem] flex-1 group-hover:text-gray-900 transition-colors"
            onClick={() => onProductClick(product)}
          >
            {product.name}
          </h3>
          
          <div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className={`text-2xl ${themeColor === 'healthcare' ? 'text-healthcare' : 'text-electronics'} group-hover:scale-105 transition-transform duration-300 inline-block`}>
                R{priceWithVAT.toFixed(2)}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Incl. VAT • R{priceExclVAT.toFixed(2)} excl.
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
