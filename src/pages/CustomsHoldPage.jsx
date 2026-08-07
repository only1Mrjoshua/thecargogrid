import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, FileText, Download, CreditCard, MessageCircle,
  MapPin, Calendar, ArrowLeft, AlertCircle, CheckCircle,
  Info, Package
} from 'lucide-react';
import { publicApi } from '../api/publicApi';

// Helper to extract customs hold data from a shipment
const extractCustomsData = (shipment) => {
  // If shipment has customs hold status
  const isCustomsHold = shipment.status === 'Customs Hold' || shipment.status === 'Customs Fee Pending';
  if (!isCustomsHold) return null;

  // Build customs data from shipment fields (fallback to defaults)
  return {
    trackingNumber: shipment.id || shipment.trackingNumber || '',
    status: shipment.status,
    origin: shipment.origin || '',
    destination: shipment.destination || '',
    currentLocation: shipment.currentLocation || shipment.location || 'Customs Clearance Centre',
    holdDate: shipment.dateTime || shipment.date || new Date().toISOString().slice(0, 16),
    reason: shipment.description || 'Customs processing required',
    explanation: shipment.description || 'The shipment requires additional customs processing before it can continue.',
    instructions: 'Please provide the required documents. You can upload them below or contact our support team for assistance.',
    requiredDocuments: shipment.documents?.filter(d => d.required)?.map(d => ({ name: d.name, required: true, uploaded: false })) || [
      { name: 'Commercial Invoice', required: true, uploaded: false },
      { name: 'Packing List', required: true, uploaded: false },
    ],
    fee: shipment.fees ? {
      amount: shipment.fees.total || 0,
      currency: shipment.fees.currency || 'USD',
      description: 'Customs processing fee',
      paid: shipment.fees.paid || false
    } : null,
    contactSupport: true,
    nextSteps: 'Once documents are submitted and verified, the shipment will be released within 24 hours.'
  };
};

function CustomsHoldPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tracking = searchParams.get('tracking') || '';
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (tracking) {
      const fetchShipment = async () => {
        setLoading(true);
        setError('');
        setNotFound(false);
        try {
          const response = await publicApi.get(`/shipments/public/${tracking}`);
          const data = response.data.shipment;
          // Check if it's a customs hold
          if (data.status === 'Customs Hold' || data.status === 'Customs Fee Pending') {
            setShipment(data);
          } else {
            // Not a customs hold – show error
            setError('This shipment is not currently on customs hold.');
            setNotFound(true);
          }
        } catch (err) {
          if (err.response?.status === 404) {
            setNotFound(true);
          } else {
            setError('Failed to load customs hold details.');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchShipment();
    } else {
      setNotFound(true);
      setLoading(false);
    }
  }, [tracking]);

  const goBack = () => navigate(-1);
  const goToTrack = () => navigate('/track');

  const handleViewDocument = (docName) => {
    alert(`Viewing document: ${docName} (demo)`);
  };

  const handleDownloadDocument = (docName) => {
    alert(`Downloading ${docName} (demo)`);
  };

  const handleContactSupport = () => {
    alert('Opening support chat (demo)');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading customs hold details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-[#EF4444] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">Not a customs hold</h3>
          <p className="text-gray-500">{error}</p>
          <button onClick={goToTrack} className="mt-6 btn-primary">Go to Track Page</button>
        </div>
      </div>
    );
  }

  if (notFound || !shipment) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-[#EF4444] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">No customs hold found</h3>
          <p className="text-gray-500">We couldn't find any customs hold for tracking number <strong>{tracking}</strong>.</p>
          <button onClick={goToTrack} className="mt-6 btn-primary">Go to Track Page</button>
        </div>
      </div>
    );
  }

  // Extract customs data from the shipment
  const customsData = extractCustomsData(shipment);
  if (!customsData) {
    // Fallback – should not happen because we already checked status
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-[#EF4444] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">Not a customs hold</h3>
          <p className="text-gray-500">This shipment is not currently on customs hold.</p>
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

        <div className="max-w-4xl mx-auto space-y-8">
          {/* REDESIGNED HEADER CARD */}
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#FF5500]/10 flex items-center justify-center text-[#FF5500]">
                <AlertTriangle size={24} strokeWidth={1.8} />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-[#1A1A2E]">Shipment Held by Customs</h1>
                <p className="text-gray-600 mt-1">
                  Your shipment requires additional customs processing before it can continue to its destination.
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FF5500]/10 text-[#FF5500] rounded-full text-xs font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500]" />
                    Held by Customs
                  </span>
                  <span className="text-sm text-gray-400 font-mono">{customsData.trackingNumber}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
            <h2 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
              <Info size={20} className="text-[#2B0071]" />
              Hold Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-gray-500">Current Location</div>
                <div className="font-medium flex items-center gap-1.5">
                  <MapPin size={14} className="text-[#FF5500]" />
                  {customsData.currentLocation}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Hold Date/Time</div>
                <div className="font-medium flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#2B0071]/40" />
                  {customsData.holdDate}
                </div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-gray-500">Reason for Hold</div>
                <div className="font-medium text-[#1A1A2E]">{customsData.reason}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-gray-500">Explanation</div>
                <p className="text-sm text-gray-600">{customsData.explanation}</p>
              </div>
              <div className="sm:col-span-2">
                <div className="text-xs text-gray-500">Instructions</div>
                <p className="text-sm text-gray-600">{customsData.instructions}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
            <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
              <FileText size={20} className="text-[#2B0071]" />
              Required Documents
            </h3>
            <div className="space-y-3">
              {customsData.requiredDocuments.map((doc, idx) => (
                <div key={idx} className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-[#E2E5F0] last:border-0">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#2B0071]/40" />
                    <span className="font-medium text-sm">{doc.name}</span>
                    {doc.required && (
                      <span className="text-xs text-[#FF5500] bg-[#FF5500]/10 px-2 py-0.5 rounded-full">Required</span>
                    )}
                    {doc.uploaded && (
                      <span className="text-xs text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <CheckCircle size={12} /> Uploaded
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewDocument(doc.name)}
                      className="text-xs font-medium text-[#2B0071] hover:text-[#FF5500] transition-colors"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleDownloadDocument(doc.name)}
                      className="text-xs font-medium text-[#2B0071] hover:text-[#FF5500] transition-colors flex items-center gap-1"
                    >
                      <Download size={12} /> Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-sm text-gray-500 flex items-center gap-2">
              <Info size={14} className="text-[#2B0071]/40" />
              Upload missing documents through your account or contact support.
            </div>
          </div>

          {/* Fee and Actions */}
          <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
            {/* Fee card with payment links */}
            <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6">
              <h4 className="text-sm font-bold text-[#1A1A2E] mb-3">Fee Information</h4>
              {customsData.fee ? (
                <div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">{customsData.fee.description}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg">
                        {customsData.fee.amount} {customsData.fee.currency}
                      </span>
                      {!customsData.fee.paid && (
                        <button
                          onClick={() => navigate(`/payment?tracking=${encodeURIComponent(tracking)}`)}
                          className="text-xs font-semibold text-[#FF5500] hover:text-[#2B0071] transition-colors flex items-center gap-0.5"
                        >
                          Pay now
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {customsData.fee.paid ? (
                      <span className="text-[#10B981] flex items-center gap-1">
                        <CheckCircle size={14} /> Paid
                      </span>
                    ) : (
                      <span className="text-[#FF5500] flex items-center gap-1">
                        <AlertTriangle size={14} /> Unpaid – payment required for release
                      </span>
                    )}
                  </div>
                  {!customsData.fee.paid && (
                    <button
                      onClick={() => navigate(`/payment?tracking=${encodeURIComponent(tracking)}`)}
                      className="mt-3 w-full btn-primary text-sm py-2.5 flex items-center justify-center gap-2"
                    >
                      <CreditCard size={16} />
                      Pay Fee Now
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No additional fees required.</p>
              )}
            </div>
          </div>

          {/* Next steps */}
          <div className="bg-[#F8F9FD] rounded-2xl border border-[#E2E5F0] p-6 text-sm text-gray-600">
            <p className="font-medium text-[#1A1A2E]">Next steps:</p>
            <p>{customsData.nextSteps}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomsHoldPage;