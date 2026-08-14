import React from 'react';
import { useStore } from '@/store/useStore';
import type { BusinessOrder, BusinessSettings } from '@/types';
import { formatCurrency, fromCents } from '@/lib/utils';
import { MapPin, Phone, Mail, FileText } from 'lucide-react';

interface DocumentPreviewProps {
  order: BusinessOrder;
  documentType: 'invoice' | 'delivery' | 'order';
}

export function DocumentPreview({ order, documentType }: DocumentPreviewProps) {
  const { businessSettings } = useStore();
  const settings = businessSettings;
  
  const getDocumentTitle = () => {
    switch(documentType) {
      case 'invoice': return 'FACTURE';
      case 'delivery': return 'BON DE LIVRAISON';
      case 'order': return 'BON DE COMMANDE';
      default: return 'DOCUMENT';
    }
  };

  const getDocumentNumber = () => {
    switch(documentType) {
      case 'invoice': return order.invoiceNumber || `F-${order.orderNumber}`;
      case 'delivery': return order.deliveryNoteNumber || `BL-${order.orderNumber}`;
      case 'order': return `BC-${order.orderNumber}`;
      default: return order.orderNumber;
    }
  };

  return (
    <div className="bg-white p-8 sm:p-12 text-zinc-900 w-full max-w-4xl mx-auto shadow-sm border border-zinc-200 print:shadow-none print:border-none print:p-0">
      
      {/* HEADER */}
      <div className="flex justify-between items-start mb-12">
        <div className="flex flex-col">
          {settings.logoBase64 ? (
            <img src={settings.logoBase64} alt="Logo" className="max-w-[200px] max-h-[80px] object-contain mb-4" />
          ) : (
            <div className="text-2xl font-bold tracking-tight mb-4">{settings.companyName || 'Mon Entreprise'}</div>
          )}
        </div>
        
        <div className="text-right flex flex-col items-end">
          <h1 className="text-4xl font-bold tracking-tight text-zinc-800 mb-2 uppercase">{getDocumentTitle()}</h1>
          <div className="text-lg font-medium text-zinc-600 mb-6">N° {getDocumentNumber()}</div>
          
          <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-100 w-full max-w-sm text-left mb-6">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Facturé à</h3>
            <div className="font-bold text-lg mb-2">{order.clientName || 'Client divers'}</div>
            <div className="space-y-1.5 text-sm text-zinc-600">
              {order.clientAddress && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-zinc-400" />
                  <span>{order.clientAddress}</span>
                </div>
              )}
              {order.clientPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-zinc-400" />
                  <span>{order.clientPhone}</span>
                </div>
              )}
              {/* @ts-ignore - Assuming we might have email later */}
              {order.clientEmail && (
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-zinc-400" />
                  {/* @ts-ignore */}
                  <span>{order.clientEmail}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-zinc-600 text-left">
            <div className="font-medium">Date:</div>
            <div className="text-right">{new Date(order.date).toLocaleDateString()}</div>
            {order.dueDate && (
              <>
                <div className="font-medium">Date d'échéance:</div>
                <div className="text-right">{new Date(order.dueDate).toLocaleDateString()}</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="mb-8">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-y-2 border-zinc-900">
              <th className="py-3 px-2 font-bold w-1/2">Désignation</th>
              <th className="py-3 px-2 font-bold text-center">Qté</th>
              <th className="py-3 px-2 font-bold text-right">Prix Unitaire</th>
              <th className="py-3 px-2 font-bold text-right">Montant</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {((order.items && order.items.length > 0) 
              ? order.items 
              : [{ productName: order.productName, quantity: order.quantity, unitSellingPrice_cents: order.unitSellingPrice_cents }]
            ).map((item, idx) => (
              <tr key={idx}>
                <td className="py-4 px-2">
                  <div className="font-medium text-zinc-900">{item.productName}</div>
                </td>
                <td className="py-4 px-2 text-center text-zinc-600">{item.quantity}</td>
                <td className="py-4 px-2 text-right text-zinc-600">{formatCurrency(fromCents(item.unitSellingPrice_cents || 0) || 0)}</td>
                <td className="py-4 px-2 text-right font-medium">{formatCurrency((item.quantity || 1) * (fromCents(item.unitSellingPrice_cents || 0) || 0))}</td>
              </tr>
            ))}
            {order.extraFees?.map((fee, idx) => (
              <tr key={idx}>
                <td className="py-3 px-2 text-zinc-600 italic flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" /> Frais: {fee.label}
                </td>
                <td className="py-3 px-2 text-center text-zinc-600">1</td>
                <td className="py-3 px-2 text-right text-zinc-600">{formatCurrency(fromCents(fee.amount_cents) || 0)}</td>
                <td className="py-3 px-2 text-right text-zinc-600">{formatCurrency(fromCents(fee.amount_cents) || 0)}</td>
              </tr>
            ))}
            {order.shippingFee_cents && order.shippingFee_cents > 0 && (
              <tr className="border-b border-zinc-100">
                <td className="py-3 px-2">
                  <span className="font-medium text-zinc-900">Frais de livraison</span>
                </td>
                <td className="py-3 px-2 text-right text-zinc-600">1</td>
                <td className="py-3 px-2 text-right text-zinc-600">{formatCurrency(fromCents(order.shippingFee_cents) || 0)}</td>
                <td className="py-3 px-2 text-right text-zinc-600">{formatCurrency(fromCents(order.shippingFee_cents) || 0)}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* TOTALS & PAYMENT INFO */}
      <div className="flex justify-between items-start mb-16 gap-8">
        
        {/* PAYMENT INFO */}
        <div className="w-full max-w-sm">
          {documentType === 'invoice' && (
            <div className="bg-zinc-50 p-5 rounded-xl border border-zinc-100 text-sm text-zinc-600">
              <h4 className="font-bold text-zinc-900 mb-2 uppercase tracking-wider text-xs">Modalités de Paiement</h4>
              <p className="mb-1"><span className="font-medium">Mode de règlement :</span> {order.paymentMethod}</p>
              {settings.paymentInstructions && (
                <div className="mt-3 pt-3 border-t border-zinc-200">
                  <p className="whitespace-pre-wrap font-medium text-zinc-800">{settings.paymentInstructions}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* TOTALS */}
        <div className="w-full max-w-sm">
          <div className="space-y-3 text-sm">
            
            {order.discountAmount_cents && order.discountAmount_cents > 0 ? (
              <div className="flex justify-between text-rose-600 mb-2">
                <span>Remise</span>
                <span>-{formatCurrency(fromCents(order.discountAmount_cents) || 0)}</span>
              </div>
            ) : null}

            {order.taxMode !== 'HT' ? (
              <>
                <div className="flex justify-between mb-2 text-zinc-600">
                <span>Total HT</span>
                <span className="font-medium">{formatCurrency(fromCents(order.amountHT_cents) || 0)}</span>
              </div>
              <div className="flex justify-between mb-2 text-zinc-600">
                <span>TVA (20%)</span>
                <span>{formatCurrency(fromCents(order.amountTVA_cents) || 0)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between mb-2 text-zinc-600">
                <span>Total</span>
                <span className="font-medium">{formatCurrency(fromCents(order.amountHT_cents) || 0)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center border-t-2 border-zinc-900 pt-3 text-lg font-bold">
              <span>TOTAL {order.taxMode === 'HT' ? 'HT' : 'TTC'}</span>
              <span>{formatCurrency(order.amountTTC_cents)}</span>
            </div>

            {documentType === 'invoice' && order.advancePaid_cents > 0 && (
              <>
                <div className="flex justify-between text-lg font-bold text-zinc-900 mb-4">
              <span>Net à payer</span>
              <span>{formatCurrency(fromCents(order.amountTTC_cents) || 0)}</span>
                </div>
                <div className="flex justify-between items-center text-zinc-900 font-medium">
                  <span>Reste à payer</span>
                  <span>{formatCurrency(order.remainingBalance_cents)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="mt-16 pt-8 border-t border-zinc-200 text-center text-xs text-zinc-500">
        
        <div className="font-bold text-zinc-800 text-sm mb-1">{settings.companyName || 'Mon Entreprise'}</div>
        
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-3">
          {settings.address && <span>{settings.address}</span>}
          {settings.city && <span>{settings.city}</span>}
          {settings.country && <span>{settings.country}</span>}
        </div>
        
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-3">
          {settings.phone && <span>Tél: {settings.phone}</span>}
          {settings.email && <span>Email: {settings.email}</span>}
        </div>

        {settings.identifiers && settings.identifiers.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mb-4 text-[11px] font-medium text-zinc-400">
            {settings.identifiers.map(id => (
              <span key={id.id}>{id.label}: {id.value}</span>
            ))}
          </div>
        )}

        {settings.legalNotice && (
          <p className="font-medium text-zinc-600 mb-1">{settings.legalNotice}</p>
        )}
        {settings.invoiceFooterText && (
          <p className="whitespace-pre-wrap text-[11px]">{settings.invoiceFooterText}</p>
        )}
      </div>

    </div>
  );
}
