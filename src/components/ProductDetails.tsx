import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Heart, Star, Minus, Plus, TruckIcon, ShieldCheck, RotateCcw, Share2 } from 'lucide-react';
import { Product } from './ProductCard';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner';

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onBack: () => void;
}

export function ProductDetails({ product, onAddToCart, onBack }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  const images = [product.image, product.image, product.image, product.image];
  const themeColor = product.store === 'healthcare' ? 'cyan' : 'purple';
  const priceWithVAT = product.price;
  const priceExclVAT = product.price / 1.15;
  const totalPrice = priceWithVAT * quantity;
  const vatAmount = totalPrice - (totalPrice / 1.15);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-10">
        {/* Back Button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to {product.store === 'healthcare' ? 'Health & Wellness' : 'Electronics'}</span>
        </button>

        {/* Product Content */}
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 mb-12">
          {/* Images Section */}
          <div className="space-y-4">
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="aspect-square bg-white rounded-3xl overflow-hidden shadow-lg relative group"
            >
              <ImageWithFallback
                src={images[selectedImage]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              
              {/* Floating Actions */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="icon"
                  className="bg-white hover:bg-gray-100 text-gray-900 rounded-full shadow-lg"
                  onClick={() => {
                    setIsWishlisted(!isWishlisted);
                    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
                  }}
                >
                  <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} />
                </Button>
                <Button
                  size="icon"
                  className="bg-white hover:bg-gray-100 text-gray-900 rounded-full shadow-lg"
                  onClick={() => toast.success('Link copied!')}
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>

              {/* Rating Badge */}
              <div className={`absolute bottom-4 left-4 bg-${themeColor}-600 text-white px-4 py-2 rounded-full flex items-center gap-2 shadow-lg`}>
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold">{product.rating}</span>
              </div>
            </motion.div>
            
            {/* Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`aspect-square rounded-2xl overflow-hidden transition-all ${
                    selectedImage === idx 
                      ? `ring-4 ring-${themeColor}-600 scale-95` 
                      : 'opacity-60 hover:opacity-100 bg-white shadow-sm'
                  }`}
                >
                  <ImageWithFallback
                    src={img}
                    alt={`${product.name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            {/* Category Badge */}
            <div className="flex items-center gap-3">
              <Badge className={`bg-${themeColor}-100 text-${themeColor}-700 hover:bg-${themeColor}-200 px-4 py-1.5 text-sm`}>
                {product.category}
              </Badge>
              <Badge variant="outline" className="px-4 py-1.5 text-sm">
                {product.store === 'healthcare' ? '🌿 Health' : '⚡ Tech'}
              </Badge>
            </div>
            
            {/* Product Name */}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">{product.name}</h1>
            
            {/* Rating */}
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating)
                        ? `fill-amber-400 text-amber-400`
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm font-medium text-gray-600">
                ({product.rating} rating • 127 reviews)
              </span>
            </div>

            <Separator />

            {/* Price Box */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 space-y-3">
              <div className={`text-5xl font-bold text-${themeColor}-600`}>
                R{totalPrice.toFixed(2)}
              </div>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Price (Excl. VAT):</span>
                  <span className="font-medium">R{(totalPrice / 1.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT (15%):</span>
                  <span className="font-medium">R{vatAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 leading-relaxed text-lg">
              {product.store === 'healthcare' 
                ? 'Premium quality health and wellness product designed to support your healthy lifestyle. Made with natural ingredients and backed by research.'
                : 'Cutting-edge technology with premium features. Experience innovation and reliability with this top-rated electronic device.'}
            </p>

            {/* Quantity Selector */}
            <div className="space-y-3">
              <label className="text-sm font-bold text-gray-900">Quantity</label>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-white border-2 border-gray-200 rounded-2xl shadow-sm">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="rounded-2xl h-14 w-14 hover:bg-gray-100"
                  >
                    <Minus className="w-5 h-5" />
                  </Button>
                  <div className="w-20 text-center text-xl font-bold">{quantity}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                    className="rounded-2xl h-14 w-14 hover:bg-gray-100"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </div>
                <div className="text-sm text-gray-600">
                  <div>Only <span className="font-bold text-gray-900">12 items</span> left in stock</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                size="lg"
                className={`flex-1 ${themeColor === 'cyan' ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-2xl h-16 text-lg shadow-xl shadow-${themeColor}-500/40`}
                onClick={() => {
                  onAddToCart(product, quantity);
                  toast.success(`Added ${quantity} item(s) to cart`);
                }}
              >
                <ShoppingCart className="w-6 h-6 mr-2" />
                Add to Cart
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className={`rounded-2xl h-16 px-6 border-2 ${isWishlisted ? `border-${themeColor}-600 bg-${themeColor}-50` : 'border-gray-300'}`}
                onClick={() => {
                  setIsWishlisted(!isWishlisted);
                  toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
                }}
              >
                <Heart className={`w-6 h-6 ${isWishlisted ? `fill-${themeColor}-600 text-${themeColor}-600` : ''}`} />
              </Button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4 pt-6">
              {[
                { icon: TruckIcon, text: 'Free Shipping Over R1000' },
                { icon: ShieldCheck, text: 'Secure Payment' },
                { icon: RotateCcw, text: '30-Day Returns' }
              ].map((feature, idx) => (
                <div key={idx} className="flex flex-col items-center text-center gap-2 p-4 bg-white rounded-2xl shadow-sm">
                  <feature.icon className={`w-6 h-6 text-${themeColor}-600`} />
                  <span className="text-xs text-gray-600 leading-tight">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-lg">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent mb-8">
              <TabsTrigger 
                value="description"
                className={`text-lg rounded-none border-b-4 border-transparent data-[state=active]:border-${themeColor}-600 data-[state=active]:bg-transparent px-8 py-4`}
              >
                Description
              </TabsTrigger>
              <TabsTrigger 
                value="specifications"
                className={`text-lg rounded-none border-b-4 border-transparent data-[state=active]:border-${themeColor}-600 data-[state=active]:bg-transparent px-8 py-4`}
              >
                Specifications
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className={`text-lg rounded-none border-b-4 border-transparent data-[state=active]:border-${themeColor}-600 data-[state=active]:bg-transparent px-8 py-4`}
              >
                Reviews (127)
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="description" className="py-6">
              <div className="max-w-4xl space-y-6">
                <h3 className="text-2xl font-bold">About This Product</h3>
                <p className="text-gray-600 leading-relaxed text-lg">
                  {product.store === 'healthcare'
                    ? 'This premium health care product is carefully formulated to provide maximum benefits for your wellness journey. Our products undergo rigorous testing and quality control to ensure you receive only the best. Each ingredient is selected for its proven efficacy and safety.'
                    : 'Experience the future of technology with this cutting-edge electronic device. Featuring state-of-the-art components and innovative design, this product delivers exceptional performance and reliability. Built to last and designed to impress.'}
                </p>
                
                <div className="grid md:grid-cols-2 gap-6 pt-4">
                  <div className="space-y-3">
                    <h4 className="font-bold text-lg">Key Features</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className={`text-${themeColor}-600 mt-1`}>✓</span>
                        <span>Premium quality materials</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`text-${themeColor}-600 mt-1`}>✓</span>
                        <span>Scientifically tested and proven</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`text-${themeColor}-600 mt-1`}>✓</span>
                        <span>Made with care and precision</span>
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-bold text-lg">Benefits</h4>
                    <ul className="space-y-2 text-gray-600">
                      <li className="flex items-start gap-2">
                        <span className={`text-${themeColor}-600 mt-1`}>✓</span>
                        <span>Enhances daily wellness</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`text-${themeColor}-600 mt-1`}>✓</span>
                        <span>Long-lasting results</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className={`text-${themeColor}-600 mt-1`}>✓</span>
                        <span>Safe for daily use</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="specifications" className="py-6">
              <div className="max-w-4xl">
                <h3 className="text-2xl font-bold mb-6">Product Details</h3>
                <div className="space-y-4">
                  {[
                    { label: 'Product ID', value: `ZAB-${product.id}` },
                    { label: 'Category', value: product.category },
                    { label: 'Type', value: product.store === 'healthcare' ? 'Health & Wellness' : 'Electronics' },
                    { label: 'Rating', value: `${product.rating}/5.0` },
                    { label: 'Availability', value: 'In Stock' },
                    { label: 'Price (Incl. VAT)', value: `R${priceWithVAT.toFixed(2)}` },
                    { label: 'Price (Excl. VAT)', value: `R${priceExclVAT.toFixed(2)}` },
                    { label: 'VAT (15%)', value: `R${(priceWithVAT - priceExclVAT).toFixed(2)}` },
                    { label: 'Shipping', value: 'Free on orders over R1000' }
                  ].map((spec, idx) => (
                    <div key={idx} className="flex py-4 border-b last:border-b-0">
                      <div className="w-1/3 font-bold text-gray-900">{spec.label}</div>
                      <div className="flex-1 text-gray-600">{spec.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="reviews" className="py-6">
              <div className="max-w-4xl space-y-8">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-2xl font-bold mb-2">Customer Reviews</h3>
                    <p className="text-gray-600">Based on 127 reviews</p>
                  </div>
                  <Button className={`bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white rounded-xl`}>
                    Write a Review
                  </Button>
                </div>

                <div className="space-y-6">
                  {[
                    { name: 'Sarah Mitchell', avatar: 'S', rating: 5, text: 'Absolutely love this product! Quality is outstanding and delivery was super fast. Highly recommend to anyone looking for premium products.', date: '2 days ago', verified: true },
                    { name: 'John Peterson', avatar: 'J', rating: 5, text: 'Great value for money. Works exactly as described. Very satisfied with my purchase and will definitely buy again!', date: '1 week ago', verified: true },
                    { name: 'Emily Rodriguez', avatar: 'E', rating: 4, text: 'Good product overall. Shipping was quick and packaging was excellent. Only minor issue was the size, but otherwise very happy!', date: '2 weeks ago', verified: true }
                  ].map((review, idx) => (
                    <div key={idx} className="bg-gray-50 rounded-2xl p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 ${themeColor === 'cyan' ? 'bg-cyan-600' : 'bg-purple-600'} text-white rounded-full flex items-center justify-center font-bold text-xl`}>
                            {review.avatar}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-bold text-lg">{review.name}</div>
                              {review.verified && (
                                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                                  ✓ Verified
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                ))}
                              </div>
                              <span className="text-sm text-gray-500">{review.date}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <p className="text-gray-700 leading-relaxed">{review.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
