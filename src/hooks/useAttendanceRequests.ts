import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface AttendanceRequest {
  id?: string;
  studentId: string;
  date: string;
  timeSlot: 'Afternoon' | 'Night';
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  createdAt: string;
}

export const useAttendanceRequests = () => {
  const [requests, setRequests] = useState<AttendanceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    try {
      const requestsRef = collection(db, 'attendanceRequests');
      const q = query(requestsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const requestsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AttendanceRequest[];
      
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitRequest = async (request: Omit<AttendanceRequest, 'id' | 'status' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'attendanceRequests'), {
        ...request,
        status: 'Pending',
        createdAt: new Date().toISOString()
      });
      fetchRequests();
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const updateRequestStatus = async (requestId: string, status: 'Approved' | 'Rejected') => {
    try {
      await updateDoc(doc(db, 'attendanceRequests', requestId), { status });
      fetchRequests();
    } catch (error) {
      console.error('Error updating request:', error);
    }
  };

  const deleteRequest = async (requestId: string) => {
    try {
      await deleteDoc(doc(db, 'attendanceRequests', requestId));
      fetchRequests();
    } catch (error) {
      console.error('Error deleting request:', error);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  return { requests, loading, submitRequest, updateRequestStatus, deleteRequest, refetch: fetchRequests };
};