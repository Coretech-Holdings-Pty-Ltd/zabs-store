import { useState, useEffect } from 'react';
import { ArrowLeft, CreditCard, Truck, CheckCircle, AlertCircle, Edit2, Store, Banknote, Building2, User, Mail, Lock } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CartItem } from './Cart';
import { toast } from 'sonner';
import { Alert, AlertDescription } from './ui/alert';
import { Card } from './ui/card';
import { motion } from 'motion/react';
import { useAuth } from '../lib/auth-context';

interface CheckoutProps {
  items: CartItem[];
  total: number;
  onBack: () => void;
  onComplete: () => void;
}

export function Checkout({ items, total, onBack, onComplete }: CheckoutProps) {
  const { user, customer, signUp, signIn, loading: authLoading } = useAuth();
  const [step, setStep] = useState(0); // Start at 0 for auth step
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [paymentMethod, setPaymentMethod] = useState<'payfast' | 'ozow' | 'store'>('payfast');
  const [deliveryMethod, setDeliveryMethod] = useState<'delivery' | 'pickup'>('delivery');
  const [isProcessing, setIsProcessing] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  
  const [authData, setAuthData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  });
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
    phone: '',
    storeLocation: 'johannesburg',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: ''
  });

  // Auto-fill form data from customer profile
  useEffect(() => {
    if (customer && user) {
      setFormData(prev => ({
        ...prev,
        email: customer.email || user.email || '',
        firstName: customer.first_name || '',
        lastName: customer.last_name || '',
        phone: customer.phone || '',
        // Address will be fetched from previous orders if available
      }));
      // Skip auth step if already logged in
      if (step === 0) {
        setStep(1);
      }
    }
  }, [customer, user]);

  // If user is already logged in, skip auth step
  useEffect(() => {
    if (user && step === 0) {
      setStep(1);
    }
  }, [user]);

  const storeLocations = [
    { value: 'johannesburg', label: 'Johannesburg - Sandton City' },
    { value: 'cape-town', label: 'Cape Town - V&A Waterfront' },
    { value: 'durban', label: 'Durban - Gateway' },
    { value: 'pretoria', label: 'Pretoria - Menlyn Park' },
  ];

  const subtotalInclVAT = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const subtotalExclVAT = subtotalInclVAT / 1.15;
  const vat = subtotalInclVAT - subtotalExclVAT;
  const shipping = deliveryMethod === 'delivery' ? (subtotalInclVAT > 1000 ? 0 : 100) : 0;
  const finalTotal = subtotalInclVAT + shipping;

    const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAuthInputChange = (field: string, value: string) => {
    setAuthData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateAuth = () => {
    const newErrors: Record<string, string> = {};
    
    if (!authData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(authData.email)) newErrors.email = 'Invalid email format';
    
    if (!authData.password) newErrors.password = 'Password is required';
    else if (authData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (authMode === 'signup') {
      if (!authData.firstName) newErrors.firstName = 'First name is required';
      if (!authData.lastName) newErrors.lastName = 'Last name is required';
      if (!authData.confirmPassword) newErrors.confirmPassword = 'Please confirm password';
      else if (authData.password !== authData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async () => {
    if (!validateAuth()) {
      toast.error('Please fill in all required fields correctly');
      return;
    }

    setIsAuthenticating(true);
    try {
      if (authMode === 'login') {
        await signIn(authData.email, authData.password);
        toast.success('Welcome back!');
        setStep(1);
      } else {
        await signUp(authData.email, authData.password, authData.firstName, authData.lastName);
        toast.success('Account created! Welcome!');
        setStep(1);
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const continueAsGuest = () => {
    // Save cart items to localStorage for guest users
    localStorage.setItem('guestCart', JSON.stringify(items));
    toast.info('Continuing as guest. Create an account later to track your orders!');
    setStep(1);
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    
    // Only validate address for delivery
    if (deliveryMethod === 'delivery') {
      if (!formData.address) newErrors.address = 'Address is required';
      if (!formData.city) newErrors.city = 'City is required';
      if (!formData.province) newErrors.province = 'Province is required';
      if (!formData.zipCode) newErrors.zipCode = 'Postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    // No validation needed for PayFast, Ozow, or Store payment
    // They handle their own payment flows
    return true;
  };

  const handleNext = () => {
    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
        setEditingStep(null);
      } else {
        toast.error('Please fill in all required fields correctly');
      }
    } else if (step === 2) {
      if (validateStep2()) {
        setStep(3);
        setEditingStep(null);
      } else {
        toast.error('Please select a payment method');
      }
    }
  };

  const handleEditStep = (stepNum: number) => {
    setStep(stepNum);
    setEditingStep(stepNum);
  };

  const initializePayFast = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/store/payfast/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(finalTotal * 100),
          order_id: `ORDER-${Date.now()}`,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_email: formData.email,
          customer_phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (data.payment_url && data.payment_data) {
        // Create a form and submit to PayFast
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.payment_url;

        Object.entries(data.payment_data).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      }
    } catch (error) {
      toast.error('Failed to initialize PayFast payment');
      setIsProcessing(false);
    }
  };

  const initializeOzow = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_MEDUSA_BACKEND_URL}/store/ozow/init`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(finalTotal * 100),
          order_id: `ORDER-${Date.now()}`,
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_email: formData.email,
          customer_phone: formData.phone,
        }),
      });

      const data = await response.json();

      if (data.payment_url) {
        window.location.href = data.payment_url;
      }
    } catch (error) {
      toast.error('Failed to initialize Ozow payment');
      setIsProcessing(false);
    }
  };

  const createManualOrder = async () => {
    setIsProcessing(true);
    // Simulate order creation
    setTimeout(() => {
      toast.success('Order created! Please pay at the store when collecting.');
      onComplete();
    }, 1000);
  };

  const handleSubmit = () => {
    if (!validateStep1()) {
      toast.error('Please review your information');
      setStep(1);
      return;
    }

    if (paymentMethod === 'payfast') {
      initializePayFast();
    } else if (paymentMethod === 'ozow') {
      initializeOzow();
    } else if (paymentMethod === 'store') {
      createManualOrder();
    }
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || '';
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  const steps = [
    { number: 0, title: 'Account', icon: User },
    { number: 1, title: 'Delivery', icon: deliveryMethod === 'delivery' ? Truck : Store },
    { number: 2, title: 'Payment', icon: CreditCard },
    { number: 3, title: 'Review', icon: CheckCircle }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-6 md:py-10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-6 md:mb-8 transition-colors bg-white px-4 py-2 rounded-full shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Cart</span>
        </button>

        <h1 className="text-3xl md:text-4xl font-bold mb-8 md:mb-10">Checkout</h1>

        {/* Progress - Mobile Optimized */}
        <div className="flex items-center justify-center mb-8 md:mb-12 lg:mb-16 overflow-x-auto px-2">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 rounded-full flex items-center justify-center mb-1 md:mb-2 transition-all duration-300 ${
                  step >= s.number ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30' : 'bg-gray-200 text-gray-400'
                }`}>
                  <s.icon className="w-4 h-4 md:w-5 md:h-5 lg:w-6 lg:h-6" />
                </div>
                <div className={`text-[10px] md:text-xs lg:text-sm whitespace-nowrap ${step >= s.number ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                  {s.title}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-8 md:w-16 lg:w-24 h-0.5 mx-1 md:mx-2 lg:mx-4 mb-6 md:mb-8 transition-all duration-300 ${
                  step > s.number ? 'bg-gradient-to-r from-purple-600 to-indigo-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
          {/* Forms */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm">
              
              {/* Step 0: Authentication */}
              {step === 0 && !user && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                      {authMode === 'login' ? 'Welcome Back!' : 'Create Account'}
                    </h2>
                    <p className="text-gray-600">
                      {authMode === 'login' 
                        ? 'Sign in to access your saved information' 
                        : 'Sign up to track your orders and save your details'}
                    </p>
                  </div>

                  {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please correct the errors below
                      </AlertDescription>
                    </Alert>
                  )}

                  {authMode === 'signup' && (
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="auth-firstName" className="text-sm mb-2 block">First Name *</Label>
                        <Input
                          id="auth-firstName"
                          value={authData.firstName}
                          onChange={(e) => handleAuthInputChange('firstName', e.target.value)}
                          className={`h-11 rounded-lg ${errors.firstName ? 'border-red-500' : ''}`}
                          placeholder="John"
                        />
                        {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                      </div>
                      <div>
                        <Label htmlFor="auth-lastName" className="text-sm mb-2 block">Last Name *</Label>
                        <Input
                          id="auth-lastName"
                          value={authData.lastName}
                          onChange={(e) => handleAuthInputChange('lastName', e.target.value)}
                          className={`h-11 rounded-lg ${errors.lastName ? 'border-red-500' : ''}`}
                          placeholder="Doe"
                        />
                        {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                      </div>
                    </div>
                  )}

                  <div>
                    <Label htmlFor="auth-email" className="text-sm mb-2 block">Email Address *</Label>
                    <Input
                      id="auth-email"
                      type="email"
                      value={authData.email}
                      onChange={(e) => handleAuthInputChange('email', e.target.value)}
                      className={`h-11 rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                      placeholder="you@example.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <Label htmlFor="auth-password" className="text-sm mb-2 block">Password *</Label>
                    <Input
                      id="auth-password"
                      type="password"
                      value={authData.password}
                      onChange={(e) => handleAuthInputChange('password', e.target.value)}
                      className={`h-11 rounded-lg ${errors.password ? 'border-red-500' : ''}`}
                      placeholder="••••••••"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                  </div>

                  {authMode === 'signup' && (
                    <div>
                      <Label htmlFor="auth-confirmPassword" className="text-sm mb-2 block">Confirm Password *</Label>
                      <Input
                        id="auth-confirmPassword"
                        type="password"
                        value={authData.confirmPassword}
                        onChange={(e) => handleAuthInputChange('confirmPassword', e.target.value)}
                        className={`h-11 rounded-lg ${errors.confirmPassword ? 'border-red-500' : ''}`}
                        placeholder="••••••••"
                      />
                      {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleAuth}
                      disabled={isAuthenticating}
                      className="w-full h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-medium shadow-lg shadow-purple-500/30"
                    >
                      {isAuthenticating ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing...
                        </div>
                      ) : (
                        authMode === 'login' ? 'Sign In' : 'Create Account'
                      )}
                    </Button>

                    <Button
                      onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                      variant="ghost"
                      className="w-full h-11"
                    >
                      {authMode === 'login' 
                        ? "Don't have an account? Sign up" 
                        : 'Already have an account? Sign in'}
                    </Button>

                    <div className="relative my-4">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 bg-white text-gray-500">OR</span>
                      </div>
                    </div>

                    <Button
                      onClick={continueAsGuest}
                      variant="outline"
                      className="w-full h-11 rounded-xl"
                    >
                      Continue as Guest
                    </Button>
                  </div>

                  <p className="text-xs text-gray-500 text-center">
                    By continuing, you agree to our Terms of Service and Privacy Policy
                  </p>
                </div>
              )}

              {/* Step 1: Delivery Information */}
              {step === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl md:text-2xl mb-6">Shipping Information</h2>
                  
                  {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please correct the errors below
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Label htmlFor="email" className="text-sm mb-2 block">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="you@example.com"
                      className={`h-11 rounded-lg ${errors.email ? 'border-red-500' : ''}`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="text-sm mb-2 block">First Name *</Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={`h-11 rounded-lg ${errors.firstName ? 'border-red-500' : ''}`}
                      />
                      {errors.firstName && <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm mb-2 block">Last Name *</Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={`h-11 rounded-lg ${errors.lastName ? 'border-red-500' : ''}`}
                      />
                      {errors.lastName && <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm mb-2 block">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      placeholder="+27 82 123 4567"
                      className={`h-11 rounded-lg ${errors.phone ? 'border-red-500' : ''}`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* Delivery Method Selection */}
                  <div>
                    <Label className="text-sm mb-4 block font-semibold text-gray-700">Delivery Method *</Label>
                    <div className="grid gap-4">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDeliveryMethod('delivery')}
                        className="relative cursor-pointer"
                      >
                        <Card className={`relative overflow-hidden transition-all duration-300 border-2 ${
                          deliveryMethod === 'delivery' 
                            ? 'border-purple-500 shadow-lg shadow-purple-500/20 bg-gradient-to-br from-purple-50 to-indigo-50' 
                            : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                        }`}>
                          <div className="flex items-center gap-4 p-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                              deliveryMethod === 'delivery' 
                                ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                                : 'bg-gray-100'
                            }`}>
                              <Truck className={`w-6 h-6 ${deliveryMethod === 'delivery' ? 'text-white' : 'text-gray-600'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">Home Delivery</div>
                              <div className="text-sm text-gray-600">
                                {subtotalInclVAT > 1000 ? (
                                  <span className="text-green-600 font-medium">FREE for orders over R1000 ✓</span>
                                ) : (
                                  'R100 delivery fee'
                                )}
                              </div>
                            </div>
                          </div>
                          {deliveryMethod === 'delivery' && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 -mr-8 -mt-8 rotate-45" />
                          )}
                        </Card>
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDeliveryMethod('pickup')}
                        className="relative cursor-pointer"
                      >
                        <Card className={`relative overflow-hidden transition-all duration-300 border-2 ${
                          deliveryMethod === 'pickup' 
                            ? 'border-teal-500 shadow-lg shadow-teal-500/20 bg-gradient-to-br from-teal-50 to-emerald-50' 
                            : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
                        }`}>
                          <div className="flex items-center gap-4 p-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                              deliveryMethod === 'pickup' 
                                ? 'bg-gradient-to-br from-teal-500 to-emerald-600' 
                                : 'bg-gray-100'
                            }`}>
                              <Store className={`w-6 h-6 ${deliveryMethod === 'pickup' ? 'text-white' : 'text-gray-600'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 flex items-center gap-2">
                                Store Pickup
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">FREE</span>
                              </div>
                              <div className="text-sm text-gray-600">Collect from our store</div>
                            </div>
                          </div>
                          {deliveryMethod === 'pickup' && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 -mr-8 -mt-8 rotate-45" />
                          )}
                        </Card>
                      </motion.div>
                    </div>
                  </div>

                  {/* Store Location (only for pickup) */}
                  {deliveryMethod === 'pickup' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <Label htmlFor="storeLocation" className="text-sm mb-2 block">Select Store Location *</Label>
                      <select
                        id="storeLocation"
                        value={formData.storeLocation}
                        onChange={(e) => handleInputChange('storeLocation', e.target.value)}
                        className="w-full h-11 rounded-lg border border-gray-300 px-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
                      >
                        {storeLocations.map(location => (
                          <option key={location.value} value={location.value}>{location.label}</option>
                        ))}
                      </select>
                    </motion.div>
                  )}

                  {/* Address Fields (only for delivery) */}
                  {deliveryMethod === 'delivery' && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div>
                        <Label htmlFor="address" className="text-sm mb-2 block">Street Address *</Label>
                        <Input
                          id="address"
                          value={formData.address}
                          onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="123 Main St"
                      className={`h-11 rounded-lg ${errors.address ? 'border-red-500' : ''}`}
                    />
                    {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="city" className="text-sm mb-2 block">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={`h-11 rounded-lg ${errors.city ? 'border-red-500' : ''}`}
                      />
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="province" className="text-sm mb-2 block">Province *</Label>
                      <Input
                        id="province"
                        value={formData.province}
                        onChange={(e) => handleInputChange('province', e.target.value)}
                        className={`h-11 rounded-lg ${errors.province ? 'border-red-500' : ''}`}
                      />
                      {errors.province && <p className="text-red-500 text-xs mt-1">{errors.province}</p>}
                    </div>
                    <div>
                      <Label htmlFor="zipCode" className="text-sm mb-2 block">Postal Code *</Label>
                      <Input
                        id="zipCode"
                        value={formData.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        className={`h-11 rounded-lg ${errors.zipCode ? 'border-red-500' : ''}`}
                      />
                      {errors.zipCode && <p className="text-red-500 text-xs mt-1">{errors.zipCode}</p>}
                    </div>
                  </div>
                </motion.div>
              )}

              <div className="flex gap-3 pt-6">
                <Button
                  onClick={onBack}
                  variant="outline"
                  className="flex-1 h-12 rounded-xl font-medium"
                >
                  Back
                </Button>
                <Button
                  onClick={handleNext}
                  className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-medium shadow-lg shadow-purple-500/30"
                >
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl md:text-2xl mb-2 font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Payment Method</h2>
                    <p className="text-gray-600 text-sm">Choose how you'd like to pay for your order</p>
                  </div>

                  {/* Payment Method Selection - Beautiful Cards */}
                  <div>
                    <Label className="text-sm mb-4 block font-semibold text-gray-700">Select Payment Method *</Label>
                    <div className="grid gap-4">
                      
                      {/* PayFast - Primary */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPaymentMethod('payfast')}
                        className="relative cursor-pointer"
                      >
                        <Card className={`relative overflow-hidden transition-all duration-300 border-2 ${
                          paymentMethod === 'payfast' 
                            ? 'border-purple-500 shadow-lg shadow-purple-500/20 bg-gradient-to-br from-purple-50 to-indigo-50' 
                            : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
                        }`}>
                          <div className="flex items-center gap-4 p-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                              paymentMethod === 'payfast' 
                                ? 'bg-gradient-to-br from-purple-500 to-indigo-600' 
                                : 'bg-gray-100'
                            }`}>
                              <Banknote className={`w-6 h-6 ${paymentMethod === 'payfast' ? 'text-white' : 'text-gray-600'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900 flex items-center gap-2">
                                PayFast
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Recommended</span>
                              </div>
                              <div className="text-sm text-gray-600">Bank transfer & cards • Secure SA payment</div>
                            </div>
                          </div>
                          {paymentMethod === 'payfast' && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 -mr-8 -mt-8 rotate-45" />
                          )}
                        </Card>
                      </motion.div>

                      {/* Ozow */}
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setPaymentMethod('ozow')}
                        className="relative cursor-pointer"
                      >
                        <Card className={`relative overflow-hidden transition-all duration-300 border-2 ${
                          paymentMethod === 'ozow' 
                            ? 'border-indigo-500 shadow-lg shadow-indigo-500/20 bg-gradient-to-br from-indigo-50 to-blue-50' 
                            : 'border-gray-200 hover:border-indigo-300 hover:shadow-md'
                        }`}>
                          <div className="flex items-center gap-4 p-5">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                              paymentMethod === 'ozow' 
                                ? 'bg-gradient-to-br from-indigo-500 to-blue-600' 
                                : 'bg-gray-100'
                            }`}>
                              <Building2 className={`w-6 h-6 ${paymentMethod === 'ozow' ? 'text-white' : 'text-gray-600'}`} />
                            </div>
                            <div className="flex-1">
                              <div className="font-semibold text-gray-900">Ozow</div>
                              <div className="text-sm text-gray-600">Instant EFT • Fast & secure</div>
                            </div>
                          </div>
                          {paymentMethod === 'ozow' && (
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 -mr-8 -mt-8 rotate-45" />
                          )}
                        </Card>
                      </motion.div>

                      {/* Pay at Store - ONLY for PICKUP */}
                      {deliveryMethod === 'pickup' && (
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setPaymentMethod('store')}
                          className="relative cursor-pointer"
                        >
                          <Card className={`relative overflow-hidden transition-all duration-300 border-2 ${
                            paymentMethod === 'store' 
                              ? 'border-teal-500 shadow-lg shadow-teal-500/20 bg-gradient-to-br from-teal-50 to-emerald-50' 
                              : 'border-gray-200 hover:border-teal-300 hover:shadow-md'
                          }`}>
                            <div className="flex items-center gap-4 p-5">
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg transition-all ${
                                paymentMethod === 'store' 
                                  ? 'bg-gradient-to-br from-teal-500 to-emerald-600' 
                                  : 'bg-gray-100'
                              }`}>
                                <Store className={`w-6 h-6 ${paymentMethod === 'store' ? 'text-white' : 'text-gray-600'}`} />
                              </div>
                              <div className="flex-1">
                                <div className="font-semibold text-gray-900">Pay at Store</div>
                                <div className="text-sm text-gray-600">Cash or card on collection</div>
                              </div>
                            </div>
                            {paymentMethod === 'store' && (
                              <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 -mr-8 -mt-8 rotate-45" />
                            )}
                          </Card>
                        </motion.div>
                      )}

                    </div>
                  </div>

                  {/* Info based on selected payment */}
                  {paymentMethod === 'payfast' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-purple-50 border border-purple-200 rounded-xl p-4"
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-purple-600" />
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold text-purple-900 mb-1">Secure Payment with PayFast</p>
                          <p className="text-purple-700">You'll be redirected to PayFast to complete your payment securely. Supports all major SA banks and cards.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'ozow' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-indigo-50 border border-indigo-200 rounded-xl p-4"
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <CheckCircle className="w-5 h-5 text-indigo-600" />
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold text-indigo-900 mb-1">Instant EFT with Ozow</p>
                          <p className="text-indigo-700">You'll be redirected to your bank for instant payment. Fast, secure, and no waiting period.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'store' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-teal-50 border border-teal-200 rounded-xl p-4"
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Store className="w-5 h-5 text-teal-600" />
                        </div>
                        <div className="text-sm">
                          <p className="font-semibold text-teal-900 mb-1">Pay When You Collect</p>
                          <p className="text-teal-700">You can pay with cash or card when you pick up your order at our store. Please bring your order confirmation.</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 h-12 rounded-xl font-medium"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleNext}
                      className="flex-1 h-12 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 font-medium shadow-lg shadow-purple-500/30"
                    >
                      Continue to Review
                    </Button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl md:text-2xl mb-6">Review Your Order</h2>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Shipping Information</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStep(1)}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p>{formData.firstName} {formData.lastName}</p>
                      <p>{formData.email}</p>
                      <p>{formData.phone}</p>
                      <p>{formData.address}</p>
                      <p>{formData.city}, {formData.province} {formData.zipCode}</p>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold">Payment Method</h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditStep(2)}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                    <p className="text-sm text-gray-600">
                      Card ending in {formData.cardNumber.slice(-4)}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Order Items</h3>
                    <div className="space-y-3">
                      {items.map(item => (
                        <div key={item.product.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.product.name} × {item.quantity}</span>
                          <span className="font-medium">R{(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-4 mt-8">
                {step > 1 && (
                  <Button 
                    variant="outline" 
                    onClick={() => setStep(step - 1)}
                    className="rounded-2xl px-8"
                  >
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button 
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl h-12 shadow-lg shadow-purple-500/30"
                  >
                    Continue
                  </Button>
                ) : (
                  <Button 
                    onClick={handleSubmit}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-2xl h-12 shadow-lg shadow-purple-500/30"
                  >
                    Place Order
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary - Sticky */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
              <h3 className="text-xl mb-6">Order Summary</h3>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal (Excl. VAT)</span>
                  <span>R{subtotalExclVAT.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>VAT (15%)</span>
                  <span>R{vat.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Subtotal (Incl. VAT)</span>
                  <span className="font-semibold">R{subtotalInclVAT.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span>{shipping === 0 ? 'FREE' : `R${shipping.toFixed(2)}`}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">R{finalTotal.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-xs text-gray-500 text-center">
                Your payment information is secure and encrypted
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
