import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  MapPin, Calendar, Package, User, Mail, Phone,
  FileText, CreditCard, MessageCircle, ArrowLeft, Download,
  CheckCircle, Circle, AlertCircle, Clock, Info
} from 'lucide-react';

// ----- Complete mock data (all 4 shipments) with TCG-12-digit tracking numbers -----
const mockShipments = {
  'TCG-123456789012': {
    trackingNumber: 'TCG-123456789012',
    status: 'in_transit',
    packageType: 'Standard Parcel',
    sender: {
      name: 'John Smith',
      company: 'TechSupply Ltd',
      email: 'john@techsupply.co.uk',
      phone: '+44 20 7946 0958',
      address: '123 Business Park, London, E1 6AN'
    },
    recipient: {
      name: 'Sarah Johnson',
      company: 'Edinburgh Designs',
      email: 'sarah@eddesigns.co.uk',
      phone: '+44 131 496 0224',
      address: '45 Creative Way, Edinburgh, EH1 3AB'
    },
    origin: 'London, UK',
    destination: 'Edinburgh, UK',
    weight: '2.5 kg',
    shipmentDate: '2026-08-01',
    estimatedDelivery: '2026-08-08',
    currentLocation: 'Manchester Hub',
    history: [
      { event: 'Order Received', status: 'completed', date: '2026-08-01 09:30', description: 'Shipment created' },
      { event: 'Shipment Processed', status: 'completed', date: '2026-08-02 14:15', description: 'Package sorted and labelled' },
      { event: 'In Transit', status: 'active', date: '2026-08-03 08:45', description: 'Departed London facility' },
      { event: 'Customs Clearance', status: 'upcoming', date: null, description: 'Awaiting customs processing' },
      { event: 'Out for Delivery', status: 'upcoming', date: null, description: 'Will be dispatched to recipient' },
      { event: 'Delivered', status: 'upcoming', date: null, description: 'Package delivered to recipient' },
    ],
    fees: {
      total: 45.00,
      currency: 'GBP',
      paid: false,
      breakdown: [
        { label: 'Shipping', amount: 30.00 },
        { label: 'Insurance', amount: 10.00 },
        { label: 'Handling', amount: 5.00 },
      ]
    },
    documents: [
      { name: 'Waybill', url: '#', required: true },
      { name: 'Commercial Invoice', url: '#', required: true },
      { name: 'Packing List', url: '#', required: false },
    ]
  },
  'TCG-234567890123': {
    trackingNumber: 'TCG-234567890123',
    status: 'delivered',
    packageType: 'Express Parcel',
    sender: {
      name: 'Alice Brown',
      company: 'FastMove Logistics',
      email: 'alice@fastmove.co.uk',
      phone: '+44 161 234 5678',
      address: '10 Warehouse Lane, Manchester, M1 1AD'
    },
    recipient: {
      name: 'Robert Wilson',
      company: 'Bristol Retail Co',
      email: 'robert@bristolretail.co.uk',
      phone: '+44 117 987 6543',
      address: '22 High Street, Bristol, BS1 2ER'
    },
    origin: 'Manchester, UK',
    destination: 'Bristol, UK',
    weight: '1.8 kg',
    shipmentDate: '2026-07-28',
    estimatedDelivery: '2026-08-02',
    currentLocation: 'Bristol Delivery Centre',
    history: [
      { event: 'Order Received', status: 'completed', date: '2026-07-28 10:00', description: 'Shipment created' },
      { event: 'Shipment Processed', status: 'completed', date: '2026-07-29 08:30', description: 'Package sorted and labelled' },
      { event: 'In Transit', status: 'completed', date: '2026-07-30 06:15', description: 'Departed Manchester' },
      { event: 'Customs Clearance', status: 'completed', date: '2026-07-31 12:00', description: 'Customs cleared (domestic)' },
      { event: 'Out for Delivery', status: 'completed', date: '2026-08-01 09:00', description: 'Dispatched for delivery' },
      { event: 'Delivered', status: 'completed', date: '2026-08-02 14:30', description: 'Delivered to recipient' },
    ],
    fees: {
      total: 30.00,
      currency: 'GBP',
      paid: true,
      breakdown: [
        { label: 'Shipping', amount: 20.00 },
        { label: 'Insurance', amount: 5.00 },
        { label: 'Handling', amount: 5.00 },
      ]
    },
    documents: [
      { name: 'Waybill', url: '#', required: true },
      { name: 'Packing List', url: '#', required: false },
    ]
  },
  'TCG-345678901234': {
    trackingNumber: 'TCG-345678901234',
    status: 'customs',
    packageType: 'Standard Parcel',
    sender: {
      name: 'David Wilson',
      company: 'Glasgow Exports',
      email: 'david@glasgowexports.co.uk',
      phone: '+44 141 555 0199',
      address: '88 Trade Street, Glasgow, G1 1AB'
    },
    recipient: {
      name: 'Emma Thompson',
      company: 'London Retail Group',
      email: 'emma@londonretail.co.uk',
      phone: '+44 20 7946 0958',
      address: '22 Oxford Street, London, W1D 1AN'
    },
    origin: 'Glasgow, UK',
    destination: 'London, UK',
    weight: '3.2 kg',
    shipmentDate: '2026-08-03',
    estimatedDelivery: '2026-08-10',
    currentLocation: 'Customs Clearance Centre, London',
    history: [
      { event: 'Order Received', status: 'completed', date: '2026-08-03 11:20', description: 'Shipment created' },
      { event: 'Shipment Processed', status: 'completed', date: '2026-08-04 09:00', description: 'Package sorted and labelled' },
      { event: 'In Transit', status: 'completed', date: '2026-08-05 07:30', description: 'Departed Glasgow facility' },
      { event: 'Customs Clearance', status: 'active', date: '2026-08-06 10:15', description: 'Awaiting customs processing – documents required' },
      { event: 'Out for Delivery', status: 'upcoming', date: null, description: 'Will be dispatched after customs release' },
      { event: 'Delivered', status: 'upcoming', date: null, description: 'Package delivered to recipient' },
    ],
    fees: {
      total: 35.00,
      currency: 'GBP',
      paid: false,
      breakdown: [
        { label: 'Customs Processing', amount: 25.00 },
        { label: 'Handling', amount: 10.00 },
      ]
    },
    documents: [
      { name: 'Commercial Invoice', url: '#', required: true },
      { name: 'Packing List', url: '#', required: true },
      { name: 'Proof of Value', url: '#', required: false },
    ]
  },
  'TCG-456789012345': {
    trackingNumber: 'TCG-456789012345',
    status: 'out_for_delivery',
    packageType: 'Express Parcel',
    sender: {
      name: 'Mark Davies',
      company: 'Birmingham Manufacturing',
      email: 'mark@birminghamman.co.uk',
      phone: '+44 121 555 0199',
      address: '45 Industrial Estate, Birmingham, B1 1AB'
    },
    recipient: {
      name: 'Lisa Brown',
      company: 'Liverpool Retail',
      email: 'lisa@liverpoolretail.co.uk',
      phone: '+44 151 555 0199',
      address: '12 Shopping Centre, Liverpool, L1 1AB'
    },
    origin: 'Birmingham, UK',
    destination: 'Liverpool, UK',
    weight: '1.5 kg',
    shipmentDate: '2026-08-04',
    estimatedDelivery: '2026-08-07',
    currentLocation: 'Liverpool Depot',
    history: [
      { event: 'Order Received', status: 'completed', date: '2026-08-04 08:00', description: 'Shipment created' },
      { event: 'Shipment Processed', status: 'completed', date: '2026-08-05 10:30', description: 'Package sorted and labelled' },
      { event: 'In Transit', status: 'completed', date: '2026-08-06 06:00', description: 'Departed Birmingham facility' },
      { event: 'Customs Clearance', status: 'completed', date: '2026-08-06 14:20', description: 'Customs cleared (domestic)' },
      { event: 'Out for Delivery', status: 'active', date: '2026-08-07 07:00', description: 'Out for delivery to recipient' },
      { event: 'Delivered', status: 'upcoming', date: null, description: 'Awaiting delivery confirmation' },
    ],
    fees: {
      total: 25.00,
      currency: 'GBP',
      paid: true,
      breakdown: [
        { label: 'Shipping', amount: 20.00 },
        { label: 'Handling', amount: 5.00 },
      ]
    },
    documents: [
      { name: 'Waybill', url: '#', required: true },
      { name: 'Packing List', url: '#', required: false },
    ]
  }
};

