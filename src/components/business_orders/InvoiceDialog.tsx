'use client';

import { useStore } from '@/store/useStore';
import type { BusinessOrder } from '@/types';
import { X, Printer, MessageCircle, FileText, ChevronDown } from 'lucide-react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useEffect, useRef, useState } from 'react';
import { DocumentPreview } from '../documents/DocumentPreview';

interface InvoiceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: BusinessOrder | null;
}

export default function InvoiceDialog({ isOpen, onClose, order }: InvoiceDialogProps) {
  const { businessSettings, businessProfileType } = useStore();
  const [documentType, setDocumentType] = useState<'invoice' | 'delivery' | 'order'>('invoice');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setDocumentType('invoice'); // reset
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !order) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', { style: 'currency', currency: businessSettings.currency || 'MAD' }).format(amount);
  };

  const handlePrint = () => {
    window.print();
  };

  // Generate PDF of the invoice using html2canvas and jsPDF
  const generatePdf = async () => {
    if (!printRef.current) return;
    const canvas = await html2canvas(printRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    const blob = pdf.output('blob');
    const url = URL.createObjectURL(blob);
    setPdfUrl(url);
    // Trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${order?.orderNumber || 'invoice'}_${getDocTitle()}.pdf`;
    link.click();
  };

  const getDocTitle = () => {
    switch(documentType) {
      case 'invoice': return 'Facture';
      case 'delivery': return 'Bon de Livraison';
      case 'order': return 'Bon de Commande';
    }
  };

  const handleShareWhatsApp = () => {
    if (!order.clientPhone) {
      alert("Ce client n'a pas de numéro de téléphone enregistré.");
      return;
    }
    
    // Formatting the WhatsApp message
    const greeting = `Bonjour ${order.clientName || 'Cher client'},`;
    const itemList = (order.items && order.items.length > 0)
      ? order.items.map(i => `- ${i.quantity}x ${i.productName}`).join('\n')
      : `- ${order.quantity}x ${order.productName}`;
    const body = `Voici le détail de votre ${getDocTitle()} (${order.orderNumber}):\n${itemList}`;
    const pricing = `\nTotal: ${formatCurrency(order.amountTTC_cents)}`;
    
    let balanceStr = "";
    if (documentType === 'invoice') {
      if (order.remainingBalance_cents > 0) {
        balanceStr = `\nAvance reçue: ${formatCurrency(order.advancePaid_cents)}\nReste à payer: ${formatCurrency(order.remainingBalance_cents)}`;
      } else if (order.advancePaid_cents > 0 && order.remainingBalance_cents === 0) {
        balanceStr = `\nPayé en totalité.`;
      }
    }

    const message = `${greeting}\n\n${body}${pricing}${balanceStr}\n\nMerci de votre confiance !`;
    
    // If PDF is available, include link
    const pdfLinkPart = pdfUrl ? `\n\nTélécharger la facture: ${pdfUrl}` : '';
    const fullMessage = message + pdfLinkPart;
    
    let phone = order.clientPhone.replace(/[^0-9]/g, '');
    if (phone.startsWith('0')) {
      phone = '212' + phone.substring(1);
    }

    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(fullMessage)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center sm:block p-4 sm:p-0 print:bg-white print:p-0 print:block">
      <div 
        className="absolute sm:fixed inset-0 bg-zinc-900/80 backdrop-blur-sm animate-in fade-in duration-200 print:hidden" 
        onClick={() => {
          if (typeof window !== 'undefined' && window.innerWidth < 640) {
            onClose();
          }
        }} 
      />
      {/* Container */}
      <div className="relative sm:fixed sm:inset-y-0 sm:right-0 z-10 bg-zinc-100 dark:bg-zinc-900 w-full h-full sm:w-[50%] sm:max-w-none sm:h-full sm:max-h-none sm:rounded-none sm:rounded-l-3xl flex flex-col shadow-2xl overflow-hidden animate-in fade-in sm:slide-in-from-right duration-300 print:shadow-none print:h-auto print:max-w-full">
        
        {/* Toolbar (Hidden when printing) */}
        <div className="print:hidden flex items-center justify-between px-4 py-4 sm:px-6 bg-white dark:bg-zinc-800/40 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          
          <div className="relative">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-lg font-semibold text-zinc-900 dark:text-white flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              <FileText className="w-5 h-5 text-zinc-900 dark:text-white" />
              Aperçu : {getDocTitle()}
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            </button>

            {isMenuOpen && (
              <div className="absolute top-full left-0 mt-2 w-48 bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 py-1 z-50">
                <button 
                  onClick={() => { setDocumentType('invoice'); setIsMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${documentType === 'invoice' ? 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}
                >
                  Facture
                </button>
                <button 
                  onClick={() => { setDocumentType('delivery'); setIsMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${documentType === 'delivery' ? 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}
                >
                  Bon de Livraison
                </button>
                <button 
                  onClick={() => { setDocumentType('order'); setIsMenuOpen(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition-colors ${documentType === 'order' ? 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400' : 'text-zinc-700 dark:text-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-700/50'}`}
                >
                  Bon de Commande
                </button>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={handleShareWhatsApp}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
            <button 
              onClick={generatePdf}
              className="hidden sm:flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg font-medium transition-colors text-sm shadow-sm ml-2"
            >
              PDF
            </button>
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg font-medium transition-colors text-sm shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Imprimer
            </button>
            <button 
              onClick={onClose}
              className="p-2 ml-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-zinc-100/50 dark:bg-zinc-900/50 print:p-0 print:bg-white print:overflow-visible">
          {/* A4 Document Page */}
          <div 
            id="print-area"
            ref={printRef}
            className="w-full max-w-[21cm] bg-white shadow-sm sm:shadow-md print:shadow-none min-h-[29.7cm] flex flex-col print:m-0"
          >
            <DocumentPreview order={order} documentType={documentType} />
          </div>
        </div>

      </div>

    </div>
  );
}
