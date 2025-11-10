import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Patient, Treatment, Payment, preferencesStorage } from "@/lib/storage";
import { Printer, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface InvoiceGeneratorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  treatments: Treatment[];
  payments: Payment[];
}

export const InvoiceGenerator = ({ open, onOpenChange, patient, treatments, payments }: InvoiceGeneratorProps) => {
  const { toast } = useToast();
  const printRef = useRef<HTMLDivElement>(null);
  const preferences = preferencesStorage.get();

  const totalTreatments = treatments.reduce((sum, t) => sum + t.cost, 0);
  const totalPayments = payments.reduce((sum, p) => sum + p.amount, 0);
  const subtotal = totalTreatments;
  const tax = subtotal * (preferences.taxRate / 100);
  const total = subtotal + tax;
  const amountPaid = totalPayments;
  const balance = total - amountPaid;

  const handlePrint = () => {
    window.print();
    toast({
      title: "Printing",
      description: "Invoice sent to printer",
    });
  };

  const handleDownload = async () => {
    if (!printRef.current) return;
    
    try {
      toast({
        title: "Generating PDF",
        description: "Please wait while we generate your invoice...",
      });

      // Capture the invoice div as a canvas
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      });

      // Calculate PDF dimensions
      const imgWidth = 210; // A4 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgData = canvas.toDataURL('image/png');
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Generate filename with patient name and date
      const fileName = `Invoice_${patient.firstName}_${patient.lastName}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      pdf.save(fileName);

      toast({
        title: "Success",
        description: "Invoice downloaded successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
      console.error("PDF generation error:", error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="print:hidden">
          <DialogTitle>Generate Invoice</DialogTitle>
        </DialogHeader>
        
        <div className="print:hidden flex gap-2 mb-4">
          <Button onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print Invoice
          </Button>
          <Button variant="outline" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>

        <div ref={printRef} className="bg-background p-8 print:p-0">
          {/* Invoice Header */}
          <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-primary">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">{preferences.clinicName}</h1>
              {preferences.clinicAddress && (
                <p className="text-sm text-muted-foreground">{preferences.clinicAddress}</p>
              )}
              {preferences.clinicPhone && (
                <p className="text-sm text-muted-foreground">Phone: {preferences.clinicPhone}</p>
              )}
              {preferences.clinicEmail && (
                <p className="text-sm text-muted-foreground">Email: {preferences.clinicEmail}</p>
              )}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-foreground mb-2">INVOICE</h2>
              <p className="text-sm text-muted-foreground">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-sm text-muted-foreground">Invoice #: INV-{Date.now().toString().slice(-8)}</p>
            </div>
          </div>

          {/* Patient Information */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Bill To:</h3>
            <div className="bg-muted/30 p-4 rounded-lg">
              <p className="font-medium text-foreground">{patient.firstName} {patient.lastName}</p>
              {patient.address && <p className="text-sm text-muted-foreground">{patient.address}</p>}
              <p className="text-sm text-muted-foreground">{patient.phone}</p>
              {patient.email && <p className="text-sm text-muted-foreground">{patient.email}</p>}
              {patient.insurance && (
                <p className="text-sm text-muted-foreground mt-2">Insurance: {patient.insurance}</p>
              )}
            </div>
          </div>

          {/* Treatments Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Treatments & Services</h3>
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-primary">
                  <th className="text-left py-3 font-semibold">Date</th>
                  <th className="text-left py-3 font-semibold">Procedure</th>
                  <th className="text-left py-3 font-semibold">Tooth</th>
                  <th className="text-left py-3 font-semibold">Status</th>
                  <th className="text-right py-3 font-semibold">Amount</th>
                </tr>
              </thead>
              <tbody>
                {treatments.map((treatment) => (
                  <tr key={treatment.id} className="border-b border-border">
                    <td className="py-3 text-sm">{new Date(treatment.date).toLocaleDateString()}</td>
                    <td className="py-3 text-sm">{treatment.procedure}</td>
                    <td className="py-3 text-sm">{treatment.tooth || "-"}</td>
                    <td className="py-3 text-sm capitalize">{treatment.status}</td>
                    <td className="py-3 text-sm text-right">${treatment.cost.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Payment History */}
          {payments.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Payment History</h3>
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-primary">
                    <th className="text-left py-3 font-semibold">Date</th>
                    <th className="text-left py-3 font-semibold">Method</th>
                    <th className="text-left py-3 font-semibold">Notes</th>
                    <th className="text-right py-3 font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-border">
                      <td className="py-3 text-sm">{new Date(payment.date).toLocaleDateString()}</td>
                      <td className="py-3 text-sm capitalize">{payment.method}</td>
                      <td className="py-3 text-sm">{payment.notes || "-"}</td>
                      <td className="py-3 text-sm text-right">${payment.amount.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Invoice Summary */}
          <div className="flex justify-end">
            <div className="w-80">
              <div className="space-y-2">
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {preferences.taxRate > 0 && (
                  <div className="flex justify-between py-2">
                    <span className="text-muted-foreground">Tax ({preferences.taxRate}%):</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-t border-border">
                  <span className="font-semibold">Total:</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Amount Paid:</span>
                  <span className="font-medium text-success">${amountPaid.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-3 border-t-2 border-primary">
                  <span className="text-lg font-bold">Balance Due:</span>
                  <span className={`text-lg font-bold ${balance > 0 ? 'text-destructive' : 'text-success'}`}>
                    ${balance.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Notes */}
          <div className="mt-12 pt-6 border-t border-border">
            <p className="text-sm text-muted-foreground text-center">
              Thank you for choosing {preferences.clinicName}. Please make payment within 30 days.
            </p>
            {balance > 0 && (
              <p className="text-sm text-center mt-2 font-medium">
                Payment Methods: Cash, Card, Insurance, Bank Transfer
              </p>
            )}
          </div>
        </div>
      </DialogContent>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:block {
            display: block !important;
          }
          ${printRef.current ? `
            #${printRef.current.id},
            #${printRef.current.id} * {
              visibility: visible;
            }
            #${printRef.current.id} {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
            }
          ` : ''}
        }
      `}</style>
    </Dialog>
  );
};