// Helper to get status info (unchanged)
const getStatusInfo = (status) => {
  const map = {
    ordered: { label: 'Order Received', color: 'text-[#2B0071]', bg: 'bg-[#2B0071]/10' },
    processed: { label: 'Processed', color: 'text-[#2B0071]', bg: 'bg-[#2B0071]/10' },
    in_transit: { label: 'In Transit', color: 'text-[#2B0071]', bg: 'bg-[#2B0071]/10' },
    customs: { label: 'Customs Clearance', color: 'text-[#FF5500]', bg: 'bg-[#FF5500]/10' },
    out_for_delivery: { label: 'Out for Delivery', color: 'text-[#2B0071]', bg: 'bg-[#2B0071]/10' },
    delivered: { label: 'Delivered', color: 'text-[#10B981]', bg: 'bg-[#10B981]/10' },
  };
  return map[status] || map.ordered;
};

function ShipmentDetailsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tracking = searchParams.get('tracking') || '';
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (tracking) {
      setLoading(true);
      setTimeout(() => {
        const data = mockShipments[tracking.toUpperCase()];
        if (data) {
          setShipment(data);
          setNotFound(false);
        } else {
          setShipment(null);
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

  const handleDownload = (docName) => {
    alert(`Downloading ${docName} (demo)`);
  };

  const handlePayFees = () => {
    alert('Proceeding to payment gateway (demo)');
  };

  const handleContactSupport = () => {
    alert('Opening support chat (demo)');
  };

  const handleViewDocuments = () => {
    alert('Showing required documents (demo)');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2B0071]/20 border-t-[#2B0071] rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-500">Loading shipment details...</p>
        </div>
      </div>
    );
  }

  if (notFound || !shipment) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px] flex items-center justify-center">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8 max-w-md text-center">
          <AlertCircle size={48} className="text-[#EF4444] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">Shipment not found</h3>
          <p className="text-gray-500">We couldn't find details for tracking number <strong>{tracking}</strong>.</p>
          <button onClick={goToTrack} className="mt-6 btn-primary">Go to Track Page</button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(shipment.status);

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

        {/* Header with status and actions */}
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8 mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="text-2xl font-bold text-[#1A1A2E]">Shipment Details</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                  {statusInfo.label}
                </span>
              </div>
              <p className="text-sm text-gray-500 font-mono">Tracking #: {shipment.trackingNumber}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => navigate(`/documents?tracking=${encodeURIComponent(tracking)}`)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#2B0071] bg-[#2B0071]/5 rounded-lg hover:bg-[#2B0071]/10 transition-colors"
              >
                <FileText size={16} />
                View Documents
              </button>
              <button
                onClick={() => handleDownload(shipment.documents[0]?.name || 'document')}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#2B0071] bg-[#2B0071]/5 rounded-lg hover:bg-[#2B0071]/10 transition-colors"
              >
                <Download size={16} />
                Download Docs
              </button>
              {!shipment.fees.paid && (
                <button
                  onClick={handlePayFees}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-[#FF5500] rounded-lg hover:bg-[#e64a00] transition-colors"
                >
                  <CreditCard size={16} />
                  Pay Fees
                </button>
              )}
              <button
                onClick={handleContactSupport}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-[#1A1A2E] border border-[#E2E5F0] rounded-lg hover:bg-[#F8F9FD] transition-colors"
              >
                <MessageCircle size={16} />
                Contact
              </button>
            </div>
          </div>
        </div>

        {/* Main content – unchanged */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipment info */}
            <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
                <Package size={20} className="text-[#2B0071]" />
                Shipment Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500">Package Type</div>
                  <div className="font-medium">{shipment.packageType}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Weight</div>
                  <div className="font-medium">{shipment.weight}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Shipment Date</div>
                  <div className="font-medium">{new Date(shipment.shipmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Estimated Delivery</div>
                  <div className="font-medium">{new Date(shipment.estimatedDelivery).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Origin</div>
                  <div className="font-medium flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#2B0071]/40" />
                    {shipment.origin}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Destination</div>
                  <div className="font-medium flex items-center gap-1.5">
                    <MapPin size={14} className="text-[#FF5500]" />
                    {shipment.destination}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Current Location</div>
                  <div className="font-medium">{shipment.currentLocation}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Fees</div>
                  <div className="font-medium">
                    {shipment.fees.total} {shipment.fees.currency}
                    {shipment.fees.paid ? (
                      <span className="ml-2 text-xs text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full">Paid</span>
                    ) : (
                      <span className="ml-2 text-xs text-[#FF5500] bg-[#FF5500]/10 px-2 py-0.5 rounded-full">Unpaid</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sender & Recipient */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6">
                <h4 className="text-sm font-bold text-[#1A1A2E] mb-3 flex items-center gap-2">
                  <User size={16} className="text-[#2B0071]" />
                  Sender
                </h4>
                <div className="space-y-1.5 text-sm">
                  <p className="font-medium">{shipment.sender.name}</p>
                  {shipment.sender.company && <p className="text-gray-500">{shipment.sender.company}</p>}
                  <p className="flex items-center gap-1.5 text-gray-500">
                    <Mail size={14} /> {shipment.sender.email}
                  </p>
                  <p className="flex items-center gap-1.5 text-gray-500">
                    <Phone size={14} /> {shipment.sender.phone}
                  </p>
                  <p className="text-gray-500 text-sm">{shipment.sender.address}</p>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6">
                <h4 className="text-sm font-bold text-[#1A1A2E] mb-3 flex items-center gap-2">
                  <User size={16} className="text-[#FF5500]" />
                  Recipient
                </h4>
                <div className="space-y-1.5 text-sm">
                  <p className="font-medium">{shipment.recipient.name}</p>
                  {shipment.recipient.company && <p className="text-gray-500">{shipment.recipient.company}</p>}
                  <p className="flex items-center gap-1.5 text-gray-500">
                    <Mail size={14} /> {shipment.recipient.email}
                  </p>
                  <p className="flex items-center gap-1.5 text-gray-500">
                    <Phone size={14} /> {shipment.recipient.phone}
                  </p>
                  <p className="text-gray-500 text-sm">{shipment.recipient.address}</p>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
                <FileText size={20} className="text-[#2B0071]" />
                Documents
              </h3>
              <div className="space-y-2">
                {shipment.documents.map((doc, idx) => (
                  <div key={idx} className="flex items-center justify-between py-2 border-b border-[#E2E5F0] last:border-0">
                    <div className="flex items-center gap-2">
                      <FileText size={16} className="text-[#2B0071]/40" />
                      <span className="font-medium text-sm">{doc.name}</span>
                      {doc.required && <span className="text-xs text-[#FF5500] bg-[#FF5500]/10 px-2 py-0.5 rounded-full">Required</span>}
                    </div>
                    <button
                      onClick={() => handleDownload(doc.name)}
                      className="text-xs font-medium text-[#2B0071] hover:text-[#FF5500] transition-colors"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleViewDocuments}
                className="mt-4 text-sm font-medium text-[#2B0071] hover:text-[#FF5500] transition-colors flex items-center gap-1"
              >
                <Info size={14} />
                View required documents
              </button>
            </div>
          </div>

          {/* Right column – unchanged */}
          <div className="space-y-6">
            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6">
              <h3 className="text-lg font-bold text-[#1A1A2E] mb-4 flex items-center gap-2">
                <Clock size={20} className="text-[#2B0071]" />
                Shipment History
              </h3>
              <div className="space-y-0">
                {shipment.history.map((step, index) => {
                  const isLast = index === shipment.history.length - 1;
                  const isCompleted = step.status === 'completed';
                  const isActive = step.status === 'active';
                  const isUpcoming = step.status === 'upcoming';

                  return (
                    <div key={index} className="flex gap-3">
                      <div className="flex flex-col items-center flex-shrink-0">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center bg-white border-2 border-[#E2E5F0] transition-all duration-300">
                          {isCompleted && <CheckCircle size={12} className="text-[#10B981]" />}
                          {isActive && <Circle size={12} className="text-[#2B0071] fill-[#2B0071]/20 animate-pulse" />}
                          {isUpcoming && <Circle size={12} className="text-[#E2E5F0]" />}
                        </div>
                        {!isLast && (
                          <div className={`w-0.5 flex-1 min-h-[20px] transition-colors duration-500 ${
                            isCompleted || isActive ? 'bg-[#2B0071]' : 'bg-[#E2E5F0]'
                          }`} />
                        )}
                      </div>
                      <div className="pb-4 pt-0.5 flex-1">
                        <div className={`text-sm font-medium ${isUpcoming ? 'text-gray-400' : 'text-[#1A1A2E]'}`}>
                          {step.event}
                        </div>
                        {step.date && (
                          <div className="text-xs text-gray-400">{step.date}</div>
                        )}
                        {step.description && (
                          <div className="text-xs text-gray-500 mt-0.5">{step.description}</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Fee breakdown */}
            <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6">
              <h4 className="text-sm font-bold text-[#1A1A2E] mb-3">Fee Breakdown</h4>
              <div className="space-y-1.5 text-sm">
                {shipment.fees.breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between border-b border-[#E2E5F0] pb-1.5">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium">{item.amount} {shipment.fees.currency}</span>
                  </div>
                ))}
                <div className="flex justify-between font-bold pt-1.5">
                  <span>Total</span>
                  <span>{shipment.fees.total} {shipment.fees.currency}</span>
                </div>
                {!shipment.fees.paid && (
                  <button
                    onClick={handlePayFees}
                    className="mt-3 w-full btn-primary text-sm py-2"
                  >
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShipmentDetailsPage;