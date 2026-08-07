import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  XCircle, AlertTriangle, CreditCard, RefreshCw, MessageCircle,
  ArrowLeft, AlertCircle, Package, FileText
} from 'lucide-react';

// ----- Mock data for failed payment (TCG-12-digit format) -----
const mockFailedData = {
  'TCG-345678901234': {
    trackingNumber: 'TCG-345678901234',
    transactionReference: 'TXN-2026-00842',
    amount: 35.00,
    currency: 'GBP',
    reason: 'Insufficient funds',
    timestamp: '2026-08-07 14:32:18',
    paymentMethod: 'Credit Card (•••• 4242)',
  },
};

function PaymentFailedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tracking = searchParams.get('tracking') || '';
  const [failureData, setFailureData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (tracking) {
      setLoading(true);
      setTimeout(() => {
        const data = mockFailedData[tracking.toUpperCase()];
        if (data) {
          setFailureData(data);
          setNotFound(false);
        } else {
          setFailureData(null);
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
  const goToPayment = () => navigate(`/payment?tracking=${tracking}`);
  const goToCustoms = () => navigate(`/customs?tracking=${tracking}`);

  const handleContactSupport = () => {
    alert('Opening support chat (demo)');
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

  if (notFound || !failureData) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-[#EF4444] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">No failed payment found</h3>
          <p className="text-gray-500">We couldn't find a failed transaction for tracking number <strong>{tracking}</strong>.</p>
          <button onClick={goToTrack} className="mt-6 btn-primary">Go to Track Page</button>
        </div>
      </div>
    );
  }

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

        <div className="max-w-3xl mx-auto">
          {/* ERROR CARD */}
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card overflow-hidden">
            {/* Top section – red error bar */}
            <div className="bg-[#EF4444]/5 border-b border-[#EF4444]/10 px-6 sm:px-8 py-6 sm:py-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#EF4444]/10 flex items-center justify-center text-[#EF4444] mb-4">
                  <XCircle size={32} strokeWidth={2.5} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E]">Payment Failed</h1>
                <p className="text-gray-600 mt-1">
                  Your transaction could not be completed. Please review the details below and try again.
                </p>
              </div>
            </div>

            {/* Failure details */}
            <div className="p-6 sm:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Tracking Number</p>
                  <p className="font-medium text-[#1A1A2E] font-mono flex items-center gap-1.5 mt-0.5">
                    <Package size={14} className="text-[#2B0071]/40" />
                    {failureData.trackingNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Transaction Reference</p>
                  <p className="font-medium text-[#1A1A2E] font-mono flex items-center gap-1.5 mt-0.5">
                    <FileText size={14} className="text-[#2B0071]/40" />
                    {failureData.transactionReference}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Amount</p>
                  <p className="font-medium text-[#1A1A2E]">
                    {failureData.amount} {failureData.currency}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Payment Method</p>
                  <p className="font-medium text-[#1A1A2E] flex items-center gap-1.5 mt-0.5">
                    <CreditCard size={14} className="text-[#2B0071]/40" />
                    {failureData.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Date/Time</p>
                  <p className="font-medium text-[#1A1A2E]">{failureData.timestamp}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Reason</p>
                  <div className="mt-1 flex items-start gap-2">
                    <AlertTriangle size={16} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
                    <p className="font-medium text-[#EF4444]">{failureData.reason}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="mt-8 pt-6 border-t border-[#E2E5F0] flex flex-wrap gap-3 justify-center">
                <button
                  onClick={goToPayment}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#FF5500] rounded-xl hover:bg-[#e64a00] transition-colors shadow-card"
                >
                  <RefreshCw size={18} />
                  Try Payment Again
                </button>
                <button
                  onClick={() => alert('Choose another payment method (demo)')}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#2B0071] bg-[#2B0071]/5 rounded-xl hover:bg-[#2B0071]/10 transition-colors"
                >
                  <CreditCard size={18} />
                  Choose Another Method
                </button>
                <button
                  onClick={handleContactSupport}
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#2B0071] border border-[#2B0071] rounded-xl hover:bg-[#2B0071] hover:text-white transition-colors"
                >
                  <MessageCircle size={18} />
                  Contact Support
                </button>
              </div>

              <p className="mt-6 text-xs text-gray-400 text-center">
                If the issue persists, please contact your bank or try a different payment method.
              </p>
            </div>
          </div>

          {/* Additional actions */}
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
            <button
              onClick={goToCustoms}
              className="text-[#2B0071] hover:text-[#FF5500] transition-colors flex items-center gap-1"
            >
              <FileText size={14} />
              View customs hold details
            </button>
            <button
              onClick={goToTrack}
              className="text-[#2B0071] hover:text-[#FF5500] transition-colors flex items-center gap-1"
            >
              <Package size={14} />
              Track your shipment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PaymentFailedPage;