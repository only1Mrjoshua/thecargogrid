import { createContext, useContext, useState, useEffect } from 'react';

const ShipmentContext = createContext();

const generateId = () => 'doc-' + Math.random().toString(36).substring(2, 10);

const initialMockShipments = [
  {
    id: 'TCG-123456789012',
    customer: 'John Smith',
    email: 'john@techsupply.co.uk',
    phone: '+44 20 7946 0958',
    address: '123 Business Park, London, E1 6AN',
    origin: 'London, UK',
    destination: 'Edinburgh, UK',
    status: 'In Transit',
    payment: 'Paid',
    date: '2026-08-01',
    weight: '2.5 kg',
    packageType: 'Standard Parcel',
    expectedDelivery: '2026-08-08',
    documents: [
      { id: 'doc1', name: 'Waybill.pdf', type: 'application/pdf', size: '245 KB', uploadDate: '2026-08-01', attached: false },
      { id: 'doc2', name: 'Commercial_Invoice.pdf', type: 'application/pdf', size: '1.2 MB', uploadDate: '2026-08-01', attached: true },
    ],
  },
  {
    id: 'TCG-234567890123',
    customer: 'Alice Brown',
    email: 'alice@fastmove.co.uk',
    phone: '+44 161 234 5678',
    address: '10 Warehouse Lane, Manchester, M1 1AD',
    origin: 'Manchester, UK',
    destination: 'Bristol, UK',
    status: 'Delivered',
    payment: 'Paid',
    date: '2026-07-28',
    weight: '1.8 kg',
    packageType: 'Express Parcel',
    expectedDelivery: '2026-08-02',
    documents: [
      { id: 'doc3', name: 'Packing_List.pdf', type: 'application/pdf', size: '654 KB', uploadDate: '2026-07-28', attached: false },
    ],
  },
  {
    id: 'TCG-345678901234',
    customer: 'David Wilson',
    email: 'david@glasgowexports.co.uk',
    phone: '+44 141 555 0199',
    address: '88 Trade Street, Glasgow, G1 1AB',
    origin: 'Glasgow, UK',
    destination: 'London, UK',
    status: 'Customs Hold',
    payment: 'Unpaid',
    date: '2026-08-03',
    weight: '3.2 kg',
    packageType: 'Standard Parcel',
    expectedDelivery: '2026-08-10',
    documents: [
      { id: 'doc4', name: 'Customs_Notice.pdf', type: 'application/pdf', size: '456 KB', uploadDate: '2026-08-06', attached: true },
      { id: 'doc5', name: 'Inspection_Report.pdf', type: 'application/pdf', size: '789 KB', uploadDate: '2026-08-06', attached: false },
    ],
  },
  // ... other shipments (for brevity, keep the rest)
];

export function ShipmentProvider({ children }) {
  const [shipments, setShipments] = useState(() => {
    const stored = localStorage.getItem('adminShipments');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure each shipment has a documents array
      return parsed.map(s => ({ ...s, documents: s.documents || [] }));
    }
    return initialMockShipments;
  });

  useEffect(() => {
    localStorage.setItem('adminShipments', JSON.stringify(shipments));
  }, [shipments]);

  const addShipment = (shipment) => {
    setShipments((prev) => [{ ...shipment, documents: shipment.documents || [] }, ...prev]);
  };

  const updateShipment = (id, updated) => {
    setShipments((prev) => prev.map((s) => (s.id === id ? { ...updated, documents: updated.documents || s.documents || [] } : s)));
  };

  const deleteShipment = (id) => {
    setShipments((prev) => prev.filter((s) => s.id !== id));
  };

  // Document-specific functions
  const addDocument = (shipmentId, doc) => {
    setShipments((prev) =>
      prev.map((s) =>
        s.id === shipmentId
          ? { ...s, documents: [...(s.documents || []), { ...doc, id: generateId(), uploadDate: new Date().toISOString().slice(0, 10) }] }
          : s
      )
    );
  };

  const updateDocument = (shipmentId, docId, updatedDoc) => {
    setShipments((prev) =>
      prev.map((s) =>
        s.id === shipmentId
          ? { ...s, documents: (s.documents || []).map((d) => (d.id === docId ? { ...d, ...updatedDoc } : d)) }
          : s
      )
    );
  };

  const deleteDocument = (shipmentId, docId) => {
    setShipments((prev) =>
      prev.map((s) =>
        s.id === shipmentId
          ? { ...s, documents: (s.documents || []).filter((d) => d.id !== docId) }
          : s
      )
    );
  };

  const toggleAttach = (shipmentId, docId) => {
    setShipments((prev) =>
      prev.map((s) =>
        s.id === shipmentId
          ? {
              ...s,
              documents: (s.documents || []).map((d) =>
                d.id === docId ? { ...d, attached: !d.attached } : d
              ),
            }
          : s
      )
    );
  };

  return (
    <ShipmentContext.Provider
      value={{
        shipments,
        addShipment,
        updateShipment,
        deleteShipment,
        addDocument,
        updateDocument,
        deleteDocument,
        toggleAttach,
      }}
    >
      {children}
    </ShipmentContext.Provider>
  );
}

export function useShipments() {
  return useContext(ShipmentContext);
}