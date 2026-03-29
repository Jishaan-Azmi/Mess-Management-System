import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, orderBy, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AttendanceRecord {
  id?: string;
  studentId: string;
  date: string;
  timeSlot: 'Afternoon' | 'Night';
  status: 'Present' | 'Absent';
  time: string;
}

export const useAttendance = (studentId?: string) => {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const attendanceRef = collection(db, 'attendance');
      const q = studentId 
        ? query(attendanceRef, where('studentId', '==', studentId))
        : attendanceRef;
      
      const snapshot = await getDocs(q);
      const records = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRecord[];
      
      // Sort by date in JavaScript instead of Firestore
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setAttendance(records);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  const getThaliPrice = async () => {
    try {
      const messItemsRef = collection(db, 'messItems');
      const snapshot = await getDocs(messItemsRef);
      const thaliItem = snapshot.docs.find(doc => doc.data().name === 'Thali');
      return thaliItem ? thaliItem.data().price : 50;
    } catch (error) {
      console.error('Error getting thali price:', error);
      return 50;
    }
  };

  const markAttendance = async (record: Omit<AttendanceRecord, 'id'>) => {
    try {
      // Check if attendance record already exists
      const existingQuery = query(
        collection(db, 'attendance'),
        where('studentId', '==', record.studentId),
        where('date', '==', record.date),
        where('timeSlot', '==', record.timeSlot)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        // Update existing record
        const existingDoc = existingSnapshot.docs[0];
        await updateDoc(doc(db, 'attendance', existingDoc.id), {
          status: record.status,
          time: record.time
        });
        
        // Handle billing changes
        if (record.status === 'Absent') {
          // Remove thali from bill if marking absent
          const billQuery = query(
            collection(db, 'bills'),
            where('studentId', '==', record.studentId),
            where('date', '==', record.date),
            where('timeSlot', '==', record.timeSlot),
            where('itemName', '==', 'Thali')
          );
          const billSnapshot = await getDocs(billQuery);
          billSnapshot.docs.forEach(async (billDoc) => {
            await deleteDoc(doc(db, 'bills', billDoc.id));
          });
        } else if (record.status === 'Present') {
          // Add thali to bill if marking present
          const thaliPrice = await getThaliPrice();
          await addDoc(collection(db, 'bills'), {
            studentId: record.studentId,
            itemName: 'Thali',
            price: thaliPrice,
            date: record.date,
            timeSlot: record.timeSlot,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        // Create new record
        await addDoc(collection(db, 'attendance'), record);
        
        // Auto-add thali to bill if present
        if (record.status === 'Present') {
          const thaliPrice = await getThaliPrice();
          await addDoc(collection(db, 'bills'), {
            studentId: record.studentId,
            itemName: 'Thali',
            price: thaliPrice,
            date: record.date,
            timeSlot: record.timeSlot,
            createdAt: new Date().toISOString()
          });
        }
      }
      
      fetchAttendance();
    } catch (error) {
      console.error('Error marking attendance:', error);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [studentId]);

  return { attendance, loading, markAttendance, refetch: fetchAttendance };
};