import { addDoc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

export interface PaymentRecord {
  studentId: string;
  amount: number;
  transactionId: string;
  status: 'pending' | 'confirmed' | 'rejected';
  method: string;
  date: string;
  createdAt: string;
  screenshot?: string;
}

export const usePayment = () => {
  const generateUPILink = (amount: number, note: string) => {
    const upiId = '1241.co.mohdjishaanazmiyunus@okaxis'; // Replace with your actual UPI ID
    const name = 'Mess Management System';
    return `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
  };

  const generateQRCode = (amount: number, studentId: string) => {
    const note = `Mess Bill - ${studentId}`;
    const upiLink = generateUPILink(amount, note);
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiLink)}`;
  };

  const submitPaymentProof = async (
    amount: number,
    studentId: string,
    transactionId: string,
    method: string,
    screenshot?: string
  ) => {
    try {
      const paymentData: any = {
        studentId,
        amount,
        transactionId,
        status: 'pending',
        method,
        date: new Date().toISOString().split('T')[0],
        createdAt: new Date().toISOString()
      };
      
      if (screenshot) {
        paymentData.screenshot = screenshot;
      }
      
      await addDoc(collection(db, 'payments'), paymentData);

      toast.success('Payment submitted for verification!');
    } catch (error) {
      console.error('Error submitting payment:', error);
      toast.error('Failed to submit payment proof');
    }
  };

  return { generateQRCode, generateUPILink, submitPaymentProof };
};