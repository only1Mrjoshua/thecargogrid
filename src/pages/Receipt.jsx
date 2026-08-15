import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  Printer,
  Download,
  Calendar,
  Clock,
  MapPin,
  Users,
  DollarSign,
  ArrowLeft
} from 'lucide-react';

const Receipt = () => {
  const { trackingId } = useParams();
  const navigate = useNavigate();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trackingId) {
      setTimeout(() => {
        setShipment({
          id: trackingId,
          customer: 'Lee Jun ho',
          email: 'realjunho1990@gmail.com',
          phone: '+1 818 278 0024',
          origin: 'Los Angeles, USA',
          destination: 'Sydney, Australia',
          status: 'In Transit',
          payment: 'Paid',
          date: '2026-08-15',
          expectedDelivery: '2026-08-30',
          weight: '1900 kg',
          packageType: 'Freight - Vehicle & Safe Box',
          description: 'High-value international freight...',
          fees: {
            total: 6300.00,
            currency: 'USD',
            paid: true,
            breakdown: [
              { label: 'International Freight (Vehicle + Safe Box)', amount: 4000.00 },
              { label: 'Special Handling & Security Escort', amount: 1500.00 },
              { label: 'Additional Insurance Premium (High-Value Cargo)', amount: 800.00 }
            ]
          },
          steps: [
            { event: 'Order Received', status: 'completed', date: '2026-08-11' },
            { event: 'Shipment Processed', status: 'completed', date: '2026-08-12' },
            { event: 'In Transit', status: 'active', date: new Date().toISOString() }
          ]
        });
        setLoading(false);
      }, 500);
    } else {
      setShipment({
        id: 'TCG-123456789012',
        customer: 'Lee Jun ho',
        email: 'realjunho1990@gmail.com',
        phone: '+1 818 278 0024',
        origin: 'Los Angeles, USA',
        destination: 'Sydney, Australia',
        status: 'In Transit',
        payment: 'Paid',
        date: '2026-08-15',
        expectedDelivery: '2026-08-30',
        weight: '1900 kg',
        packageType: 'Freight - Vehicle & Safe Box',
        description: 'High-value international freight...',
        fees: {
          total: 6300.00,
          currency: 'USD',
          paid: true,
          breakdown: [
            { label: 'International Freight (Vehicle + Safe Box)', amount: 4000.00 },
            { label: 'Special Handling & Security Escort', amount: 1500.00 },
            { label: 'Additional Insurance Premium (High-Value Cargo)', amount: 800.00 }
          ]
        },
        steps: [
          { event: 'Order Received', status: 'completed', date: '2026-08-11' },
          { event: 'Shipment Processed', status: 'completed', date: '2026-08-12' },
          { event: 'In Transit', status: 'active', date: new Date().toISOString() }
        ]
      });
      setLoading(false);
    }
  }, [trackingId]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error || !shipment) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md text-center">
          <p className="text-red-600">{error || 'Receipt not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const { fees } = shipment;
  const total = fees.total || 0;
  const currency = fees.currency || 'USD';

  const paymentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Back & Actions */}
        <div className="flex justify-between items-center mb-6 no-print">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-blue-600 transition-colors group"
          >
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-100 transition-colors">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Receipt Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8" id="receipt">
          <div className="space-y-6">
            {/* Header with Logo */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-4">
              <div className="flex items-center gap-3">
                <img src="/logo.png" alt="The Cargo Grid" className="h-12 w-auto" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Payment Receipt</h1>
                  <p className="text-gray-600 text-base">
                    Receipt for shipment <span className="font-mono font-semibold">{shipment.id}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-2 sm:mt-0">
                <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Payment Confirmed
                </div>
              </div>
            </div>

            {/* Payment summary */}
            <div className="grid sm:grid-cols-3 gap-4 bg-blue-50/50 rounded-xl p-4 border border-blue-100">
              <div>
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="text-2xl font-bold text-gray-900">
                  {currency} {total.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Payment Date</p>
                <p className="text-base font-medium text-gray-900 flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                  {paymentDate}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Transaction ID</p>
                <p className="text-base font-mono font-medium text-gray-900 truncate">
                  TXN-{shipment.id.slice(-8)}
                </p>
              </div>
            </div>

            {/* Shipment details */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-1 text-blue-600" />
                  Sender
                </h3>
                <p className="text-base text-gray-900 font-medium">{shipment.customer}</p>
                <p className="text-sm text-gray-500">{shipment.email}</p>
                <p className="text-sm text-gray-500">{shipment.phone}</p>
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900 mb-2 flex items-center">
                  <MapPin className="w-4 h-4 mr-1 text-blue-600" />
                  Recipient
                </h3>
                <p className="text-base text-gray-900 font-medium">Eluisa Bean</p>
                <p className="text-sm text-gray-500">eluisatbean@gmail.com</p>
                <p className="text-sm text-gray-500">+61 448 004 779</p>
                <p className="text-sm text-gray-500">Sydney, Australia</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 border-t border-gray-200 pt-4">
              <div>
                <p className="text-sm text-gray-500">Origin</p>
                <p className="text-base font-medium text-gray-900">{shipment.origin}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Destination</p>
                <p className="text-base font-medium text-gray-900">{shipment.destination}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Package Type</p>
                <p className="text-base font-medium text-gray-900">{shipment.packageType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Weight</p>
                <p className="text-base font-medium text-gray-900">{shipment.weight}</p>
              </div>
            </div>

            {/* Fee breakdown */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3 flex items-center">
                <DollarSign className="w-4 h-4 mr-1 text-blue-600" />
                Fee Breakdown
              </h3>
              <div className="space-y-2">
                {fees.breakdown?.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-base">
                    <span className="text-gray-600">{item.label}</span>
                    <span className="font-medium text-gray-900">
                      {currency} {item.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="flex justify-between text-base font-bold border-t border-gray-200 pt-2">
                  <span>Total</span>
                  <span className="text-gray-900">
                    {currency} {total.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Notes */}
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center gap-2 text-base text-gray-600">
                <Clock className="w-4 h-4 text-gray-400" />
                Payment confirmed on {paymentDate}
              </div>
              <p className="text-sm text-gray-500 mt-2">
                <span className="font-medium">Note:</span> This receipt serves as confirmation of payment for shipment {shipment.id}. For any inquiries, please contact support.
              </p>
            </div>
          </div>

          {/* Footer with Logo and Thank You */}
          <div className="mt-8 pt-4 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-gray-500 no-print">
            <div className="flex items-center gap-2">
              <span>Thank you for choosing</span>
              <img src="/logo.png" alt="The Cargo Grid" className="h-10 w-auto" />
            </div>
            <span>© 1995-{new Date().getFullYear()} The Cargo Grid. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Receipt;