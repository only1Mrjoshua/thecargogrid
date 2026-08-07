import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Package, Truck, Globe, MapPin, User, Mail, Phone,
  Building, Calendar, Clock, Info, AlertCircle, CheckCircle,
  CreditCard, Lock, ChevronRight, ChevronLeft, Shield,
  DollarSign, Home, Briefcase, Box, Ruler, Weight, FileText,
  Upload, Plus, Minus, X, Download, Receipt
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ----- Mock data for countries, states, cities (simplified) -----
const countries = ['United Kingdom', 'United States', 'Canada', 'Australia', 'Germany', 'France', 'Spain', 'Italy'];
const ukStates = ['England', 'Scotland', 'Wales', 'Northern Ireland'];
const cities = ['London', 'Manchester', 'Edinburgh', 'Glasgow', 'Birmingham', 'Liverpool', 'Bristol', 'Leeds'];
const packageCategories = ['Electronics', 'Clothing', 'Books', 'Fragile', 'Documents', 'Medical', 'Other'];

// ----- Step definitions -----
const steps = [
  { id: 'quote', label: 'Get Quote' },
  { id: 'sender', label: 'Sender' },
  { id: 'receiver', label: 'Receiver' },
  { id: 'package', label: 'Package' },
  { id: 'options', label: 'Options' },
  { id: 'additional', label: 'Services' },
  { id: 'review', label: 'Review' },
  { id: 'payment', label: 'Payment' },
  { id: 'success', label: 'Success' },
];

