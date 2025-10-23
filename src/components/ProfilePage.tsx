import { useState, useEffect } from 'react';
import { ArrowLeft, User, Phone, Mail, Save, Edit2, Package, Settings, LogOut, CreditCard } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Avatar, AvatarFallback } from './ui/avatar';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { useAuth } from '../lib/hooks';
import { getCustomerOrders } from '../lib/api';

interface ProfilePageProps {
  onBack: () => void;
}

export function ProfilePage({ onBack }: ProfilePageProps) {
  const { customer, isAuthenticated, login, register, logout, updateProfile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  
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
      
      getCustomerOrders().then(setOrders).catch(console.error);
    }
  }, [customer]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await register(authData.email, authData.password, authData.firstName, authData.lastName);
        toast.success('Account created successfully!');
      } else {
        await login(authData.email, authData.password);
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
    await logout();
    toast.info('Logged out successfully');
    onBack();
  };

  if (!isAuthenticated) {
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
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-10">
        <button onClick={onBack} className="flex items-center gap-2 text-gray-600 hover:text-purple-600 mb-8 transition-colors group bg-white px-4 py-2 rounded-full shadow-sm">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </button>
        <Card className="p-8">
          <div className="text-center">
            <Avatar className="w-24 h-24 mb-4 mx-auto bg-gradient-to-r from-purple-600 to-indigo-600">
              <AvatarFallback className="text-white text-2xl font-bold">
                {formData.firstName.charAt(0)}{formData.lastName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">{formData.firstName} {formData.lastName}</h2>
            <p className="text-gray-500 mt-1">{formData.email}</p>
            <Button onClick={handleLogout} variant="outline" className="mt-4">
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
          
          <Separator className="my-8" />
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold">Personal Information</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={formData.firstName} onChange={(e) => handleInputChange('firstName', e.target.value)} disabled={!isEditing} />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={formData.lastName} onChange={(e) => handleInputChange('lastName', e.target.value)} disabled={!isEditing} />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={formData.email} disabled />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={formData.phone} onChange={(e) => handleInputChange('phone', e.target.value)} disabled={!isEditing} />
              </div>
            </div>
            
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="mt-4">
                <Edit2 className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2 mt-4">
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="w-4 h-4 mr-2" />
                  {loading ? 'Saving...' : 'Save'}
                </Button>
                <Button onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
              </div>
            )}
          </div>
          
          {orders.length > 0 && (
            <>
              <Separator className="my-8" />
              <div>
                <h3 className="text-xl font-bold mb-4">Orders</h3>
                {orders.map(order => (
                  <Card key={order.id} className="p-4 mb-2">
                    <div className="flex justify-between">
                      <span>Order #{order.id}</span>
                      <span>{((order.total || 0) / 100).toFixed(2)}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
