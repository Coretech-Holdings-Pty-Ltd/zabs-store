import { useState } from 'react';
import { ArrowLeft, CreditCard, Truck, CheckCircle, AlertCircle, Edit2 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { CartItem } from './Cart';
import { toast } from 'sonner';
import { Alert, AlertDescription } from './ui/alert';

interface CheckoutProps {
  items: CartItem[];
  total: number;
  onBack: () => void;
  onComplete: () => void;
}

export function Checkout({ items, total, onBack, onComplete }: CheckoutProps) {
  const [step, setStep] = useState(1);
  const [editingStep, setEditingStep] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    province: '',
    zipCode: '',
    phone: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    cardName: ''
  });

  const subtotalInclVAT = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const subtotalExclVAT = subtotalInclVAT / 1.15;
  const vat = subtotalInclVAT - subtotalExclVAT;
  const shipping = subtotalInclVAT > 1000 ? 0 : 100;
  const finalTotal = subtotalInclVAT + shipping;

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.address) newErrors.address = 'Address is required';
    if (!formData.city) newErrors.city = 'City is required';
    if (!formData.province) newErrors.province = 'Province is required';
    if (!formData.zipCode) newErrors.zipCode = 'Postal code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.cardName) newErrors.cardName = 'Cardholder name is required';
    if (!formData.cardNumber) newErrors.cardNumber = 'Card number is required';
    else if (formData.cardNumber.replace(/\s/g, '').length < 16) newErrors.cardNumber = 'Invalid card number';
    
    if (!formData.cardExpiry) newErrors.cardExpiry = 'Expiry date is required';
    else if (!/^\d{2}\/\d{2}$/.test(formData.cardExpiry)) newErrors.cardExpiry = 'Format: MM/YY';
    
    if (!formData.cardCvv) newErrors.cardCvv = 'CVV is required';
    else if (formData.cardCvv.length < 3) newErrors.cardCvv = 'Invalid CVV';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
        toast.error('Please fill in all payment details correctly');
      }
    }
  };

  const handleEditStep = (stepNum: number) => {
    setStep(stepNum);
    setEditingStep(stepNum);
  };

  const handleSubmit = () => {
    if (validateStep1() && validateStep2()) {
      onComplete();
    } else {
      toast.error('Please review and complete all required information');
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
    { number: 1, title: 'Shipping', icon: Truck },
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

        {/* Progress */}
        <div className="flex items-center justify-center mb-12 md:mb-16">
          {steps.map((s, idx) => (
            <div key={s.number} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
                  step >= s.number ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30' : 'bg-gray-200 text-gray-400'
                }`}>
                  <s.icon className="w-5 h-5 md:w-6 md:h-6" />
                </div>
                <div className={`text-xs md:text-sm ${step >= s.number ? 'text-purple-600 font-medium' : 'text-gray-400'}`}>
                  {s.title}
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className={`w-16 md:w-24 h-0.5 mx-2 md:mx-4 mb-8 transition-all duration-300 ${
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
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl md:text-2xl mb-6">Payment Information</h2>
                  
                  {Object.keys(errors).length > 0 && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Please correct the errors below
                      </AlertDescription>
                    </Alert>
                  )}

                  <div>
                    <Label htmlFor="cardName" className="text-sm mb-2 block">Cardholder Name *</Label>
                    <Input
                      id="cardName"
                      value={formData.cardName}
                      onChange={(e) => handleInputChange('cardName', e.target.value)}
                      placeholder="John Doe"
                      className={`h-11 rounded-lg ${errors.cardName ? 'border-red-500' : ''}`}
                    />
                    {errors.cardName && <p className="text-red-500 text-xs mt-1">{errors.cardName}</p>}
                  </div>

                  <div>
                    <Label htmlFor="cardNumber" className="text-sm mb-2 block">Card Number *</Label>
                    <Input
                      id="cardNumber"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`h-11 rounded-lg ${errors.cardNumber ? 'border-red-500' : ''}`}
                    />
                    {errors.cardNumber && <p className="text-red-500 text-xs mt-1">{errors.cardNumber}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cardExpiry" className="text-sm mb-2 block">Expiry Date *</Label>
                      <Input
                        id="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length >= 2) {
                            value = value.slice(0, 2) + '/' + value.slice(2, 4);
                          }
                          handleInputChange('cardExpiry', value);
                        }}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`h-11 rounded-lg ${errors.cardExpiry ? 'border-red-500' : ''}`}
                      />
                      {errors.cardExpiry && <p className="text-red-500 text-xs mt-1">{errors.cardExpiry}</p>}
                    </div>
                    <div>
                      <Label htmlFor="cardCvv" className="text-sm mb-2 block">CVV *</Label>
                      <Input
                        id="cardCvv"
                        type="password"
                        value={formData.cardCvv}
                        onChange={(e) => handleInputChange('cardCvv', e.target.value.replace(/\D/g, ''))}
                        placeholder="123"
                        maxLength={4}
                        className={`h-11 rounded-lg ${errors.cardCvv ? 'border-red-500' : ''}`}
                      />
                      {errors.cardCvv && <p className="text-red-500 text-xs mt-1">{errors.cardCvv}</p>}
                    </div>
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
