import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  MapPin, Calendar, Clock, Package, Truck, 
  CheckCircle, Circle, AlertCircle, ArrowLeft,
  ChevronRight
} from 'lucide-react';
import TrackingForm from '../components/TrackingForm';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ----- Mock shipment data with 12-digit TCG tracking numbers -----
const mockShipments = {
  'TCG-123456789012': {
    status: 'in_transit',
    origin: 'London, UK',
    destination: 'Edinburgh, UK',
    shipmentDate: '2026-08-01',
    estimatedDelivery: '2026-08-08',
    currentLocation: 'Manchester Hub',
    steps: [
      { label: 'Order Received', status: 'completed', date: '2026-08-01 09:30' },
      { label: 'Shipment Processed', status: 'completed', date: '2026-08-02 14:15' },
      { label: 'In Transit', status: 'active', date: '2026-08-03 08:45' },
      { label: 'Customs Clearance', status: 'upcoming' },
      { label: 'Out for Delivery', status: 'upcoming' },
      { label: 'Delivered', status: 'upcoming' },
    ]
  },
  'TCG-234567890123': {
    status: 'delivered',
    origin: 'Manchester, UK',
    destination: 'Bristol, UK',
    shipmentDate: '2026-07-28',
    estimatedDelivery: '2026-08-02',
    currentLocation: 'Bristol Delivery Centre',
    steps: [
      { label: 'Order Received', status: 'completed', date: '2026-07-28 10:00' },
      { label: 'Shipment Processed', status: 'completed', date: '2026-07-29 08:30' },
      { label: 'In Transit', status: 'completed', date: '2026-07-30 06:15' },
      { label: 'Customs Clearance', status: 'completed', date: '2026-07-31 12:00' },
      { label: 'Out for Delivery', status: 'completed', date: '2026-08-01 09:00' },
      { label: 'Delivered', status: 'completed', date: '2026-08-02 14:30' },
    ]
  },
  'TCG-345678901234': {
    status: 'customs',
    origin: 'Glasgow, UK',
    destination: 'London, UK',
    shipmentDate: '2026-08-03',
    estimatedDelivery: '2026-08-10',
    currentLocation: 'Customs Clearance',
    steps: [
      { label: 'Order Received', status: 'completed', date: '2026-08-03 11:20' },
      { label: 'Shipment Processed', status: 'completed', date: '2026-08-04 09:00' },
      { label: 'In Transit', status: 'completed', date: '2026-08-05 07:30' },
      { label: 'Customs Clearance', status: 'active', date: '2026-08-06 10:15' },
      { label: 'Out for Delivery', status: 'upcoming' },
      { label: 'Delivered', status: 'upcoming' },
    ]
  },
  'TCG-456789012345': {
    status: 'out_for_delivery',
    origin: 'Birmingham, UK',
    destination: 'Liverpool, UK',
    shipmentDate: '2026-08-04',
    estimatedDelivery: '2026-08-07',
    currentLocation: 'Liverpool Depot',
    steps: [
      { label: 'Order Received', status: 'completed', date: '2026-08-04 08:00' },
      { label: 'Shipment Processed', status: 'completed', date: '2026-08-05 10:30' },
      { label: 'In Transit', status: 'completed', date: '2026-08-06 06:00' },
      { label: 'Customs Clearance', status: 'completed', date: '2026-08-06 14:20' },
      { label: 'Out for Delivery', status: 'active', date: '2026-08-07 07:00' },
      { label: 'Delivered', status: 'upcoming' },
    ]
  }
};

// Helper functions (unchanged)
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

const StepIcon = ({ status }) => {
  switch (status) {
    case 'completed':
      return <CheckCircle size={18} className="text-[#10B981]" />;
    case 'active':
      return <Circle size={18} className="text-[#2B0071] fill-[#2B0071]/20 animate-pulse" />;
    case 'upcoming':
      return <Circle size={18} className="text-[#E2E5F0]" />;
    default:
      return <Circle size={18} className="text-[#E2E5F0]" />;
  }
};

function TrackPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const trackingParam = searchParams.get('tracking') || '';
  const [trackingNumber, setTrackingNumber] = useState(trackingParam);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shipment, setShipment] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (trackingParam) {
      const data = mockShipments[trackingParam.toUpperCase()];
      if (data) {
        setShipment(data);
        setNotFound(false);
        setError('');
      } else {
        setShipment(null);
        setNotFound(true);
        setError('We couldn\'t find a shipment with that tracking number. Please check the number and try again.');
      }
    } else {
      setShipment(null);
      setNotFound(false);
    }
  }, [trackingParam]);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingNumber.trim()) {
      setError('Please enter your tracking number.');
      return;
    }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSearchParams({ tracking: trackingNumber.trim() });
    }, 600);
  };

  const handleInputChange = (e) => {
    setTrackingNumber(e.target.value);
    if (error) setError('');
  };

  return (
    <>
      <Navbar />
      <div className="bg-[#F8F9FD] pt-[72px]">
        <div className="container-custom py-8 md:py-12">
          {/* Tracking Form */}
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
              <h1 className="heading-section text-[#1A1A2E] text-2xl sm:text-3xl mb-2">
                Track Your Shipment
              </h1>
              <p className="body-small mb-6">
                Enter your tracking number to get real‑time status updates.
              </p>
              <TrackingForm
                trackingNumber={trackingNumber}
                onTrackingChange={handleInputChange}
                onSubmit={handleTrack}
                error={error}
                isLoading={isLoading}
                compact={false}
                label=""
              />
            </div>
          </div>

          {/* Shipment Details – only when data exists */}
          {shipment && !notFound && (
            <div className="max-w-4xl mx-auto mt-10 space-y-8">
              {/* Status header */}
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getStatusInfo(shipment.status).bg} ${getStatusInfo(shipment.status).color}`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                        {getStatusInfo(shipment.status).label}
                      </span>
                      <span className="text-xs text-gray-400 font-mono">{trackingParam}</span>
                    </div>
                    <h2 className="text-xl font-bold text-[#1A1A2E]">
                      {shipment.origin} → {shipment.destination}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Current Location</div>
                    <div className="font-semibold text-[#1A1A2E] flex items-center gap-1.5 justify-end">
                      <MapPin size={16} className="text-[#FF5500]" />
                      {shipment.currentLocation}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-[#E2E5F0]">
                  <div>
                    <div className="text-xs text-gray-500">Shipment Date</div>
                    <div className="font-medium text-sm flex items-center gap-1.5 mt-0.5">
                      <Calendar size={14} className="text-[#2B0071]/40" />
                      {new Date(shipment.shipmentDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Est. Delivery</div>
                    <div className="font-medium text-sm flex items-center gap-1.5 mt-0.5">
                      <Calendar size={14} className="text-[#FF5500]" />
                      {new Date(shipment.estimatedDelivery).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Origin</div>
                    <div className="font-medium text-sm flex items-center gap-1.5 mt-0.5">
                      <MapPin size={14} className="text-[#2B0071]/40" />
                      {shipment.origin}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Destination</div>
                    <div className="font-medium text-sm flex items-center gap-1.5 mt-0.5">
                      <MapPin size={14} className="text-[#2B0071]/40" />
                      {shipment.destination}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap items-center justify-end gap-4">
                {shipment.status === 'customs' && (
                  <button
                    onClick={() => navigate(`/customs?tracking=${encodeURIComponent(trackingParam)}`)}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#FF5500] hover:text-[#2B0071] transition-colors duration-200 group"
                  >
                    View customs hold details
                    <ChevronRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                  </button>
                )}
                <button
                  onClick={() => navigate(`/shipment?tracking=${encodeURIComponent(trackingParam)}`)}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#2B0071] hover:text-[#FF5500] transition-colors duration-200 group"
                >
                  View full shipment details
                  <ChevronRight size={16} className="transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </div>

              {/* Timeline */}
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
                <h3 className="text-lg font-bold text-[#1A1A2E] mb-6 flex items-center gap-2">
                  <Clock size={20} className="text-[#2B0071]" />
                  Shipment Timeline
                </h3>
                <div className="space-y-0 relative">
                  {shipment.steps.map((step, index) => {
                    const isLast = index === shipment.steps.length - 1;
                    const isCompleted = step.status === 'completed';
                    const isActive = step.status === 'active';
                    const isUpcoming = step.status === 'upcoming';
                    return (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center flex-shrink-0">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white border-2 border-[#E2E5F0] transition-all duration-300">
                            <StepIcon status={step.status} />
                          </div>
                          {!isLast && (
                            <div className={`w-0.5 flex-1 min-h-[28px] transition-colors duration-500 ${
                              isCompleted || isActive ? 'bg-[#2B0071]' : 'bg-[#E2E5F0]'
                            }`} />
                          )}
                        </div>
                        <div className="pb-6 pt-0.5 flex-1">
                          <div className={`text-sm font-semibold ${isUpcoming ? 'text-gray-400' : 'text-[#1A1A2E]'}`}>
                            {step.label}
                            {step.status === 'active' && (
                              <span className="ml-2 text-xs font-normal text-[#2B0071] bg-[#2B0071]/5 px-2 py-0.5 rounded-full">
                                In progress
                              </span>
                            )}
                            {step.status === 'upcoming' && (
                              <span className="ml-2 text-xs font-normal text-gray-400">Pending</span>
                            )}
                          </div>
                          {step.date && (
                            <div className="text-xs text-gray-400 mt-0.5">{step.date}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Not found / empty state */}
          {notFound && !shipment && trackingParam && (
            <div className="max-w-3xl mx-auto mt-10 text-center">
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8">
                <AlertCircle size={48} className="text-[#EF4444] mx-auto mb-4" />
                <h3 className="text-xl font-bold text-[#1A1A2E] mb-2">No shipment found</h3>
                <p className="text-gray-500">We couldn’t find any shipment with the tracking number <strong>{trackingParam}</strong>.</p>
                <p className="text-gray-400 text-sm mt-2">Please double‑check the number and try again.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default TrackPage;