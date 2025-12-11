import React, { useState, useEffect } from 'react';
import { SaleItem, PaymentMethod } from '../types';
import { getSales, addSale } from '../services/db';
import { Plus, Search, Calendar, Tag, Percent, CreditCard } from 'lucide-react';
import { format } from 'date-fns';

export const SalesModule: React.FC = () => {
  const [sales, setSales] = useState<SaleItem[]>([]);
  const [productName, setProductName] = useState('');
  
  const [quantity, setQuantity] = useState<number | ''>(''); 
  const [price, setPrice] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    refreshSales();
  }, []);

  const refreshSales = () => {
    const allSales = getSales();
    allSales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setSales(allSales);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const qtyVal = quantity === '' ? 0 : quantity;
    const priceVal = price === '' ? 0 : price;
    const discVal = discount === '' ? 0 : discount;

    if (qtyVal <= 0 || priceVal <= 0) {
      alert("Please enter valid quantity and price.");
      return;
    }

    const subtotal = qtyVal * priceVal;
    const total = subtotal - discVal;
    
    addSale({
      sale_id: `SALE-${Date.now()}`,
      product_name: productName,
      quantity: qtyVal,
      price: priceVal,
      discount: discVal,
      total,
      paymentMethod,
      date: new Date().toISOString()
    });
    
    setProductName('');
    setQuantity('');
    setPrice('');
    setDiscount('');
    setPaymentMethod('Cash');
    refreshSales();
  };

  const filteredSales = sales.filter(s => 
    s.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.sale_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentTotal = (Number(quantity || 0) * Number(price || 0)) - Number(discount || 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Entry Form */}
        <div className="lg:w-1/3">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Plus className="text-indigo-600" size={20} /> New Sale Entry
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={productName}
                  onChange={e => setProductName(e.target.value)}
                  className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
                  required
                  placeholder="Enter product name..."
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
                    required
                    placeholder="Qty"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold text-gray-700 mb-1">Price (TZS)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
                    required
                    placeholder="Price"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Discount (TZS)</label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={discount}
                    onChange={e => setDiscount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-10 pr-3 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:bg-white transition-colors"
                    placeholder="Optional Discount"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Payment Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Cash')}
                    className={`px-4 py-3 rounded-lg border font-medium text-sm transition-all ${
                      paymentMethod === 'Cash' 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' 
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Cash
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('AzamPesa')}
                    className={`px-4 py-3 rounded-lg border font-medium text-sm transition-all ${
                      paymentMethod === 'AzamPesa' 
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md' 
                        : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    AzamPesa
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <div className="flex justify-between items-center text-sm font-medium text-gray-900 bg-gray-50 p-4 rounded-lg mb-4 border border-gray-200">
                  <span>Total Amount:</span>
                  <span className="text-indigo-600 text-xl font-bold">TZS {currentTotal.toLocaleString()}</span>
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-bold shadow-md"
                >
                  Record Sale
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* List */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
            <div className="p-5 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
              <h3 className="font-bold text-gray-800">Sales History</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                />
              </div>
            </div>
            <div className="flex-1 overflow-auto max-h-[600px]">
              <table className="w-full text-left text-sm text-gray-600">
                <thead className="bg-gray-50 text-gray-700 font-semibold sticky top-0 shadow-sm z-10">
                  <tr>
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Product</th>
                    <th className="px-6 py-3 text-right">Qty</th>
                    <th className="px-6 py-3 text-right">Price</th>
                    <th className="px-6 py-3">Paid Via</th>
                    <th className="px-6 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredSales.map((sale) => (
                    <tr key={sale.id} className="hover:bg-indigo-50 transition-colors">
                      <td className="px-6 py-3 whitespace-nowrap flex items-center gap-2">
                        <Calendar size={14} className="text-gray-400" />
                        {format(new Date(sale.date), 'MMM dd, HH:mm')}
                      </td>
                      <td className="px-6 py-3 font-medium text-gray-900">
                        <div className="flex items-center gap-2">
                          <Tag size={14} className="text-indigo-400" />
                          {sale.product_name}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-right">{sale.quantity}</td>
                      <td className="px-6 py-3 text-right">TZS {sale.price.toLocaleString()}</td>
                      <td className="px-6 py-3">
                        <span className={`px-2 py-1 rounded-md text-xs font-semibold border ${
                          sale.paymentMethod === 'AzamPesa' 
                            ? 'bg-blue-50 text-blue-700 border-blue-200' 
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {sale.paymentMethod || 'Cash'}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-right font-bold text-indigo-600">TZS {sale.total.toLocaleString()}</td>
                    </tr>
                  ))}
                  {filteredSales.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-400">
                        No sales found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};