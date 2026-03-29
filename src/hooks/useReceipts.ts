import { addDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import jsPDF from 'jspdf';

export interface Receipt {
  id?: string;
  paymentId: string;
  studentId: string;
  studentName: string;
  amount: number;
  transactionId: string;
  date: string;
  receiptNumber: string;
  createdAt: string;
}

export const useReceipts = () => {
  const generateReceiptNumber = () => {
    const timestamp = Date.now();
    return `RCP${timestamp}`;
  };

  const generatePDFReceipt = (receipt: Receipt) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(20);
    doc.text('MESS MANAGEMENT SYSTEM', 105, 30, { align: 'center' });
    doc.setFontSize(16);
    doc.text('Payment Receipt', 105, 45, { align: 'center' });
    
    // Receipt details
    doc.setFontSize(12);
    doc.text(`Receipt No: ${receipt.receiptNumber}`, 20, 70);
    doc.text(`Date: ${new Date(receipt.date).toLocaleDateString()}`, 20, 85);
    
    // Student details
    doc.text('STUDENT DETAILS:', 20, 110);
    doc.text(`Student ID: ${receipt.studentId}`, 20, 125);
    doc.text(`Name: ${receipt.studentName}`, 20, 140);
    
    // Payment details
    doc.text('PAYMENT DETAILS:', 20, 165);
    doc.text(`Amount Paid: ₹${receipt.amount}`, 20, 180);
    doc.text(`Transaction ID: ${receipt.transactionId}`, 20, 195);
    doc.text(`Payment Date: ${new Date(receipt.createdAt).toLocaleDateString()}`, 20, 210);
    
    // Footer
    doc.text('Thank you for your payment!', 105, 250, { align: 'center' });
    doc.text('This is a computer generated receipt.', 105, 265, { align: 'center' });
    
    return doc;
  };

  const createReceipt = async (
    paymentId: string,
    studentId: string,
    studentName: string,
    amount: number,
    transactionId: string
  ) => {
    try {
      const receiptNumber = generateReceiptNumber();
      const receiptData: Omit<Receipt, 'id'> = {
        paymentId,
        studentId,
        studentName,
        amount,
        transactionId,
        date: new Date().toISOString().split('T')[0],
        receiptNumber,
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'receipts'), receiptData);
      
      return { ...receiptData, id: docRef.id };
    } catch (error) {
      console.error('Error creating receipt:', error);
      throw error;
    }
  };

  const downloadReceipt = (receipt: Receipt) => {
    const doc = generatePDFReceipt(receipt);
    doc.save(`Receipt_${receipt.receiptNumber}.pdf`);
  };

  const getStudentReceipts = async (studentId: string) => {
    try {
      const receiptsRef = collection(db, 'receipts');
      const q = query(receiptsRef, where('studentId', '==', studentId));
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Receipt[];
    } catch (error) {
      console.error('Error fetching receipts:', error);
      return [];
    }
  };

  return { createReceipt, downloadReceipt, getStudentReceipts };
};