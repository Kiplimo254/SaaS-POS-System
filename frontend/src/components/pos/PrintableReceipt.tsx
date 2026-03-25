import React from "react";
import { format } from "date-fns";
import { Shop, Sale } from "@/types/pos";
import { formatSafe } from "@/lib/utils";

interface PrintableReceiptProps {
  shop: Shop;
  sale: Sale;
}

const PrintableReceipt = React.forwardRef<HTMLDivElement, PrintableReceiptProps>(
  ({ shop, sale }, ref) => {
    const currency = shop.currency || "Ksh";

    return (
      <div 
        ref={ref} 
        className="print-only bg-white text-black p-4 font-mono text-[12px] w-[80mm] mx-auto"
        style={{ color: 'black', backgroundColor: 'white' }}
      >
        {/* Header Section */}
        <div className="text-center space-y-1 mb-4">
          <h1 className="text-lg font-bold uppercase">{shop.name}</h1>
          <p className="whitespace-pre-wrap leading-tight">{shop.address}</p>
          <p>Tel: {shop.contact_number}</p>
          {shop.receipt_header && (
            <div className="mt-2 border-t border-dashed border-black pt-2 italic">
              {shop.receipt_header}
            </div>
          )}
        </div>

        {/* Transaction Details */}
        <div className="border-t border-dashed border-black py-2 text-[10px]">
          <div className="flex justify-between">
            <span>Receipt #:</span>
            <span>{sale.id}</span>
          </div>
          <div className="flex justify-between">
            <span>Date:</span>
            <span>{format(new Date(sale.timestamp), "dd/MM/yyyy HH:mm")}</span>
          </div>
          <div className="flex justify-between">
            <span>Cashier:</span>
            <span>{(sale as any).cashier_name || "Staff"}</span>
          </div>
        </div>

        {/* Items Table */}
        <div className="border-t border-black pt-2 pb-1">
          <div className="flex justify-between font-bold mb-1 border-b border-black pb-1">
            <span className="w-1/2">Item</span>
            <span className="w-1/4 text-right">Qty</span>
            <span className="w-1/4 text-right">Total</span>
          </div>
          <div className="space-y-1">
            {sale.items?.map((item, idx) => (
              <div key={idx} className="flex justify-between leading-tight">
                <span className="w-1/2">{(item as any).product_name || "Product"}</span>
                <span className="w-1/4 text-right">{item.quantity}</span>
                <span className="w-1/4 text-right">{currency}{formatSafe(item.total_price)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Totals Section */}
        <div className="border-t border-dashed border-black mt-2 pt-2 space-y-1">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{currency}{formatSafe(sale.total_amount - sale.tax_amount)}</span>
          </div>
          <div className="flex justify-between">
            <span>Tax:</span>
            <span>{currency}{formatSafe(sale.tax_amount)}</span>
          </div>
          {sale.discount_amount > 0 && (
            <div className="flex justify-between font-bold">
              <span>Discount:</span>
              <span>-{currency}{formatSafe(sale.discount_amount)}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-bold border-t border-black pt-1 mt-1">
            <span>TOTAL:</span>
            <span>{currency}{formatSafe(sale.total_amount)}</span>
          </div>
        </div>

        {/* Payments Section */}
        {sale.payments && sale.payments.length > 0 && (
          <div className="border-t border-dashed border-black mt-2 pt-2 space-y-1 text-[10px]">
            <div className="font-bold mb-1">PAYMENT DETAILS:</div>
            {sale.payments.map((p, idx) => (
              <div key={idx} className="flex justify-between">
                <span className="uppercase">{p.method}</span>
                <span>{currency}{formatSafe(p.amount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Footer Section */}
        <div className="mt-6 text-center space-y-2">
          {shop.receipt_footer && (
            <p className="whitespace-pre-wrap italic leading-tight border-t border-dashed border-black pt-2">
              {shop.receipt_footer}
            </p>
          )}
          <div className="pt-2">
            <p className="font-bold">THANK YOU FOR YOUR VISIT!</p>
            <p className="text-[8px] opacity-70">Powered by Enterprise POS Suite</p>
          </div>
        </div>

        {/* Print Styling */}
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            body * { visibility: hidden; }
            .print-only, .print-only * { visibility: visible; }
            .print-only { 
              position: absolute; 
              left: 0; 
              top: 0; 
              width: 100%;
              margin: 0;
              padding: 10mm;
            }
            @page {
              size: 80mm auto;
              margin: 0;
            }
          }
        ` }} />
      </div>
    );
  }
);

PrintableReceipt.displayName = "PrintableReceipt";

export default PrintableReceipt;
