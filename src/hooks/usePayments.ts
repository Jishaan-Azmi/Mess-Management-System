import { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PaymentRecord } from './usePayment';

export const usePayments = (studentId?: string) => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      const paymentsRef = collection(db, 'payments');
      const q = studentId 
        ? query(paymentsRef, where('studentId', '==', studentId))
        : paymentsRef;
      
      const snapshot = await getDocs(q);
      const paymentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as PaymentRecord[];
      
      // Sort by date descending
      paymentsData.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      setPayments(paymentsData);
    } catch (error) {
      console.error('Error fetching payments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [studentId]);

  return { payments, loading, refetch: fetchPayments };
};