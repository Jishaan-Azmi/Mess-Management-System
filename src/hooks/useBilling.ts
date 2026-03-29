import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface BillItem {
  id?: string;
  studentId: string;
  itemName: string;
  price: number;
  date: string;
  timeSlot: 'Afternoon' | 'Night';
  createdAt: string;
}

export const useBilling = (studentId?: string) => {
  const [bills, setBills] = useState<BillItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBills = async () => {
    try {
      const billsRef = collection(db, 'bills');
      const q = studentId 
        ? query(billsRef, where('studentId', '==', studentId))
        : billsRef;
      
      const snapshot = await getDocs(q);
      const billsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BillItem[];
      
      setBills(billsData);
    } catch (error) {
      console.error('Error fetching bills:', error);
    } finally {
      setLoading(false);
    }
  };

  const addBillItem = async (billItem: Omit<BillItem, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'bills'), {
        ...billItem,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error adding bill item:', error);
      throw error;
    }
  };

  const addThaliToBill = async (studentId: string, date: string, timeSlot: 'Afternoon' | 'Night') => {
    try {
      await addBillItem({
        studentId,
        itemName: 'Thali',
        price: 50, // Default thali price
        date,
        timeSlot
      });
    } catch (error) {
      console.error('Error adding thali to bill:', error);
    }
  };

  useEffect(() => {
    fetchBills();
  }, [studentId]);

  return { bills, loading, addBillItem, addThaliToBill, refetch: fetchBills };
};