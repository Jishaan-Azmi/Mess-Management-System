import { useEffect } from 'react';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useAutoBilling = () => {
  const addDailyBills = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Get all students
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Get Thali price
      const messItemsSnapshot = await getDocs(collection(db, 'messItems'));
      const thaliItem = messItemsSnapshot.docs.find(doc => doc.data().name === 'Thali');
      const thaliPrice = thaliItem ? thaliItem.data().price : 50;
      
      // Check if bills already added today
      const todayBillsSnapshot = await getDocs(
        query(collection(db, 'bills'), where('date', '==', today))
      );
      const todayBills = todayBillsSnapshot.docs.map(doc => doc.data());
      
      for (const student of students) {
        // Check if afternoon bill already exists
        const hasAfternoonBill = todayBills.find(
          bill => bill.studentId === student.studentId && bill.timeSlot === 'Afternoon'
        );
        
        // Check if night bill already exists
        const hasNightBill = todayBills.find(
          bill => bill.studentId === student.studentId && bill.timeSlot === 'Night'
        );
        
        // Add afternoon Thali bill if not exists
        if (!hasAfternoonBill) {
          await addDoc(collection(db, 'bills'), {
            studentId: student.studentId,
            itemName: 'Thali',
            price: thaliPrice,
            date: today,
            timeSlot: 'Afternoon',
            createdAt: new Date().toISOString()
          });
        }
        
        // Add night Thali bill if not exists
        if (!hasNightBill) {
          await addDoc(collection(db, 'bills'), {
            studentId: student.studentId,
            itemName: 'Thali',
            price: thaliPrice,
            date: today,
            timeSlot: 'Night',
            createdAt: new Date().toISOString()
          });
        }
      }
      
      console.log('Daily bills added for', today);
    } catch (error) {
      console.error('Error adding daily bills:', error);
    }
  };

  useEffect(() => {
    const checkTime = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Check if it's 12:00 AM (midnight)
      if (hours === 0 && minutes === 0) {
        addDailyBills();
      }
    };

    // Check every minute
    const interval = setInterval(checkTime, 60000);
    
    // Also run once on component mount to handle page refresh
    const lastRun = localStorage.getItem('lastBillRun');
    const today = new Date().toISOString().split('T')[0];
    
    if (lastRun !== today) {
      addDailyBills();
      localStorage.setItem('lastBillRun', today);
    }
    
    return () => clearInterval(interval);
  }, []);

  return { addDailyBills };
};