import { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Mail, Save, Edit2, Package, Settings, LogOut, CreditCard, Heart, MapPin, Calendar, ShoppingCart, ExternalLink, Eye } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useAuth } from '../lib/auth-context';
import { supabase } from '../lib/supabase';
import { Product } from './ProductCard';

interface ProfilePageProps {
  onBack: () => void;
  onViewProduct?: (product: Product) => void;
  onAddToCart?: (product: Product, quantity: number) => void;
}

export function ProfilePage({ onBack, onViewProduct, onAddToCart }: ProfilePageProps) {
  const { user, customer, signIn, signUp, signOut, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [wishlist, setWishlist] = useState<any[]>([]);
  
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    if (customer) {
      setFormData({
        firstName: customer.first_name || '',
        lastName: customer.last_name || '',
        email: customer.email || '',
        phone: customer.phone || '',
      });
      
      loadOrders();
      loadWishlist();
    }
  }, [customer]);

  const loadOrders = async () => {
    if (!customer?.id) return;
    try {
      const { data, error } = await supabase
        .from('order')
        .select('*')
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const loadWishlist = async () => {
    try {
      const { getWishlist } = await import('../lib/wishlist');
      const data = await getWishlist();
      setWishlist(data || []);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  };

  const handleRemoveFromWishlist = async (productId: string) => {
    try {
      const { removeFromWishlist } = await import('../lib/wishlist');
      await removeFromWishlist(productId);
      loadWishlist(); // Reload wishlist
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(authData.email, authData.password, authData.firstName, authData.lastName);
        toast.success('Account created successfully!');
      } else {
        await signIn(authData.email, authData.password);
        toast.success('Logged in successfully!');
      }
      setAuthData({ email: '', password: '', firstName: '', lastName: '' });
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateProfile({
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
      });
      setIsEditing(false);
      toast.success('Profile updated successfully!');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    }
  };

  const handleLogout = async () => {
    await signOut();
    toast.info('Logged out successfully');
    onBack();
  };

  if (!user) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8">
          <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="text-gray-600 mt-2">{isSignUp ? 'Sign up to get started' : 'Sign in to your account'}</p>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={authData.firstName}
                    onChange={(e) => setAuthData({ ...authData, firstName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={authData.lastName}
                    onChange={(e) => setAuthData({ ...authData, lastName: e.target.value })}
                    required
                  />
                </div>
              </>
            )}
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={authData.email}
                onChange={(e) => setAuthData({ ...authData, email: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder=""
                value={authData.password}
                onChange={(e) => setAuthData({ ...authData, password: e.target.value })}
                required
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-purple-600 hover:text-purple-700 font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 via-purple-50/30 to-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-8 transition-colors group bg-white px-4 py-2 rounded-full shadow-sm">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>

        {/* Profile Header */}
        <Card className="p-8 mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-0 shadow-xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="w-24 h-24 border-4 border-white/20">
              <AvatarFallback className="bg-white/20 text-white text-2xl font-bold backdrop-blur-sm">
                {formData.firstName.charAt(0) || 'U'}{formData.lastName.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-bold">{formData.firstName || 'User'} {formData.lastName}</h2>
              <p className="text-purple-100 mt-1 flex items-center gap-2 justify-center md:justify-start">
                <Mail className="w-4 h-4" />
                {formData.email || customer?.email || 'No email'}
              </p>
              {formData.phone && (
                <p className="text-purple-100 mt-1 flex items-center gap-2 justify-center md:justify-start">
                  <Phone className="w-4 h-4" />
                  {formData.phone}
                </p>
              )}
            </div>
            <Button 
              onClick={handleLogout} 
              variant="outline" 
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white backdrop-blur-sm"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </Card>

        <Tabs defaultValue="wishlist" className="space-y-6">
          <TabsList className="bg-white shadow-sm border border-gray-200">
            <TabsTrigger value="wishlist" className="flex items-center gap-2">
              <Heart className="w-4 h-4" />
              Wishlist
              {wishlist.length > 0 && (
                <Badge className="ml-1 bg-pink-100 text-pink-700 hover:bg-pink-100">
                  {wishlist.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Orders
              {orders.length > 0 && (
                <Badge className="ml-1 bg-purple-100 text-purple-700 hover:bg-purple-100">
                  {orders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Wishlist Tab */}
          <TabsContent value="wishlist" className="space-y-6">
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">My Wishlist</h3>
                  <p className="text-sm text-gray-500 mt-1">Products you've saved for later</p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}
                </Badge>
              </div>

              {wishlist.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="w-12 h-12 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Your wishlist is empty</h4>
                  <p className="text-gray-500 mb-6">Start adding products you love!</p>
                  <Button onClick={onBack} className="bg-purple-600 hover:bg-purple-700">
                    Continue Shopping
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                  {wishlist.map((item) => (
                    <Card key={item.id} className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-300">
                      {/* Product Image - Large and prominent */}
                      <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                        {item.product_thumbnail ? (
                          <img
                            src={item.product_thumbnail}
                            alt={item.product_title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package className="w-16 h-16" />
                          </div>
                        )}
                        
                        {/* Remove button - floating on image */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm hover:bg-red-50 text-red-600 hover:text-red-700 rounded-full p-1.5 shadow-lg"
                          onClick={() => handleRemoveFromWishlist(item.product_id)}
                        >
                          <Heart className="w-4 h-4 fill-current" />
                        </Button>
                      </div>

                      {/* Product Details */}
                      <div className="p-3">
                        <h4 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
                          {item.product_title}
                        </h4>
                        
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-xl font-bold text-purple-600">
                            R{((item.product_price || 0) / 100).toFixed(2)}
                          </span>
                        </div>

                        {/* Action Buttons - Full width stacked */}
                        <div className="space-y-1.5">
                          {onAddToCart && (
                            <Button
                              size="sm"
                              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all text-xs"
                              onClick={() => {
                                const product: Product = {
                                  id: item.product_id,
                                  name: item.product_title,
                                  price: (item.product_price || 0) / 100,
                                  image: item.product_thumbnail || '',
                                  category: 'General',
                                  rating: 4.5,
                                  store: 'healthcare',
                                  handle: item.product_handle || item.product_id
                                };
                                onAddToCart(product, 1);
                                toast.success('Added to cart!');
                              }}
                            >
                              <ShoppingCart className="w-4 h-4 mr-1" />
                              Add to Cart
                            </Button>
                          )}
                          
                          {onViewProduct && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="w-full border-2 border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold text-xs"
                              onClick={() => {
                                const product: Product = {
                                  id: item.product_id,
                                  name: item.product_title,
                                  price: (item.product_price || 0) / 100,
                                  image: item.product_thumbnail || '',
                                  category: 'General',
                                  rating: 4.5,
                                  store: 'healthcare',
                                  handle: item.product_handle || item.product_id
                                };
                                onViewProduct(product);
                              }}
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            {/* Personal Information Card */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
                  <p className="text-sm text-gray-500 mt-1">Manage your personal details</p>
                </div>
                {!isEditing ? (
                  <Button onClick={() => setIsEditing(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button onClick={handleSave} disabled={loading} className="bg-purple-600 hover:bg-purple-700">
                      <Save className="w-4 h-4 mr-2" />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
                  </div>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">First Name</Label>
                  <Input 
                    id="firstName" 
                    value={formData.firstName} 
                    onChange={(e) => handleInputChange('firstName', e.target.value)} 
                    disabled={!isEditing}
                    className="mt-1.5"
                    placeholder="Enter first name"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">Last Name</Label>
                  <Input 
                    id="lastName" 
                    value={formData.lastName} 
                    onChange={(e) => handleInputChange('lastName', e.target.value)} 
                    disabled={!isEditing}
                    className="mt-1.5"
                    placeholder="Enter last name"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email Address</Label>
                  <Input 
                    id="email" 
                    value={formData.email} 
                    disabled 
                    className="mt-1.5 bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">Phone Number</Label>
                  <Input 
                    id="phone" 
                    value={formData.phone} 
                    onChange={(e) => handleInputChange('phone', e.target.value)} 
                    disabled={!isEditing}
                    className="mt-1.5"
                    placeholder="Enter phone number"
                  />
                </div>
              </div>
            </Card>

            {/* Account Overview Card */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Overview</h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-6 rounded-xl border-2 border-purple-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Orders</p>
                      <p className="text-3xl font-bold text-purple-600">{orders.length}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">All time purchases</p>
                </div>

                <div className="bg-gradient-to-br from-pink-50 to-red-50 p-6 rounded-xl border-2 border-pink-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-pink-600 rounded-full flex items-center justify-center">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Wishlist Items</p>
                      <p className="text-3xl font-bold text-pink-600">{wishlist.length}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Saved for later</p>
                </div>

                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border-2 border-blue-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-600">Member Since</p>
                      <p className="text-lg font-bold text-blue-600">
                        {customer?.created_at ? new Date(customer.created_at).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600">Customer loyalty</p>
                </div>
              </div>
            </Card>

            {/* Account Details Card */}
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Details</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Email</p>
                      <p className="text-base text-gray-900">{customer?.email || 'N/A'}</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Verified</Badge>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Full Name</p>
                      <p className="text-base text-gray-900">{customer?.first_name} {customer?.last_name}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Phone Number</p>
                      <p className="text-base text-gray-900">{customer?.phone || 'Not provided'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-600">Customer ID</p>
                      <p className="text-base text-gray-900 font-mono text-sm">{customer?.id?.slice(0, 24)}...</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Order History</h3>
                  <p className="text-sm text-gray-500 mt-1">Track your purchases and order status</p>
                </div>
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  {orders.length} {orders.length === 1 ? 'order' : 'orders'}
                </Badge>
              </div>
              
              {orders.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package className="w-12 h-12 text-gray-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">No Orders Yet</h4>
                  <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
                  <Button onClick={onBack} className="bg-purple-600 hover:bg-purple-700">
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orders.map((order) => (
                    <Card key={order.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-2 border-gray-100 hover:border-purple-200">
                      {/* Order Header - More compact and elegant */}
                      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex flex-wrap items-center gap-3 mb-2">
                              <h4 className="text-xl font-bold text-white">
                                Order #{order.display_id || order.id?.slice(0, 8).toUpperCase()}
                              </h4>
                              <Badge className={`text-sm font-semibold ${
                                order.status === 'completed' ? 'bg-green-500 text-white hover:bg-green-600' :
                                order.status === 'pending' ? 'bg-yellow-500 text-white hover:bg-yellow-600' :
                                order.status === 'canceled' ? 'bg-red-500 text-white hover:bg-red-600' :
                                'bg-blue-500 text-white hover:bg-blue-600'
                              }`}>
                                {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : 'Pending'}
                              </Badge>
                            </div>
                            <p className="text-purple-100 flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : 'Unknown date'}
                            </p>
                          </div>
                          <div className="text-left md:text-right">
                            <p className="text-purple-200 text-sm mb-1">Total Amount</p>
                            <p className="text-4xl font-bold text-white">
                              R{((order.total || 0) / 100).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Order Items - Card Grid Layout */}
                      {order.items && order.items.length > 0 ? (
                        <div className="p-6 bg-gray-50">
                          <h5 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-lg">
                            <Package className="w-5 h-5 text-purple-600" />
                            Items in this order
                          </h5>
                          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                            {order.items.map((item: any, idx: number) => (
                              <Card key={idx} className="group overflow-hidden hover:shadow-lg transition-all duration-300 bg-white border-2 border-gray-100 hover:border-purple-200">
                                {/* Product Image */}
                                <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
                                  {item.thumbnail ? (
                                    <img
                                      src={item.thumbnail}
                                      alt={item.title || item.product_title}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                      <Package className="w-12 h-12" />
                                    </div>
                                  )}
                                  
                                  {/* Quantity badge */}
                                  <div className="absolute top-2 right-2 bg-purple-600 text-white rounded-full px-2 py-0.5 text-xs font-bold shadow-lg">
                                    Qty: {item.quantity || 1}
                                  </div>
                                </div>

                                {/* Product Details */}
                                <div className="p-3">
                                  <h6 className="font-bold text-sm text-gray-900 mb-2 line-clamp-2 min-h-[40px]">
                                    {item.title || item.product_title || 'Product'}
                                  </h6>
                                  
                                  <div className="flex items-baseline gap-1 mb-3">
                                    <span className="text-lg font-bold text-purple-600">
                                      R{(((item.unit_price || 0) * (item.quantity || 1)) / 100).toFixed(2)}
                                    </span>
                                  </div>

                                  {/* Action Buttons */}
                                  <div className="grid grid-cols-2 gap-1.5">
                                    {onViewProduct && item.product_id && (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="border-2 border-purple-200 text-purple-700 hover:bg-purple-50 font-semibold text-xs p-2"
                                        onClick={() => {
                                          const product: Product = {
                                            id: item.product_id,
                                            name: item.title || item.product_title,
                                            price: (item.unit_price || 0) / 100,
                                            image: item.thumbnail || '',
                                            category: 'General',
                                            rating: 4.5,
                                            store: 'healthcare',
                                            handle: item.product_id
                                          };
                                          onViewProduct(product);
                                        }}
                                      >
                                        <Eye className="w-3.5 h-3.5" />
                                      </Button>
                                    )}
                                    {onAddToCart && item.product_id && (
                                      <Button
                                        size="sm"
                                        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold shadow-md hover:shadow-lg transition-all text-xs p-2"
                                        onClick={() => {
                                          const product: Product = {
                                            id: item.product_id,
                                            name: item.title || item.product_title,
                                            price: (item.unit_price || 0) / 100,
                                            image: item.thumbnail || '',
                                            category: 'General',
                                            rating: 4.5,
                                            store: 'healthcare',
                                            handle: item.product_id
                                          };
                                          onAddToCart(product, 1);
                                          toast.success('Added to cart!');
                                        }}
                                      >
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="p-8 text-center text-gray-500 bg-gray-50">
                          <Package className="w-16 h-16 mx-auto mb-3 text-gray-300" />
                          <p className="text-lg">No items found in this order</p>
                        </div>
                      )}

                      {/* Order Footer - Cleaner info bar */}
                      {(order.shipping_address || order.payment_status) && (
                        <div className="bg-white border-t-2 border-gray-100 p-4">
                          <div className="flex flex-wrap gap-6 text-sm text-gray-600">
                            {order.shipping_address && (
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-purple-600" />
                                <span className="font-medium">{order.shipping_address.city || 'Address on file'}</span>
                              </div>
                            )}
                            {order.payment_status && (
                              <div className="flex items-center gap-2">
                                <CreditCard className="w-4 h-4 text-purple-600" />
                                <span className="font-medium">Payment: {order.payment_status}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-2 ml-auto">
                              <Package className="w-4 h-4 text-purple-600" />
                              <span className="font-bold text-purple-600">{order.items?.length || 0} items</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Account Information</h4>
                  <p className="text-sm text-gray-500 mb-4">Your account email and ID</p>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Email:</span>
                      <span className="text-sm text-gray-900">{formData.email || customer?.email || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Customer ID:</span>
                      <span className="text-sm text-gray-900 font-mono">{customer?.id?.slice(0, 20) || 'Loading...'}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium text-gray-600">Member Since:</span>
                      <span className="text-sm text-gray-900">
                        {customer?.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Preferences</h4>
                  <p className="text-sm text-gray-500 mb-4">Manage your shopping preferences</p>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Feature coming soon!')}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Payment Methods
                    </Button>
                    <Button variant="outline" className="w-full justify-start" onClick={() => toast.info('Feature coming soon!')}>
                      <Settings className="w-4 h-4 mr-2" />
                      Notification Preferences
                    </Button>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="text-lg font-semibold text-red-600 mb-2">Danger Zone</h4>
                  <p className="text-sm text-gray-500 mb-4">Irreversible account actions</p>
                  <Button 
                    variant="destructive" 
                    className="w-full"
                    onClick={() => toast.error('Account deletion is not yet implemented')}
                  >
                    Delete Account
                  </Button>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
