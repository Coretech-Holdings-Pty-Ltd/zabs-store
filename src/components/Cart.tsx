import { Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Product } from './ProductCard';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion, AnimatePresence } from 'motion/react';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartProps {
  isOpen?: boolean;
  onClose?: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onContinueShopping: () => void;
  onCheckout: () => void;
}

export function Cart({ items, onUpdateQuantity, onRemoveItem, onContinueShopping, onCheckout }: CartProps) {
  // Calculate totals
  const subtotalInclVAT = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const subtotalExclVAT = subtotalInclVAT / 1.15;
  const vat = subtotalInclVAT - subtotalExclVAT;
  const shipping = subtotalInclVAT > 1000 ? 0 : 100;
  const total = subtotalInclVAT + shipping;

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
          >
            <ShoppingBag className="w-20 h-20 mx-auto text-gray-300 mb-6" />
          </motion.div>
          <h2 className="text-2xl md:text-3xl mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">Looks like you haven't added anything yet</p>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              onClick={onContinueShopping}
              className="healthcare-gradient text-white rounded-full px-8 h-12"
            >
              Start Shopping
            </Button>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
          onClick={onContinueShopping}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 md:mb-8 transition-colors bg-white px-4 py-2 rounded-full shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Continue Shopping</span>
        </motion.button>

        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-bold mb-8 md:mb-10"
        >
          Shopping Cart
        </motion.h1>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4 md:space-y-6">
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => (
                <motion.div
                  key={item.product.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20, height: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  layout
                  className="bg-white rounded-2xl p-4 md:p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                <div className="flex gap-4 md:gap-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden">
                    <ImageWithFallback
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-base md:text-lg mb-1 line-clamp-2">{item.product.name}</h3>
                        <p className="text-sm text-gray-500">{item.product.category}</p>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-gray-400 hover:text-red-500 transition-colors ml-2"
                      >
                        <Trash2 className="w-5 h-5" />
                      </motion.button>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center border rounded-full">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 md:h-9 md:w-9"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="w-10 md:w-12 text-center text-sm">{item.quantity}</span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-8 w-8 md:h-9 md:w-9"
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg md:text-xl font-semibold ${
                          item.product.store === 'healthcare' ? 'text-healthcare' : 'text-electronics'
                        }`}>
                          R{(item.product.price * item.quantity).toFixed(2)}
                        </div>
                        <div className="text-xs text-gray-500">Incl. VAT</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 md:p-8 shadow-sm sticky top-24"
            >
              <h3 className="text-xl mb-6">Order Summary</h3>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal (Excl. VAT)</span>
                  <span>R{subtotalExclVAT.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>VAT (15%)</span>
                  <span>R{vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal (Incl. VAT)</span>
                  <span className="font-semibold">R{subtotalInclVAT.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `R${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-4 flex justify-between text-xl font-semibold">
                  <span>Total</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">R{total.toFixed(2)}</span>
                </div>
              </div>

              {subtotalInclVAT < 1000 && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-sm text-green-800"
                >
                  Add R{(1000 - subtotalInclVAT).toFixed(2)} more for free shipping
                </motion.div>
              )}

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl h-12 md:h-14 mb-3 shadow-xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-shadow"
                  onClick={onCheckout}
                >
                  Proceed to Checkout
                </Button>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  variant="outline"
                  className="w-full rounded-2xl h-10"
                  onClick={onContinueShopping}
                >
                  Continue Shopping
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
