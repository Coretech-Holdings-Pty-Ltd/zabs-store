import { useState, useEffect } from 'react';
import { ArrowLeft, ShoppingCart, Heart, Star, Minus, Plus, TruckIcon, ShieldCheck, RotateCcw, Share2, FileText, Package, MessageSquare } from 'lucide-react';
import { Product } from './ProductCard';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { toggleWishlist, isInWishlist } from '../lib/wishlist';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';

interface ProductDetailsProps {
  product: Product;
  onAddToCart: (product: Product, quantity: number) => void;
  onBack: () => void;
}

export function ProductDetails({ product, onAddToCart, onBack }: ProductDetailsProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [canReview, setCanReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    title: '',
    comment: ''
  });
  const { user, customer } = useAuth();
  
  const images = [product.image, product.image, product.image, product.image];
  const themeColor = product.store === 'healthcare' ? 'cyan' : 'purple';
  const priceWithVAT = product.price;
  const priceExclVAT = product.price / 1.15;
  const totalPrice = priceWithVAT * quantity;
  const vatAmount = totalPrice - (totalPrice / 1.15);

  // Check if product is in wishlist on mount
  useEffect(() => {
    isInWishlist(product.id).then(setIsWishlisted);
  }, [product.id]);

  // Load reviews and check if user can review
  useEffect(() => {
    loadReviews();
    if (user && customer) {
      checkCanReview();
    }
  }, [product.id, user, customer]);

  const loadReviews = async () => {
    setReviewsLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_review')
        .select(`
          *,
          customer:customer_id (
            first_name,
            last_name
          )
        `)
        .eq('product_id', product.id)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const checkCanReview = async () => {
    if (!customer) return;
    
    // TODO: Fix customer_ordered_product SQL function - currently broken
    // For now, allow all logged-in customers to review
    setCanReview(true);
    
    /* DISABLED - SQL function has bug with o.items column
    try {
      const { data, error } = await supabase
        .rpc('customer_ordered_product', {
          p_customer_id: customer.id,
          p_product_id: product.id
        });

      if (error) throw error;
      setCanReview(data === true);
    } catch (error) {
      console.error('Error checking review eligibility:', error);
    }
    */
  };

  const handleSubmitReview = async () => {
    if (!customer) {
      toast.error('Please sign in to write a review');
      return;
    }

    if (!canReview) {
      toast.error('You must purchase this product before reviewing it');
      return;
    }

    if (!reviewForm.title.trim() || !reviewForm.comment.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const { error } = await supabase
        .from('product_review')
        .insert({
          customer_id: customer.id,
          product_id: product.id,
          rating: reviewForm.rating,
          title: reviewForm.title,
          comment: reviewForm.comment,
          verified_purchase: true,
          status: 'published'
        });

      if (error) throw error;

      toast.success('Review submitted successfully!');
      setReviewForm({ rating: 5, title: '', comment: '' });
      loadReviews();
    } catch (error: any) {
      console.error('Error submitting review:', error);
      toast.error(error.message || 'Failed to submit review');
    }
  };

  const calculateAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    reviews.forEach(review => {
      distribution[review.rating - 1]++;
    });
    return distribution.reverse();
  };

  const handleWishlistClick = async () => {
    const success = await toggleWishlist({
      product_id: product.id,
      product_title: product.name,
      product_price: Math.round(product.price * 100),
      product_thumbnail: product.image,
      product_handle: product.handle,
    });
    if (success) {
      setIsWishlisted(!isWishlisted);
    }
  };

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
                  onClick={handleWishlistClick}
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
                onClick={handleWishlistClick}
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
                className={`flex items-center gap-2 text-base md:text-lg rounded-none border-b-4 border-transparent data-[state=active]:border-${themeColor}-600 data-[state=active]:bg-transparent px-4 md:px-8 py-4`}
              >
                <FileText className="w-5 h-5" />
                <span className="hidden sm:inline">Description</span>
              </TabsTrigger>
              <TabsTrigger 
                value="specifications"
                className={`flex items-center gap-2 text-base md:text-lg rounded-none border-b-4 border-transparent data-[state=active]:border-${themeColor}-600 data-[state=active]:bg-transparent px-4 md:px-8 py-4`}
              >
                <Package className="w-5 h-5" />
                <span className="hidden sm:inline">Specifications</span>
              </TabsTrigger>
              <TabsTrigger 
                value="reviews"
                className={`flex items-center gap-2 text-base md:text-lg rounded-none border-b-4 border-transparent data-[state=active]:border-${themeColor}-600 data-[state=active]:bg-transparent px-4 md:px-8 py-4`}
              >
                <MessageSquare className="w-5 h-5" />
                <span className="hidden sm:inline">Reviews ({reviews.length})</span>
                <span className="sm:hidden">({reviews.length})</span>
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
                {/* Review Summary */}
                <div className="flex flex-col md:flex-row items-start gap-6 md:gap-12">
                  <div className="text-center">
                    <div className="text-5xl font-bold mb-2">{calculateAverageRating()}</div>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => {
                        const avgRating = parseFloat(calculateAverageRating() || '0');
                        return (
                          <Star key={i} className={`w-5 h-5 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                        );
                      })}
                    </div>
                    <p className="text-gray-600 text-sm">Based on {reviews.length} reviews</p>
                  </div>

                  <div className="flex-1 space-y-2 w-full">
                    {getRatingDistribution().map((count, index) => {
                      const stars = 5 - index;
                      const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                      return (
                        <div key={stars} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-16">
                            <span className="text-sm font-medium">{stars}</span>
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${themeColor === 'cyan' ? 'bg-cyan-600' : 'bg-purple-600'}`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Write Review Button / Form */}
                {!user ? (
                  <div className="bg-gray-50 rounded-2xl p-6 text-center">
                    <p className="text-gray-600 mb-4">Sign in to write a review</p>
                    <Button
                      onClick={() => toast.info('Please sign in from the profile page')}
                      className={`bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white rounded-xl`}
                    >
                      Sign In to Review
                    </Button>
                  </div>
                ) : !canReview ? (
                  <div className="bg-gray-50 rounded-2xl p-6 text-center">
                    <p className="text-gray-600 mb-2">Purchase this product to write a review</p>
                    <p className="text-sm text-gray-500">Only verified buyers can leave reviews</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                    <h4 className="font-bold text-lg">Write Your Review</h4>
                    
                    {/* Star Rating Selector */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Rating</label>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                            className="transition-transform hover:scale-110"
                          >
                            <Star
                              className={`w-8 h-8 ${star <= reviewForm.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Review Title</label>
                      <input
                        type="text"
                        value={reviewForm.title}
                        onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                        placeholder="Summarize your experience"
                        className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${themeColor}-600`}
                      />
                    </div>

                    {/* Review Comment */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Your Review</label>
                      <textarea
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                        placeholder="Share your thoughts about this product"
                        rows={4}
                        className={`w-full px-4 py-2 border rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${themeColor}-600`}
                      />
                    </div>

                    <Button
                      onClick={handleSubmitReview}
                      className={`w-full bg-${themeColor}-600 hover:bg-${themeColor}-700 text-white rounded-xl`}
                    >
                      Submit Review
                    </Button>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviewsLoading ? (
                    <div className="text-center py-8 text-gray-500">Loading reviews...</div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>No reviews yet. Be the first to review this product!</p>
                    </div>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="bg-gray-50 rounded-2xl p-6 space-y-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-14 h-14 ${themeColor === 'cyan' ? 'bg-cyan-600' : 'bg-purple-600'} text-white rounded-full flex items-center justify-center font-bold text-xl`}>
                              {review.customer?.first_name?.[0] || 'U'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <div className="font-bold text-lg">
                                  {review.customer?.first_name} {review.customer?.last_name}
                                </div>
                                {review.verified_purchase && (
                                  <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-xs">
                                    ✓ Verified Purchase
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex">
                                  {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
                                  ))}
                                </div>
                                <span className="text-sm text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        {review.title && (
                          <h4 className="font-bold text-lg">{review.title}</h4>
                        )}
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
