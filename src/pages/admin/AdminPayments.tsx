import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X } from "lucide-react";
import { usePayments } from "@/hooks/usePayments";
import { useReceipts } from "@/hooks/useReceipts";
import { useStudents } from "@/hooks/useStudents";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";

const AdminPayments = () => {
  const navigate = useNavigate();
  const { payments, refetch } = usePayments(); // Get all payments
  const { createReceipt } = useReceipts();
  const { students } = useStudents();

  const handlePaymentAction = async (paymentId: string, status: 'confirmed' | 'rejected') => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), { status });
      
      // Generate receipt if payment is confirmed
      if (status === 'confirmed') {
        const payment = payments.find(p => p.id === paymentId);
        const student = students.find(s => s.studentId === payment?.studentId);
        
        if (payment && student) {
          await createReceipt(
            paymentId,
            payment.studentId,
            student.name,
            payment.amount,
            payment.transactionId
          );
          toast.success('Payment confirmed and receipt generated!');
        }
      } else {
        toast.success(`Payment ${status}!`);
      }
      
      refetch();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Failed to update payment status');
    }
  };

  const pendingPayments = payments.filter(p => p.status === 'pending');
  const confirmedPayments = payments.filter(p => p.status === 'confirmed');

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/admin/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <h1 className="text-3xl font-bold mb-2">Payment Verification</h1>
        <p className="text-muted-foreground mb-6">Verify and manage student payments</p>

        {/* Pending Payments */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Pending Verification ({pendingPayments.length})</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingPayments.map((payment) => (
                <TableRow key={payment.transactionId}>
                  <TableCell>{new Date(payment.date).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell className="font-medium">{payment.studentId}</TableCell>
                  <TableCell className="font-semibold">₹{payment.amount}</TableCell>
                  <TableCell>{payment.transactionId}</TableCell>
                  <TableCell>{payment.method}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handlePaymentAction(payment.id!, 'confirmed')}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handlePaymentAction(payment.id!, 'rejected')}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pendingPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No pending payments
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Confirmed Payments */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Confirmed Payments</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Student ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {confirmedPayments.slice(0, 10).map((payment) => (
                <TableRow key={payment.transactionId}>
                  <TableCell>{new Date(payment.date).toLocaleDateString('en-GB')}</TableCell>
                  <TableCell className="font-medium">{payment.studentId}</TableCell>
                  <TableCell className="font-semibold">₹{payment.amount}</TableCell>
                  <TableCell>{payment.transactionId}</TableCell>
                  <TableCell>
                    <Badge variant="default">Confirmed</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {confirmedPayments.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No confirmed payments yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default AdminPayments;