// ----- Main component -----
function ShipPage() {
  const navigate = useNavigate();
  
  // ----- State -----
  const [currentStep, setCurrentStep] = useState(0);
  const [quote, setQuote] = useState(null);
  const [isQuoteLoading, setIsQuoteLoading] = useState(false);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  // Form data across all steps
  const [formData, setFormData] = useState({
    // Quote
    originCountry: 'United Kingdom',
    originState: 'England',
    originCity: 'London',
    destCountry: 'United Kingdom',
    destState: 'England',
    destCity: 'Manchester',
    packageType: 'Electronics',
    weight: 2,
    length: 30,
    width: 20,
    height: 10,
    deliverySpeed: 'standard',
    insurance: false,
    estimatedValue: 100,

    // Sender
    senderName: '',
    senderCompany: '',
    senderEmail: '',
    senderPhone: '',
    senderCountry: 'United Kingdom',
    senderState: 'England',
    senderCity: 'London',
    senderStreet: '',
    senderPostal: '',
    pickupDate: '',
    pickupTime: '',
    pickupInstructions: '',

    // Receiver
    receiverName: '',
    receiverCompany: '',
    receiverEmail: '',
    receiverPhone: '',
    receiverCountry: 'United Kingdom',
    receiverState: 'England',
    receiverCity: 'Manchester',
    receiverStreet: '',
    receiverPostal: '',
    deliveryInstructions: '',

    // Package
    packageTitle: '',
    packageCategory: 'Electronics',
    packageDescription: '',
    packageCount: 1,
    packageWeight: 2,
    packageLength: 30,
    packageWidth: 20,
    packageHeight: 10,
    declaredValue: 100,
    isFragile: false,
    isDangerous: false,
    insuranceOption: false,
    packageImages: [],

    // Shipping Options (redundant but we store)
    shippingOption: 'standard',

    // Additional Services
    doorToDoor: false,
    pickupService: false,
    professionalPackaging: false,
    signatureOnDelivery: false,
    shipmentInsurance: false,
    customsAssistance: false,
    warehouseStorage: false,

    // Payment
    paymentMethod: 'card',
  });

  // ----- Handlers -----
  const updateForm = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  // ----- Quote calculation (mock) -----
  const calculateQuote = () => {
    setIsQuoteLoading(true);
    setTimeout(() => {
      const baseRate = 15;
      const weightFactor = formData.weight * 2.5;
      const distanceFactor = formData.destCity !== formData.originCity ? 10 : 5;
      let speedFactor = 0;
      if (formData.deliverySpeed === 'express') speedFactor = 20;
      else if (formData.deliverySpeed === 'priority') speedFactor = 35;
      const insuranceFee = formData.insurance ? formData.estimatedValue * 0.02 : 0;
      const handlingFee = 5;
      const shippingFee = baseRate + weightFactor + distanceFactor + speedFactor;
      const total = shippingFee + insuranceFee + handlingFee;

      let deliveryTime = '2-4 business days';
      if (formData.deliverySpeed === 'express') deliveryTime = '1-2 business days';
      if (formData.deliverySpeed === 'priority') deliveryTime = 'Next business day';

      setQuote({
        shippingFee: parseFloat(shippingFee.toFixed(2)),
        insuranceFee: parseFloat(insuranceFee.toFixed(2)),
        handlingFee: parseFloat(handlingFee.toFixed(2)),
        total: parseFloat(total.toFixed(2)),
        deliveryTime,
        currency: 'GBP',
      });
      setIsQuoteLoading(false);
      nextStep(); // Go to sender step
    }, 800);
  };

  // ----- Payment simulation -----
  const handlePayment = () => {
    setIsPaymentProcessing(true);
    setTimeout(() => {
      setIsPaymentProcessing(false);
      const newTracking = 'TCG-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      setTrackingNumber(newTracking);
      setBookingSuccess(true);
      setCurrentStep(8); // success step
      window.scrollTo(0, 0);
    }, 2000);
  };

  // ----- Reset form -----
  const resetForm = () => {
    // reset all fields (simplified)
    setFormData({ /* default values */ });
    setCurrentStep(0);
    setQuote(null);
    setBookingSuccess(false);
    setTrackingNumber('');
  };

  // ----- Render step content -----
  const renderStep = () => {
    switch (currentStep) {
      case 0: return renderQuoteStep();
      case 1: return renderSenderStep();
      case 2: return renderReceiverStep();
      case 3: return renderPackageStep();
      case 4: return renderShippingOptionsStep();
      case 5: return renderAdditionalServicesStep();
      case 6: return renderReviewStep();
      case 7: return renderPaymentStep();
      case 8: return renderSuccessStep();
      default: return null;
    }
  };

  // ----- STEP RENDERERS -----
  // Step 0: Get Quote
  const renderQuoteStep = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Get a Shipping Quote</h2>
          <p className="text-gray-500 text-sm mb-6">Fill in the details below to get an instant shipping estimate.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin */}
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Origin Country</label>
              <select value={formData.originCountry} onChange={e => updateForm('originCountry', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Origin State/Province</label>
              <select value={formData.originState} onChange={e => updateForm('originState', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
                {ukStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Origin City</label>
              <select value={formData.originCity} onChange={e => updateForm('originCity', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Destination Country</label>
              <select value={formData.destCountry} onChange={e => updateForm('destCountry', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
                {countries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Destination State/Province</label>
              <select value={formData.destState} onChange={e => updateForm('destState', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
                {ukStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Destination City</label>
              <select value={formData.destCity} onChange={e => updateForm('destCity', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Package Type</label>
              <select value={formData.packageType} onChange={e => updateForm('packageType', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
                {packageCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Weight (kg)</label>
              <input type="number" min="0.1" step="0.1" value={formData.weight} onChange={e => updateForm('weight', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Length (cm)</label>
              <input type="number" min="1" value={formData.length} onChange={e => updateForm('length', parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Width (cm)</label>
              <input type="number" min="1" value={formData.width} onChange={e => updateForm('width', parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Height (cm)</label>
              <input type="number" min="1" value={formData.height} onChange={e => updateForm('height', parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Delivery Speed</label>
              <select value={formData.deliverySpeed} onChange={e => updateForm('deliverySpeed', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
                <option value="standard">Standard (2-4 business days)</option>
                <option value="express">Express (1-2 business days)</option>
                <option value="priority">Priority (Next business day)</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formData.insurance} onChange={e => updateForm('insurance', e.target.checked)} className="w-4 h-4 accent-[#FF5500]" />
              Add Insurance
            </label>
            <div className="flex-1">
              <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Estimated Package Value (£)</label>
              <input type="number" min="0" step="10" value={formData.estimatedValue} onChange={e => updateForm('estimatedValue', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
            </div>
          </div>

          <button onClick={calculateQuote} disabled={isQuoteLoading} className="mt-6 w-full btn-primary py-3.5 flex items-center justify-center gap-2">
            {isQuoteLoading ? (
              <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Calculating...</>
            ) : (
              <><DollarSign size={18} /> Get Shipping Quote</>
            )}
          </button>
        </div>
      </div>

      {/* Quote Summary Sidebar */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sticky top-[100px]">
          <h3 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider mb-4">Quote Summary</h3>
          {quote ? (
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping Fee</span>
                <span className="font-medium">{quote.currency} {quote.shippingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Insurance Fee</span>
                <span className="font-medium">{quote.currency} {quote.insuranceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Handling Fee</span>
                <span className="font-medium">{quote.currency} {quote.handlingFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm border-t border-[#E2E5F0] pt-2">
                <span className="font-bold">Total</span>
                <span className="font-bold text-[#2B0071]">{quote.currency} {quote.total.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-400">Estimated delivery: {quote.deliveryTime}</div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Fill in the details and click "Get Shipping Quote"</p>
          )}
        </div>
      </div>
    </div>
  );

  // Step 1: Sender Information
  const renderSenderStep = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Sender Information</h2>
        <p className="text-gray-500 text-sm mb-6">Provide your contact and pickup details.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Full Name *</label>
            <input type="text" value={formData.senderName} onChange={e => updateForm('senderName', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Company (Optional)</label>
            <input type="text" value={formData.senderCompany} onChange={e => updateForm('senderCompany', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Email Address *</label>
            <input type="email" value={formData.senderEmail} onChange={e => updateForm('senderEmail', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Phone Number *</label>
            <input type="tel" value={formData.senderPhone} onChange={e => updateForm('senderPhone', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Country</label>
            <select value={formData.senderCountry} onChange={e => updateForm('senderCountry', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">State/Province</label>
            <select value={formData.senderState} onChange={e => updateForm('senderState', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
              {ukStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">City</label>
            <select value={formData.senderCity} onChange={e => updateForm('senderCity', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Street Address</label>
            <input type="text" value={formData.senderStreet} onChange={e => updateForm('senderStreet', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Postal Code</label>
            <input type="text" value={formData.senderPostal} onChange={e => updateForm('senderPostal', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Preferred Pickup Date</label>
            <input type="date" value={formData.pickupDate} onChange={e => updateForm('pickupDate', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Preferred Pickup Time</label>
            <input type="time" value={formData.pickupTime} onChange={e => updateForm('pickupTime', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Pickup Instructions (Optional)</label>
          <textarea rows="2" value={formData.pickupInstructions} onChange={e => updateForm('pickupInstructions', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
        </div>
        <div className="flex justify-end mt-6">
          <button onClick={nextStep} className="btn-primary">Continue →</button>
        </div>
      </div>
    </div>
  );

  // Step 2: Receiver Information
  const renderReceiverStep = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Receiver Information</h2>
        <p className="text-gray-500 text-sm mb-6">Provide the delivery destination details.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Full Name *</label>
            <input type="text" value={formData.receiverName} onChange={e => updateForm('receiverName', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Company (Optional)</label>
            <input type="text" value={formData.receiverCompany} onChange={e => updateForm('receiverCompany', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Email Address *</label>
            <input type="email" value={formData.receiverEmail} onChange={e => updateForm('receiverEmail', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Phone Number *</label>
            <input type="tel" value={formData.receiverPhone} onChange={e => updateForm('receiverPhone', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Country</label>
            <select value={formData.receiverCountry} onChange={e => updateForm('receiverCountry', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">State/Province</label>
            <select value={formData.receiverState} onChange={e => updateForm('receiverState', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
              {ukStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">City</label>
            <select value={formData.receiverCity} onChange={e => updateForm('receiverCity', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Street Address</label>
            <input type="text" value={formData.receiverStreet} onChange={e => updateForm('receiverStreet', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Postal Code</label>
            <input type="text" value={formData.receiverPostal} onChange={e => updateForm('receiverPostal', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Delivery Instructions (Optional)</label>
          <textarea rows="2" value={formData.deliveryInstructions} onChange={e => updateForm('deliveryInstructions', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
        </div>
        <div className="flex justify-between mt-6">
          <button onClick={prevStep} className="btn-secondary">← Back</button>
          <button onClick={nextStep} className="btn-primary">Continue →</button>
        </div>
      </div>
    </div>
  );

  // Step 3: Package Information
  const renderPackageStep = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Package Information</h2>
        <p className="text-gray-500 text-sm mb-6">Describe the shipment.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Package Title *</label>
            <input type="text" value={formData.packageTitle} onChange={e => updateForm('packageTitle', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Package Category</label>
            <select value={formData.packageCategory} onChange={e => updateForm('packageCategory', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
              {packageCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Description</label>
            <textarea rows="2" value={formData.packageDescription} onChange={e => updateForm('packageDescription', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Number of Packages</label>
            <input type="number" min="1" value={formData.packageCount} onChange={e => updateForm('packageCount', parseInt(e.target.value) || 1)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Weight (kg)</label>
            <input type="number" step="0.1" value={formData.packageWeight} onChange={e => updateForm('packageWeight', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Length (cm)</label>
            <input type="number" value={formData.packageLength} onChange={e => updateForm('packageLength', parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Width (cm)</label>
            <input type="number" value={formData.packageWidth} onChange={e => updateForm('packageWidth', parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Height (cm)</label>
            <input type="number" value={formData.packageHeight} onChange={e => updateForm('packageHeight', parseInt(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Declared Value (£)</label>
            <input type="number" min="0" step="10" value={formData.declaredValue} onChange={e => updateForm('declaredValue', parseFloat(e.target.value) || 0)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]" />
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.isFragile} onChange={e => updateForm('isFragile', e.target.checked)} className="w-4 h-4 accent-[#FF5500]" />
            This is a fragile item
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.isDangerous} onChange={e => updateForm('isDangerous', e.target.checked)} className="w-4 h-4 accent-[#FF5500]" />
            This contains dangerous goods
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={formData.insuranceOption} onChange={e => updateForm('insuranceOption', e.target.checked)} className="w-4 h-4 accent-[#FF5500]" />
            Add shipment insurance
          </label>
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Upload Package Images (Optional)</label>
          <div className="border-2 border-dashed border-[#E2E5F0] rounded-xl p-4 text-center cursor-pointer hover:bg-[#F8F9FD] transition-colors">
            <Upload size={24} className="mx-auto text-gray-400" />
            <p className="text-sm text-gray-500 mt-1">Click to upload or drag and drop</p>
          </div>
        </div>
        <div className="flex justify-between mt-6">
          <button onClick={prevStep} className="btn-secondary">← Back</button>
          <button onClick={nextStep} className="btn-primary">Continue →</button>
        </div>
      </div>
    </div>
  );

  // Step 4: Shipping Options
  const renderShippingOptionsStep = () => (
    <div className="max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
        <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Shipping Options</h2>
        <p className="text-gray-500 text-sm mb-6">Choose your preferred delivery service.</p>
        <div className="space-y-4">
          {['standard', 'express', 'priority'].map((speed) => {
            const isSelected = formData.shippingOption === speed;
            const prices = { standard: 0, express: 20, priority: 35 };
            const times = { standard: '2-4 business days', express: '1-2 business days', priority: 'Next business day' };
            const labels = { standard: 'Standard', express: 'Express', priority: 'Priority' };
            return (
              <div key={speed} onClick={() => updateForm('shippingOption', speed)} className={`border-2 rounded-xl p-4 cursor-pointer transition-all ${isSelected ? 'border-[#FF5500] bg-[#FF5500]/5' : 'border-[#E2E5F0] hover:border-[#2B0071]/30'}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-[#1A1A2E]">{labels[speed]}</h4>
                    <p className="text-sm text-gray-500">Estimated delivery: {times[speed]}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-[#2B0071]">+£{prices[speed]}</p>
                    <p className="text-xs text-gray-400">Includes tracking</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-6">
          <button onClick={prevStep} className="btn-secondary">← Back</button>
          <button onClick={nextStep} className="btn-primary">Continue →</button>
        </div>
      </div>
    </div>
  );

  // Step 5: Additional Services
  const renderAdditionalServicesStep = () => {
    const services = [
      { key: 'doorToDoor', label: 'Door-to-Door Delivery', price: 10 },
      { key: 'pickupService', label: 'Pickup Service', price: 8 },
      { key: 'professionalPackaging', label: 'Professional Packaging', price: 12 },
      { key: 'signatureOnDelivery', label: 'Signature on Delivery', price: 5 },
      { key: 'shipmentInsurance', label: 'Shipment Insurance', price: 15 },
      { key: 'customsAssistance', label: 'Customs Documentation Assistance', price: 20 },
      { key: 'warehouseStorage', label: 'Warehouse Storage (per day)', price: 7 },
    ];
    return (
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Additional Services</h2>
          <p className="text-gray-500 text-sm mb-6">Customise your shipment with optional extras.</p>
          <div className="space-y-3">
            {services.map((svc) => (
              <label key={svc.key} className="flex items-center justify-between p-3 border border-[#E2E5F0] rounded-xl hover:bg-[#F8F9FD] transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked={formData[svc.key]} onChange={() => updateForm(svc.key, !formData[svc.key])} className="w-4 h-4 accent-[#FF5500]" />
                  <span className="text-sm font-medium">{svc.label}</span>
                </div>
                <span className="text-sm text-gray-500">+£{svc.price}</span>
              </label>
            ))}
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={prevStep} className="btn-secondary">← Back</button>
            <button onClick={nextStep} className="btn-primary">Continue →</button>
          </div>
        </div>
      </div>
    );
  };

  // Step 6: Review
  const renderReviewStep = () => {
    // Calculate total with additional services
    const servicePrices = {
      doorToDoor: 10, pickupService: 8, professionalPackaging: 12,
      signatureOnDelivery: 5, shipmentInsurance: 15, customsAssistance: 20, warehouseStorage: 7
    };
    let extraTotal = 0;
    Object.keys(servicePrices).forEach(key => {
      if (formData[key]) extraTotal += servicePrices[key];
    });
    const shippingPrice = { standard: 0, express: 20, priority: 35 }[formData.shippingOption] || 0;
    const totalCost = (quote ? quote.total : 0) + extraTotal + shippingPrice;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Review Your Shipment</h2>
          <p className="text-gray-500 text-sm mb-6">Verify all information before proceeding to payment.</p>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-[#2B0071]">Sender</h4>
                <p className="text-sm">{formData.senderName}<br />{formData.senderEmail}<br />{formData.senderPhone}<br />{formData.senderStreet}, {formData.senderCity}, {formData.senderState}</p>
              </div>
              <div>
                <h4 className="font-semibold text-[#2B0071]">Receiver</h4>
                <p className="text-sm">{formData.receiverName}<br />{formData.receiverEmail}<br />{formData.receiverPhone}<br />{formData.receiverStreet}, {formData.receiverCity}, {formData.receiverState}</p>
              </div>
            </div>
            <div className="border-t border-[#E2E5F0] pt-4">
              <h4 className="font-semibold text-[#2B0071]">Package Summary</h4>
              <p className="text-sm">{formData.packageTitle} – {formData.packageCategory}<br />Weight: {formData.packageWeight} kg, Dimensions: {formData.packageLength}×{formData.packageWidth}×{formData.packageHeight} cm</p>
            </div>
            <div className="border-t border-[#E2E5F0] pt-4">
              <h4 className="font-semibold text-[#2B0071]">Shipping Method</h4>
              <p className="text-sm capitalize">{formData.shippingOption} – {quote?.deliveryTime || 'N/A'}</p>
            </div>
            <div className="border-t border-[#E2E5F0] pt-4">
              <h4 className="font-semibold text-[#2B0071]">Additional Services</h4>
              {Object.keys(servicePrices).filter(k => formData[k]).length === 0 ? <p className="text-sm text-gray-400">None selected</p> :
                <ul className="text-sm list-disc pl-4">{Object.keys(servicePrices).filter(k => formData[k]).map(k => <li key={k}>{k.replace(/([A-Z])/g, ' $1').trim()}</li>)}</ul>
              }
            </div>
            <div className="border-t border-[#E2E5F0] pt-4">
              <h4 className="font-semibold text-[#2B0071]">Cost Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between"><span>Shipping Fee</span><span>£{quote?.shippingFee || 0}</span></div>
                <div className="flex justify-between"><span>Insurance Fee</span><span>£{quote?.insuranceFee || 0}</span></div>
                <div className="flex justify-between"><span>Handling Fee</span><span>£{quote?.handlingFee || 0}</span></div>
                <div className="flex justify-between"><span>Shipping Option</span><span>£{shippingPrice}</span></div>
                <div className="flex justify-between"><span>Additional Services</span><span>£{extraTotal}</span></div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-[#E2E5F0]"><span>Grand Total</span><span>£{totalCost.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
          <div className="flex justify-between mt-6">
            <button onClick={prevStep} className="btn-secondary">← Back</button>
            <button onClick={nextStep} className="btn-primary">Proceed to Payment →</button>
          </div>
        </div>
      </div>
    );
  };

  // Step 7: Payment
  const renderPaymentStep = () => {
    const servicePrices = {
      doorToDoor: 10, pickupService: 8, professionalPackaging: 12,
      signatureOnDelivery: 5, shipmentInsurance: 15, customsAssistance: 20, warehouseStorage: 7
    };
    let extraTotal = 0;
    Object.keys(servicePrices).forEach(key => {
      if (formData[key]) extraTotal += servicePrices[key];
    });
    const shippingPrice = { standard: 0, express: 20, priority: 35 }[formData.shippingOption] || 0;
    const totalCost = (quote ? quote.total : 0) + extraTotal + shippingPrice;

    return (
      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
            <h2 className="text-2xl font-bold text-[#1A1A2E] mb-2">Secure Payment</h2>
            <p className="text-gray-500 text-sm mb-6">Complete your payment to confirm the shipment.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A2E] mb-1.5">Payment Method</label>
                <select value={formData.paymentMethod} onChange={e => updateForm('paymentMethod', e.target.value)} className="w-full px-4 py-2.5 border border-[#E2E5F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5500]/20 focus:border-[#FF5500]">
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="stripe">Stripe</option>
                  <option value="flutterwave">Flutterwave</option>
                  <option value="paystack">Paystack</option>
                  <option value="applepay">Apple Pay</option>
                  <option value="googlepay">Google Pay</option>
                </select>
              </div>
              <div className="p-4 bg-[#F8F9FD] rounded-xl border border-[#E2E5F0]">
                <p className="text-sm font-medium text-[#1A1A2E]">Billing Summary</p>
                <div className="flex justify-between text-sm"><span>Total Amount</span><span className="font-bold">£{totalCost.toFixed(2)}</span></div>
                <p className="text-xs text-gray-400 mt-1">Booking ref: SHIP-{Date.now().toString().slice(-6)}</p>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <Lock size={16} className="text-[#10B981]" /> Your payment is secure and encrypted.
              </div>
              <button onClick={handlePayment} disabled={isPaymentProcessing} className="w-full btn-primary py-3.5 flex items-center justify-center gap-2">
                {isPaymentProcessing ? (
                  <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
                ) : (
                  <><CreditCard size={18} /> Pay Securely</>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sticky top-[100px]">
            <h3 className="text-sm font-bold text-[#1A1A2E] uppercase tracking-wider mb-4">Order Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Booking Ref</span><span className="font-mono">SHIP-{Date.now().toString().slice(-6)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Sender</span><span>{formData.senderName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Total</span><span className="font-bold">£{totalCost.toFixed(2)}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Step 8: Success
  const renderSuccessStep = () => (
    <div className="max-w-2xl mx-auto text-center">
      <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-8">
        <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle size={32} className="text-[#10B981]" />
        </div>
        <h2 className="text-2xl font-bold text-[#1A1A2E]">Shipment Booked!</h2>
        <p className="text-gray-600 mt-2">Your shipment has been successfully created.</p>
        <div className="mt-6 bg-[#F8F9FD] rounded-xl p-4 text-left space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-gray-500">Tracking Number</span><span className="font-mono font-bold text-[#2B0071]">{trackingNumber}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Booking Reference</span><span className="font-mono">SHIP-{Date.now().toString().slice(-6)}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Pickup Date</span><span>{formData.pickupDate || 'To be confirmed'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Estimated Delivery</span><span>{quote?.deliveryTime || 'N/A'}</span></div>
          <div className="flex justify-between"><span className="text-gray-500">Status</span><span className="text-[#2B0071] font-semibold">Order Received</span></div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3 justify-center">
          <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#2B0071] border border-[#2B0071] rounded-xl hover:bg-[#2B0071] hover:text-white transition-colors"><Download size={16} /> Download Invoice</button>
          <button className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-[#2B0071] border border-[#2B0071] rounded-xl hover:bg-[#2B0071] hover:text-white transition-colors"><Receipt size={16} /> Download Receipt</button>
          <button onClick={() => navigate(`/track?tracking=${trackingNumber}`)} className="btn-primary text-sm py-2.5">Track Shipment</button>
          <button onClick={resetForm} className="btn-secondary text-sm py-2.5">Book Another Shipment</button>
        </div>
      </div>
    </div>
  );

  // ----- Main render -----
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[#F8F9FD] pt-[72px]">
        <div className="container-custom py-8 md:py-12">
          {/* Back button to home */}
          <button onClick={() => navigate('/')} className="inline-flex items-center gap-2 text-sm font-medium text-[#2B0071]/70 hover:text-[#2B0071] transition-colors duration-200 mb-6 group">
            <ArrowLeft size={16} className="transition-transform duration-200 group-hover:-translate-x-1" />
            Back to Home
          </button>

          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1A1A2E] flex items-center gap-3">
              <Package size={32} className="text-[#2B0071]" />
              Ship a Package
            </h1>
            <p className="text-gray-500">Get a quote, book your shipment, and track it in real‑time.</p>
          </div>

          {/* Stepper (if not on quote or success steps, but we show all) */}
          {currentStep < 8 && currentStep > 0 && (
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
              {steps.slice(1, 8).map((step, idx) => {
                const stepIndex = idx + 1;
                const isActive = currentStep === stepIndex;
                const isPast = currentStep > stepIndex;
                return (
                  <div key={step.id} className="flex items-center gap-1 text-xs whitespace-nowrap">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${isPast ? 'bg-[#10B981] text-white' : isActive ? 'bg-[#2B0071] text-white' : 'bg-[#E2E5F0] text-gray-400'}`}>
                      {isPast ? <CheckCircle size={14} /> : stepIndex}
                    </div>
                    <span className={`${isActive ? 'font-semibold text-[#2B0071]' : 'text-gray-400'}`}>{step.label}</span>
                    {stepIndex < 7 && <span className="text-gray-300">→</span>}
                  </div>
                );
              })}
            </div>
          )}

          {/* Step content */}
          <div className="mt-4">
            {renderStep()}
          </div>

          {/* Trust & FAQ (only show before success) */}
          {currentStep < 8 && (
            <div className="mt-12 max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
                <h3 className="text-lg font-bold text-[#1A1A2E] flex items-center gap-2 mb-4">
                  <Shield size={20} className="text-[#2B0071]" />
                  Secure & Trusted Payment
                </h3>
                <p className="text-sm text-gray-600">All payments are processed through industry‑standard secure gateways. Your financial information is never stored on our servers.</p>
                <div className="flex flex-wrap gap-4 mt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1"><Lock size={14} /> PCI Compliant</span>
                  <span className="flex items-center gap-1"><CheckCircle size={14} className="text-[#10B981]" /> Encrypted</span>
                  <span className="flex items-center gap-1"><Shield size={14} /> Fraud Protection</span>
                </div>
              </div>
              <div className="mt-6 bg-white rounded-2xl border border-[#E2E5F0] shadow-card p-6 sm:p-8">
                <h3 className="text-lg font-bold text-[#1A1A2E] flex items-center gap-2 mb-4">
                  <Info size={20} className="text-[#2B0071]" />
                  Frequently Asked Questions (Shipping)
                </h3>
                <div className="space-y-3 text-sm">
                  <details className="border-b border-[#E2E5F0] pb-2">
                    <summary className="font-semibold cursor-pointer text-[#1A1A2E]">How do I get a shipping quote?</summary>
                    <p className="text-gray-600 mt-1">Fill in the origin, destination, package type, weight, and dimensions. Click "Get Shipping Quote" to see the estimated cost.</p>
                  </details>
                  <details className="border-b border-[#E2E5F0] pb-2">
                    <summary className="font-semibold cursor-pointer text-[#1A1A2E]">What payment methods do you accept?</summary>
                    <p className="text-gray-600 mt-1">We accept credit/debit cards, bank transfers, PayPal, Stripe, Flutterwave, Paystack, Apple Pay, and Google Pay.</p>
                  </details>
                  <details className="border-b border-[#E2E5F0] pb-2">
                    <summary className="font-semibold cursor-pointer text-[#1A1A2E]">When will my package be picked up?</summary>
                    <p className="text-gray-600 mt-1">You can select your preferred pickup date and time during booking. We’ll confirm the exact time via email.</p>
                  </details>
                </div>
              </div>
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-500">Need help? <button onClick={() => navigate('/contact')} className="text-[#FF5500] hover:underline">Contact Support</button></p>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ShipPage;