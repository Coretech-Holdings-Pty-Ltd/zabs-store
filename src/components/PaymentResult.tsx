import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { verifyPayFastPayment, verifyOzowPayment, PaymentVerification } from '../lib/payment-service';
import { motion } from 'motion/react';

interface PaymentResultProps {
  searchParams: URLSearchParams;
  onViewOrders: () => void;
  onContinueShopping: () => void;
  onReturnToCart: () => void;
}

export function PaymentSuccess({ searchParams, onViewOrders, onContinueShopping }: PaymentResultProps) {
  const [verification, setVerification] = useState<PaymentVerification | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    verifyPayment();
  }, []);

  async function verifyPayment() {
    try {
      setLoading(true);

      // Check which provider (PayFast or Ozow)
      const provider = searchParams.get('provider') || 
                      (searchParams.has('pf_payment_id') ? 'payfast' : 'ozow');

      let result: PaymentVerification;

      if (provider === 'payfast') {
        result = await verifyPayFastPayment(searchParams);
      } else {
        result = await verifyOzowPayment(searchParams);
      }

      setVerification(result);

      // If payment verified, create order in Medusa
      if (result.verified && result.status === 'COMPLETE') {
        await createMedusaOrder(result);
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      setVerification({
        verified: false,
        paymentId: '',
        orderId: '',
        amount: 0,
        status: 'FAILED',
        provider: 'payfast',
        message: 'Failed to verify payment'
      });
    } finally {
      setLoading(false);
    }
  }

  async function createMedusaOrder(payment: PaymentVerification) {
    // Store order in localStorage
    const orderData = {
      orderId: payment.orderId,
      paymentId: payment.paymentId,
      transactionId: payment.transactionId,
      amount: payment.amount,
      status: 'PAID',
      provider: payment.provider,
      createdAt: new Date().toISOString()
    };

    localStorage.setItem(`order_${payment.orderId}`, JSON.stringify(orderData));
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-4 text-purple-600 animate-spin" />
          <h2 className="text-2xl font-bold mb-2">Verifying Payment</h2>
          <p className="text-gray-600">Please wait while we confirm your payment...</p>
        </Card>
      </div>
    );
  }

  if (!verification) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-orange-500" />
          <h2 className="text-2xl font-bold mb-2">Payment Status Unknown</h2>
          <p className="text-gray-600 mb-6">We couldn't verify your payment status.</p>
          <Button onClick={onContinueShopping} className="w-full">
            Return to Home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="p-8 max-w-md w-full text-center">
          {verification.verified && verification.status === 'COMPLETE' ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              >
                <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-500" />
              </motion.div>
              <h2 className="text-3xl font-bold mb-2 text-green-700">Payment Successful!</h2>
              <p className="text-gray-600 mb-6">Thank you for your payment.</p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Order ID:</span>
                  <span className="font-mono font-bold">{verification.orderId}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm">{verification.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold">R {verification.amount.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-3">
                <Button 
                  onClick={onViewOrders} 
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  View Order Details
                </Button>
                <Button 
                  onClick={onContinueShopping} 
                  variant="outline"
                  className="w-full"
                >
                  Continue Shopping
                </Button>
              </div>
            </>
          ) : (
            <>
              <XCircle className="w-20 h-20 mx-auto mb-4 text-red-500" />
              <h2 className="text-3xl font-bold mb-2 text-red-700">Payment {verification.status}</h2>
              <p className="text-gray-600 mb-6">
                {verification.message || 'Your payment could not be completed.'}
              </p>

              {verification.orderId && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Reference:</span>
                    <span className="font-mono">{verification.orderId}</span>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={onViewOrders} 
                  className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={onContinueShopping} 
                  variant="outline"
                  className="w-full"
                >
                  Return to Home
                </Button>
              </div>
            </>
          )}
        </Card>
      </motion.div>
    </div>
  );
}

export function PaymentCancelled({ onReturnToCart, onContinueShopping }: PaymentResultProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="p-8 max-w-md w-full text-center">
          <AlertCircle className="w-20 h-20 mx-auto mb-4 text-orange-500" />
          <h2 className="text-3xl font-bold mb-2">Payment Cancelled</h2>
          <p className="text-gray-600 mb-6">
            You cancelled the payment process. Your cart items are still saved.
          </p>

          <div className="space-y-3">
            <Button 
              onClick={onReturnToCart} 
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600"
            >
              Return to Cart
            </Button>
            <Button 
              onClick={onContinueShopping} 
              variant="outline"
              className="w-full"
            >
              Continue Shopping
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
