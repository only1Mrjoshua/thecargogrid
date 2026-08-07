import { createContext, useContext, useState, useEffect } from 'react';

const InvoiceContext = createContext();

const generateId = () => 'INV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0');

const initialMockInvoices = [
  {
    id: 'INV-2026-0001',
    invoiceNumber: 'INV-2026-0001',
    customer: 'John Smith',
    trackingNumber: 'TCG-123456789012',
    description: 'Customs Clearance Fee',
    amount: 35.00,
    currency: 'GBP',
    dueDate: '2026-08-15',
    status: 'Sent',
    createdAt: '2026-08-07',
    updatedAt: '2026-08-07',
  },
  {
    id: 'INV-2026-0002',
    invoiceNumber: 'INV-2026-0002',
    customer: 'Alice Brown',
    trackingNumber: 'TCG-234567890123',
    description: 'Express Delivery',
    amount: 30.00,
    currency: 'GBP',
    dueDate: '2026-08-10',
    status: 'Paid',
    createdAt: '2026-07-28',
    updatedAt: '2026-08-02',
  },
  {
    id: 'INV-2026-0003',
    invoiceNumber: 'INV-2026-0003',
    customer: 'David Wilson',
    trackingNumber: 'TCG-345678901234',
    description: 'Customs Processing Fee',
    amount: 35.00,
    currency: 'GBP',
    dueDate: '2026-08-20',
    status: 'Draft',
    createdAt: '2026-08-07',
    updatedAt: '2026-08-07',
  },
  {
    id: 'INV-2026-0004',
    invoiceNumber: 'INV-2026-0004',
    customer: 'Emily Johnson',
    trackingNumber: 'TCG-567890123456',
    description: 'Freight Shipping',
    amount: 120.00,
    currency: 'GBP',
    dueDate: '2026-08-25',
    status: 'Overdue',
    createdAt: '2026-08-05',
    updatedAt: '2026-08-05',
  },
];

export function InvoiceProvider({ children }) {
  const [invoices, setInvoices] = useState(() => {
    const stored = localStorage.getItem('adminInvoices');
    return stored ? JSON.parse(stored) : initialMockInvoices;
  });

  useEffect(() => {
    localStorage.setItem('adminInvoices', JSON.stringify(invoices));
  }, [invoices]);

  const addInvoice = (invoice) => {
    const newInvoice = {
      ...invoice,
      id: generateId(),
      invoiceNumber: generateId(),
      createdAt: new Date().toISOString().slice(0, 10),
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setInvoices((prev) => [newInvoice, ...prev]);
    return newInvoice;
  };

  const updateInvoice = (id, updated) => {
    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? { ...inv, ...updated, updatedAt: new Date().toISOString().slice(0, 10) }
          : inv
      )
    );
  };

  const deleteInvoice = (id) => {
    setInvoices((prev) => prev.filter((inv) => inv.id !== id));
  };

  return (
    <InvoiceContext.Provider value={{ invoices, addInvoice, updateInvoice, deleteInvoice }}>
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoices() {
  return useContext(InvoiceContext);
}