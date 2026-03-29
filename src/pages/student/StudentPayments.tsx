import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, QrCode, Smartphone, Download, Upload } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useBilling } from "@/hooks/useBilling";
import { useAuth } from "@/hooks/useAuth";
import { usePayment } from "@/hooks/usePayment";
import { usePayments } from "@/hooks/usePayments";
import { useReceipts } from "@/hooks/useReceipts";

const StudentPayments = () => {
  const navigate = useNavigate();
  const { getCurrentStudent } = useAuth();
  const currentStudent = getCurrentStudent();
  const { generateQRCode, generateUPILink, submitPaymentProof } = usePayment();
  const [transactionId, setTransactionId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [receipts, setReceipts] = useState([]);
  
  const studentId = currentStudent?.studentId || "";
  const { bills } = useBilling(studentId);
  const { payments } = usePayments(studentId);
  const { getStudentReceipts, downloadReceipt } = useReceipts();
  
  useEffect(() => {
    if (!currentStudent) {
      navigate('/student/login');
    }
  }, [currentStudent, navigate]);
  
  // Fetch receipts
  useEffect(() => {
    const fetchReceipts = async () => {
      if (currentStudent && getStudentReceipts) {
        const studentReceipts = await getStudentReceipts(currentStudent.studentId);
        setReceipts(studentReceipts);
      }
    };
    fetchReceipts();
  }, [currentStudent, getStudentReceipts]);
  
  // Calculate current month bill
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const currentMonthBills = bills.filter(bill => {
    const billDate = new Date(bill.date);
    return billDate.getMonth() === currentMonth && billDate.getFullYear() === currentYear;
  });
  
  const totalAmount = currentMonthBills.reduce((sum, bill) => sum + bill.price, 0);
  const mealCount = currentMonthBills.length;
  
  // Real payment history from Firebase
  const paymentHistory = payments.map(payment => ({
    date: new Date(payment.date).toLocaleDateString('en-GB'),
    amount: `₹${payment.amount}`,
    method: payment.method,
    status: payment.status === 'confirmed' ? 'Confirmed' : payment.status === 'rejected' ? 'Rejected' : 'Pending',
    transactionId: payment.transactionId
  }));

  const handlePaymentSubmit = async () => {
    if (!currentStudent || totalAmount === 0 || !transactionId.trim()) {
      toast.error('Please enter transaction ID');
      return;
    }
    
    await submitPaymentProof(
      totalAmount,
      currentStudent.studentId,
      transactionId,
      paymentMethod
    );
    
    setTransactionId('');
    setShowPaymentDialog(false);
  };
  
  const qrCodeUrl = currentStudent ? generateQRCode(totalAmount, currentStudent.studentId) : '';
  const upiLink = generateUPILink(totalAmount, `Mess Bill - ${currentStudent?.studentId}`);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/student/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-2">Payments</h1>
        <p className="text-muted-foreground mb-6">Manage your mess payments and view history</p>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2 p-6">
            <h2 className="text-xl font-semibold mb-6">Make Payment</h2>
            
            <div className="bg-muted p-4 rounded-lg mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Amount Due</span>
                <span className="text-3xl font-bold text-warning">₹{totalAmount}</span>
              </div>
              <p className="text-sm text-muted-foreground">For {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
            </div>

            <div className="mb-6 space-y-4">
              <div className="text-center">
                <h3 className="font-semibold mb-2">Scan QR Code to Pay</h3>
                <div className="flex justify-center mb-4">
                  <img src={qrCodeUrl} alt="UPI QR Code" className="border rounded-lg" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">Or click the button below to open UPI app</p>
                <Button variant="outline" onClick={() => window.open(upiLink)} className="mb-4">
                  <Smartphone className="w-4 h-4 mr-2" />
                  Pay with UPI App
                </Button>
              </div>
              
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">After payment, submit transaction details:</p>
              </div>
            </div>

            <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
              <DialogTrigger asChild>
                <Button size="lg" className="w-full" disabled={totalAmount === 0}>
                  {totalAmount === 0 ? 'No Amount Due' : 'Submit Payment Proof'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Submit Payment Proof</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="transactionId">Transaction ID / UTR Number</Label>
                    <Input
                      id="transactionId"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter transaction ID"
                    />
                  </div>
                  <Button onClick={handlePaymentSubmit} className="w-full">
                    Submit for Verification
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold mb-4">Payment Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Meals ({mealCount})</span>
                <span>₹{totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Service Fee</span>
                <span>₹0</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold">₹{totalAmount}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Payment History</h2>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Receipt</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paymentHistory.map((payment, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{payment.date}</TableCell>
                  <TableCell className="font-semibold">{payment.amount}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>
                    <Badge variant="default">{payment.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {payment.status === 'Confirmed' ? (
                      <Button 
                        size="icon" 
                        variant="ghost"
                        onClick={() => {
                          const receipt = receipts.find(r => r.transactionId === payment.transactionId);
                          if (receipt) downloadReceipt(receipt);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground text-sm">Pending</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default StudentPayments;
