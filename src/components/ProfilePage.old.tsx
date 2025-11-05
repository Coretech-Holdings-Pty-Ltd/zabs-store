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

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-white shadow-sm border border-gray-200">
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              Profile
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
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">Personal Information</h3>
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
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <Card className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Order History</h3>
              
              {orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h4 className="text-lg font-semibold text-gray-600 mb-2">No Orders Yet</h4>
                  <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
                  <Button onClick={onBack} className="bg-purple-600 hover:bg-purple-700">
                    Start Shopping
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow border border-gray-200">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">
                              Order #{order.display_id || order.id?.slice(0, 8)}
                            </Badge>
                            <Badge variant="outline" className={
                              order.status === 'completed' ? 'border-green-500 text-green-700' :
                              order.status === 'pending' ? 'border-yellow-500 text-yellow-700' :
                              'border-gray-500 text-gray-700'
                            }>
                              {order.status || 'Pending'}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500">
                            {order.created_at ? new Date(order.created_at).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : 'Unknown date'}
                          </p>
                          {order.items && order.items.length > 0 && (
                            <p className="text-sm text-gray-600 mt-1">
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            ${((order.total || 0) / 100).toFixed(2)}
                          </p>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2"
                            onClick={() => toast.info('Order details coming soon!')}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
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
