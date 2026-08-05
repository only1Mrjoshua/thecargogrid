import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Download, Printer, Package, ArrowLeft,
  AlertCircle, CreditCard, Calendar, User, FileText,
  ShieldCheck, Truck
} from 'lucide-react';

// ----- Mock data for receipt lookup -----
const mockReceiptData = {
  'CG-789012': {
    customerName: 'John Smith',
    trackingNumber: 'CG-789012',
    paymentReference: 'PAY-2026-00842',
    amount: 35.00,
    currency: 'GBP',
    date: '2026-08-07 14:32:18',
    paymentType: 'Credit Card (•••• 4242)',
    status: 'Completed',
    feeDescription: 'Customs Clearance Fee',
    origin: 'Glasgow, UK',
    destination: 'London, UK',
  },
};

// Helper to generate a realistic receipt number if not found
const generateReference = () => {
  return 'PAY-' + new Date().getFullYear() + '-' + Math.random().toString(36).substring(2, 9).toUpperCase();
};

function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tracking = searchParams.get('tracking') || '';
  const [receipt, setReceipt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (tracking) {
      setLoading(true);
      setTimeout(() => {
        const data = mockReceiptData[tracking.toUpperCase()];
        if (data) {
          // Add a unique reference if missing, but keep the mock one
          setReceipt(data);
          setNotFound(false);
        } else {
          // If not found, we can still show a generic success or not found
          setReceipt(null);
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
  const goToShipment = () => navigate(`/shipment?tracking=${tracking}`);
  const goToTrack = () => navigate(`/track?tracking=${tracking}`);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // In a real app, this would generate a PDF.
    // For now, we print to console and alert the user.
    alert('Downloading receipt as PDF (demo)');
    console.log('Downloading receipt for:', receipt?.trackingNumber);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading payment confirmation...</p>
        </div>
      </div>
    );
  }

  if (notFound || !receipt) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-[#EF4444] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">Receipt not found</h3>
          <p className="text-gray-500">
            We couldn’t find a receipt for tracking number <strong>{tracking}</strong>.
          </p>
          <button onClick={goToTrack} className="mt-6 btn-primary">
            Go to Track Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FD] pt-[72px] print:pt-0 print:bg-white">
      <div className="container-custom py-8 md:py-12 print:py-8">
        {/* Back button - hidden when printing */}
        <button
          onClick={goBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-[#2B0071]/70 hover:text-[#2B0071] transition-colors duration-200 mb-6 print:hidden group"
        >
          <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
          Back
        </button>

        <div className="max-w-3xl mx-auto">
          {/* ----- SUCCESS CARD / RECEIPT ----- */}
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card overflow-hidden print:shadow-none print:border-0">
            {/* Top section – green success bar */}
            <div className="bg-[#10B981]/5 border-b border-[#10B981]/10 px-6 sm:px-8 py-6 sm:py-8 text-center">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center text-[#10B981] mb-4">
                  <CheckCircle size={32} strokeWidth={2.5} />
                </div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#1A1A2E]">Payment Successful</h1>
                <p className="text-gray-600 mt-1">
                  Your customs clearance fee has been paid and confirmed.
                </p>
              </div>
            </div>

            {/* Receipt body */}
            <div className="p-6 sm:p-8">
              {/* Branding / Seal */}
              <div className="flex items-center justify-between mb-6 border-b border-[#E2E5F0] pb-4">
                <div className="flex items-center gap-3">
                  <img src="/logo.png" alt="The Cargo Grid" className="h-8 w-auto object-contain" />
                  <span className="text-xs font-semibold text-[#2B0071] bg-[#2B0071]/5 px-2 py-0.5 rounded-full">
                    OFFICIAL RECEIPT
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[#2B0071]">
                  <ShieldCheck size={20} className="text-[#FF5500]" />
                  <span className="text-xs font-bold uppercase tracking-wider">Verified</span>
                </div>
              </div>

              {/* Receipt Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Customer Name</p>
                  <p className="font-medium text-[#1A1A2E] flex items-center gap-1.5 mt-0.5">
                    <User size={14} className="text-[#2B0071]/40" />
                    {receipt.customerName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Tracking Number</p>
                  <p className="font-medium text-[#1A1A2E] font-mono flex items-center gap-1.5 mt-0.5">
                    <Package size={14} className="text-[#2B0071]/40" />
                    {receipt.trackingNumber}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Payment Reference</p>
                  <p className="font-medium text-[#1A1A2E] font-mono flex items-center gap-1.5 mt-0.5">
                    <FileText size={14} className="text-[#2B0071]/40" />
                    {receipt.paymentReference}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Date & Time</p>
                  <p className="font-medium text-[#1A1A2E] flex items-center gap-1.5 mt-0.5">
                    <Calendar size={14} className="text-[#2B0071]/40" />
                    {receipt.date}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Payment Type</p>
                  <p className="font-medium text-[#1A1A2E] flex items-center gap-1.5 mt-0.5">
                    <CreditCard size={14} className="text-[#2B0071]/40" />
                    {receipt.paymentType}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Status</p>
                  <p className="font-medium text-[#10B981] flex items-center gap-1.5 mt-0.5">
                    <CheckCircle size={14} />
                    {receipt.status}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Fee Description</p>
                  <p className="font-medium text-[#1A1A2E] mt-0.5">
                    {receipt.feeDescription}
                  </p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Route</p>
                  <p className="font-medium text-[#1A1A2E] flex items-center gap-1.5 mt-0.5">
                    <Truck size={14} className="text-[#2B0071]/40" />
                    {receipt.origin} → {receipt.destination}
                  </p>
                </div>
              </div>

              {/* Amount Due – Highlighted */}
              <div className="mt-6 pt-4 border-t-2 border-[#2B0071]/10 flex flex-wrap items-center justify-between">
                <span className="text-sm font-semibold text-[#1A1A2E]">Total Amount Paid</span>
                <span className="text-2xl font-extrabold text-[#2B0071]">
                  {receipt.amount} {receipt.currency}
                </span>
              </div>

              {/* Watermark / Seal at the bottom */}
              <div className="mt-6 pt-4 border-t border-[#E2E5F0] flex items-center justify-between text-xs text-gray-400">
                <span>Thank you for choosing The Cargo Grid.</span>
                <span className="flex items-center gap-1">
                  <ShieldCheck size={12} className="text-[#FF5500]" />
                  Secured Payment
                </span>
              </div>
            </div>
          </div>

          {/* ----- ACTION BUTTONS ----- */}
          <div className="mt-8 flex flex-wrap gap-3 justify-center print:hidden">
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#2B0071] rounded-xl hover:bg-[#3d0099] transition-colors shadow-card"
            >
              <Download size={18} />
              Download PDF
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#2B0071] bg-[#2B0071]/5 rounded-xl hover:bg-[#2B0071]/10 transition-colors"
            >
              <Printer size={18} />
              Print Receipt
            </button>
            <button
              onClick={goToShipment}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#2B0071] border border-[#2B0071] rounded-xl hover:bg-[#2B0071] hover:text-white transition-colors"
            >
              <Package size={18} />
              Return to Shipment
            </button>
            <button
              onClick={goToTrack}
              className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-[#FF5500] border border-[#FF5500] rounded-xl hover:bg-[#FF5500] hover:text-white transition-colors"
            >
              <Truck size={18} />
              Track Shipment
            </button>
          </div>
        </div>
      </div>

      {/* ----- PRINT STYLES (inline) ----- */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .container-custom, .container-custom * {
            visibility: visible;
          }
          .container-custom {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 20px;
          }
          .bg-white {
            background: white !important;
            box-shadow: none !important;
            border: 1px solid #ddd !important;
          }
          .shadow-card {
            box-shadow: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-0 {
            border: 0 !important;
          }
          .print\\:bg-white {
            background: white !important;
          }
          .print\\:pt-0 {
            padding-top: 0 !important;
          }
          .print\\:py-8 {
            padding-top: 2rem !important;
            padding-bottom: 2rem !important;
          }
          .print\\:hidden {
            display: none !important;
          }
          .print\\:block {
            display: block !important;
          }
        }
      `}</style>
    </div>
  );
}

export default PaymentSuccessPage;