import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, FileText, Download, Eye, Printer,
  Package, Calendar, AlertCircle, CheckCircle,
  File, FileCheck, FileWarning, Receipt, Truck
} from 'lucide-react';

// ----- Mock document data per tracking number (TCG-12-digit) -----
const mockDocuments = {
  'TCG-123456789012': {
    trackingNumber: 'TCG-123456789012',
    origin: 'London, UK',
    destination: 'Edinburgh, UK',
    documents: [
      { id: 1, name: 'Waybill', type: 'Waybill', date: '2026-08-01', size: '245 KB', required: true },
      { id: 2, name: 'Commercial Invoice', type: 'Invoice', date: '2026-08-01', size: '1.2 MB', required: true },
      { id: 3, name: 'Packing List', type: 'Packing List', date: '2026-08-01', size: '876 KB', required: false },
      { id: 4, name: 'Delivery Confirmation', type: 'Delivery', date: '2026-08-08', size: '324 KB', required: false },
    ]
  },
  'TCG-234567890123': {
    trackingNumber: 'TCG-234567890123',
    origin: 'Manchester, UK',
    destination: 'Bristol, UK',
    documents: [
      { id: 1, name: 'Waybill', type: 'Waybill', date: '2026-07-28', size: '198 KB', required: true },
      { id: 2, name: 'Packing List', type: 'Packing List', date: '2026-07-28', size: '654 KB', required: false },
      { id: 3, name: 'Delivery Receipt', type: 'Receipt', date: '2026-08-02', size: '420 KB', required: false },
      { id: 4, name: 'Proof of Delivery', type: 'Delivery', date: '2026-08-02', size: '1.8 MB', required: false },
    ]
  },
  'TCG-345678901234': {
    trackingNumber: 'TCG-345678901234',
    origin: 'Glasgow, UK',
    destination: 'London, UK',
    documents: [
      { id: 1, name: 'Commercial Invoice', type: 'Invoice', date: '2026-08-03', size: '2.1 MB', required: true },
      { id: 2, name: 'Packing List', type: 'Packing List', date: '2026-08-03', size: '1.1 MB', required: true },
      { id: 3, name: 'Customs Notice', type: 'Customs', date: '2026-08-06', size: '456 KB', required: true },
      { id: 4, name: 'Inspection Document', type: 'Inspection', date: '2026-08-06', size: '789 KB', required: true },
      { id: 5, name: 'Clearance Document', type: 'Clearance', date: '2026-08-07', size: '567 KB', required: false },
      { id: 6, name: 'Payment Receipt', type: 'Receipt', date: '2026-08-07', size: '324 KB', required: false },
    ]
  },
  'TCG-456789012345': {
    trackingNumber: 'TCG-456789012345',
    origin: 'Birmingham, UK',
    destination: 'Liverpool, UK',
    documents: [
      { id: 1, name: 'Waybill', type: 'Waybill', date: '2026-08-04', size: '210 KB', required: true },
      { id: 2, name: 'Packing List', type: 'Packing List', date: '2026-08-04', size: '890 KB', required: false },
      { id: 3, name: 'Delivery Confirmation', type: 'Delivery', date: '2026-08-07', size: '312 KB', required: false },
    ]
  }
};

// Icon mapping for document types (unchanged)
const getDocIcon = (type) => {
  const map = {
    'Waybill': FileText,
    'Invoice': FileCheck,
    'Packing List': File,
    'Customs': FileWarning,
    'Inspection': AlertCircle,
    'Clearance': FileCheck,
    'Receipt': Receipt,
    'Delivery': Truck,
  };
  const Icon = map[type] || FileText;
  return <Icon size={18} className="text-[#2B0071]/60" />;
};

function ShipmentDocumentsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tracking = searchParams.get('tracking') || '';
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (tracking) {
      setLoading(true);
      setTimeout(() => {
        const docData = mockDocuments[tracking.toUpperCase()];
        if (docData) {
          setData(docData);
          setNotFound(false);
        } else {
          setData(null);
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
  const goToTrack = () => navigate('/track');

  const handleView = (doc) => {
    alert(`Viewing document: ${doc.name} (demo)`);
  };

  const handleDownload = (doc) => {
    alert(`Downloading ${doc.name} (demo)`);
  };

  const handlePrint = (doc) => {
    alert(`Printing ${doc.name} (demo)`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading documents...</p>
        </div>
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-[#EF4444] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">No documents found</h3>
          <p className="text-gray-500">We couldn't find any documents for tracking number <strong>{tracking}</strong>.</p>
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

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8 mb-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-[#1A1A2E] flex items-center gap-2">
                  <FileText size={24} className="text-[#2B0071]" />
                  Shipment Documents
                </h1>
                <p className="text-gray-500 text-sm mt-1">
                  Tracking #{data.trackingNumber} – {data.origin} → {data.destination}
                </p>
              </div>
              <button
                onClick={goToShipment}
                className="text-sm font-medium text-[#2B0071] hover:text-[#FF5500] transition-colors flex items-center gap-1"
              >
                <Package size={14} />
                View shipment details
              </button>
            </div>
          </div>

          {/* Document list */}
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2E5F0] bg-[#F8F9FD]/50 flex items-center justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
              <span className="flex-1">Document Name</span>
              <span className="w-24 text-center hidden sm:block">Date</span>
              <span className="w-20 text-center hidden md:block">Size</span>
              <span className="w-40 text-right">Actions</span>
            </div>

            <div className="divide-y divide-[#E2E5F0]">
              {data.documents.map((doc) => (
                <div key={doc.id} className="px-6 py-4 flex flex-wrap items-center gap-3 hover:bg-[#F8F9FD]/30 transition-colors">
                  {/* Document info */}
                  <div className="flex-1 min-w-[140px] flex items-center gap-3">
                    {getDocIcon(doc.type)}
                    <div>
                      <p className="text-sm font-medium text-[#1A1A2E]">{doc.name}</p>
                      <p className="text-xs text-gray-400">{doc.type}</p>
                    </div>
                    {doc.required && (
                      <span className="text-xs text-[#FF5500] bg-[#FF5500]/10 px-2 py-0.5 rounded-full">Required</span>
                    )}
                  </div>

                  {/* Date */}
                  <div className="w-24 text-center hidden sm:block text-sm text-gray-500">
                    {doc.date}
                  </div>

                  {/* Size */}
                  <div className="w-20 text-center hidden md:block text-sm text-gray-400">
                    {doc.size}
                  </div>

                  {/* Actions */}
                  <div className="w-40 flex items-center justify-end gap-2 flex-nowrap">
                    <button
                      onClick={() => handleView(doc)}
                      className="p-2 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                      aria-label={`View ${doc.name}`}
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() => handleDownload(doc)}
                      className="p-2 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                      aria-label={`Download ${doc.name}`}
                    >
                      <Download size={16} />
                    </button>
                    <button
                      onClick={() => handlePrint(doc)}
                      className="p-2 text-[#2B0071]/60 hover:text-[#2B0071] transition-colors rounded-lg hover:bg-[#2B0071]/5"
                      aria-label={`Print ${doc.name}`}
                    >
                      <Printer size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div className="px-6 py-4 bg-[#F8F9FD]/30 border-t border-[#E2E5F0] text-xs text-gray-400 flex items-center gap-2">
              <FileText size={14} />
              <span>{data.documents.length} document(s) available</span>
            </div>
          </div>

          {/* Additional info */}
          <div className="mt-6 text-center text-xs text-gray-400">
            <p>For official use only. Documents are provided for reference.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShipmentDocumentsPage;