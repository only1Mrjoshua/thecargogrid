import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, CreditCard, Lock, AlertCircle,
  MapPin, Calendar, FileText, MessageCircle
} from 'lucide-react';

// ----- Mock data (extend from customs hold) with TCG-12-digit format -----
const mockPaymentData = {
  'TCG-345678901234': {
    trackingNumber: 'TCG-345678901234',
    origin: 'Glasgow, UK',
    destination: 'London, UK',
    feeDescription: 'Customs processing fee',
    amount: 35.00,
    currency: 'USD',
    invoiceNumber: 'INV-2026-0042',
    dueDate: '2026-08-15',
  },
};

function CustomsPaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tracking = searchParams.get('tracking') || '';
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form state
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [cardName, setCardName] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (tracking) {
      setLoading(true);
      setTimeout(() => {
        const data = mockPaymentData[tracking.toUpperCase()];
        if (data) {
          setPaymentData(data);
          setNotFound(false);
        } else {
          setPaymentData(null);
          setNotFound(true);
        }
        setLoading(false);
      }, 300);
    } else {
      setNotFound(true);
      setLoading(false);
    }
  }, [tracking]);

  const goBack = () => navigate(-1);
  const goToTrack = () => navigate('/track');
  const goToCustoms = () => navigate(`/customs?tracking=${tracking}`);

  const handlePay = (e) => {
    e.preventDefault();

    // Simple validation
    if (!cardNumber.trim() || cardNumber.replace(/\s/g, '').length < 16) {
      setFormError('Please enter a valid card number (16 digits).');
      return;
    }
    if (!expiry.trim() || expiry.length < 5) {
      setFormError('Please enter a valid expiry date (MM/YY).');
      return;
    }
    if (!cvc.trim() || cvc.length < 3) {
      setFormError('Please enter a valid CVC.');
      return;
    }
    if (!cardName.trim()) {
      setFormError('Please enter the cardholder name.');
      return;
    }

    setFormError('');
    setIsProcessing(true);

    // Simulate payment processing – redirect on success
    setTimeout(() => {
      setIsProcessing(false);
      navigate(`/payment-success?tracking=${encodeURIComponent(tracking)}`);
    }, 2000);
  };

  const handleContactSupport = () => {
    alert('Opening support chat (demo)');
  };

  // Simulate a failure
  const simulateFailure = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      navigate(`/payment-failed?tracking=${encodeURIComponent(tracking)}`);
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !paymentData) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-[#EF4444] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">No payment found</h3>
          <p className="text-gray-500">No outstanding fee found for tracking number <strong>{tracking}</strong>.</p>
          <button onClick={goToTrack} className="mt-6 btn-primary">Go to Track Page</button>
        </div>
      </div>
    );
  }

  // Payment form
  return (
    <div className="min-h-screen bg-[#F8F9FD] pt-[72px]">
      <div className="container-custom py-8 md:py-12">
        {/* Back button */}
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#2B0071]/70 hover:text-[#2B0071] transition-colors duration-200 mb-6 group"
        >
          <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
          Back
        </button>

        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Payment form – 3/5 width */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard size={24} className="text-[#2B0071]" />
                <h1 className="text-2xl font-bold text-[#1A1A2E]">Pay Clearance Fee</h1>
              </div>

              <form onSubmit={handlePay} className="space-y-5">
                {/* Card number */}
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                    Card Number
                  </label>
                  <input
                    id="cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(.{4})/g, '$1 ').trim())}
                    className="w-full px-4 py-3 text-base bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
                    maxLength="19"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="expiry" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                      Expiry Date
                    </label>
                    <input
                      id="expiry"
                      type="text"
                      placeholder="MM/YY"
                      value={expiry}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 4) {
                          setExpiry(val.replace(/(.{2})/, '$1/').trim());
                        }
                      }}
                      className="w-full px-4 py-3 text-base bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
                      maxLength="5"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="cvc" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                      CVC
                    </label>
                    <input
                      id="cvc"
                      type="text"
                      placeholder="123"
                      value={cvc}
                      onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      className="w-full px-4 py-3 text-base bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
                      maxLength="4"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="cardName" className="block text-sm font-medium text-[#1A1A2E] mb-1.5">
                    Cardholder Name
                  </label>
                  <input
                    id="cardName"
                    type="text"
                    placeholder="John Smith"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full px-4 py-3 text-base bg-white border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500] transition-all"
                    required
                  />
                </div>

                {formError && (
                  <p className="text-sm text-[#EF4444] flex items-center gap-1.5">
                    <AlertCircle size={14} />
                    {formError}
                  </p>
                )}

                {/* --- Simulate Failure Button --- */}
                <button
                  type="button"
                  onClick={simulateFailure}
                  disabled={isProcessing}
                  className="text-xs text-gray-400 hover:text-[#EF4444] transition-colors underline mt-1 block text-left"
                >
                  Simulate payment failure (demo)
                </button>

                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full btn-primary py-3.5 text-base flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock size={18} />
                      Pay Clearance Fee
                    </>
                  )}
                </button>

                <p className="text-xs text-gray-400 text-center flex items-center justify-center gap-1.5">
                  <Lock size={12} />
                  Secure payment – your card details are encrypted
                </p>
              </form>
            </div>
          </div>

          {/* Order summary – 2/5 width */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8 sticky top-[100px]">
              <h3 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider mb-4">
                Fee Summary
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Tracking Number</span>
                  <span className="font-mono font-medium">{paymentData.trackingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Route</span>
                  <span className="font-medium">{paymentData.origin} → {paymentData.destination}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Invoice</span>
                  <span className="font-mono">{paymentData.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Date</span>
                  <span>{paymentData.dueDate}</span>
                </div>
                <div className="border-t border-[#E2E5F0] pt-3 mt-3">
                  <div className="flex justify-between text-base font-bold">
                    <span>Amount Due</span>
                    <span className="text-[#FF5500]">{paymentData.amount} {paymentData.currency}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{paymentData.feeDescription}</p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-[#E2E5F0]">
                <button
                  onClick={goToCustoms}
                  className="text-sm font-medium text-[#2B0071] hover:text-[#FF5500] transition-colors flex items-center gap-1"
                >
                  <FileText size={14} />
                  View customs hold details
                </button>
                <button
                  onClick={handleContactSupport}
                  className="mt-2 text-sm font-medium text-[#2B0071] hover:text-[#FF5500] transition-colors flex items-center gap-1"
                >
                  <MessageCircle size={14} />
                  Contact support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomsPaymentPage;