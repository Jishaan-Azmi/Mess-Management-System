import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

export interface LeaveRequest {
  id?: string;
  studentId: string;
  startDate: string;
  endDate?: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  isOpenEnded: boolean;
  approvedBy?: string;
  rejoinRequest: boolean;
  createdAt: string;
}

export const useLeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaveRequests = async (studentId?: string) => {
    try {
      const leaveRef = collection(db, 'leaveRequests');
      const q = studentId 
        ? query(leaveRef, where('studentId', '==', studentId), orderBy('createdAt', 'desc'))
        : query(leaveRef, orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(q);
      const requests = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as LeaveRequest[];
      
      setLeaveRequests(requests);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitLeaveRequest = async (
    studentId: string,
    startDate: string,
    endDate: string | null,
    reason: string
  ) => {
    try {
      const leaveData: any = {
        studentId,
        startDate,
        reason,
        status: 'Pending',
        isOpenEnded: !endDate,
        rejoinRequest: false,
        createdAt: new Date().toISOString()
      };
      
      // Only add endDate if it has a value
      if (endDate) {
        leaveData.endDate = endDate;
      }

      await addDoc(collection(db, 'leaveRequests'), leaveData);
      toast.success('Leave request submitted successfully!');
      fetchLeaveRequests(studentId);
    } catch (error) {
      console.error('Error submitting leave request:', error);
      toast.error('Failed to submit leave request');
    }
  };

  const submitRejoinRequest = async (studentId: string, reason: string) => {
    try {
      const rejoinData: Omit<LeaveRequest, 'id'> = {
        studentId,
        startDate: new Date().toISOString().split('T')[0],
        reason,
        status: 'Pending',
        isOpenEnded: false,
        rejoinRequest: true,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'leaveRequests'), rejoinData);
      toast.success('Rejoin request submitted successfully!');
      fetchLeaveRequests(studentId);
    } catch (error) {
      console.error('Error submitting rejoin request:', error);
      toast.error('Failed to submit rejoin request');
    }
  };

  const approveLeaveRequest = async (requestId: string, isRejoin: boolean = false) => {
    try {
      await updateDoc(doc(db, 'leaveRequests', requestId), {
        status: 'Approved',
        approvedBy: 'admin'
      });

      const request = leaveRequests.find(r => r.id === requestId);
      if (request) {
        // Update student's onLeave status
        const studentsSnapshot = await getDocs(
          query(collection(db, 'students'), where('studentId', '==', request.studentId))
        );
        
        if (!studentsSnapshot.empty) {
          const studentDoc = studentsSnapshot.docs[0];
          await updateDoc(doc(db, 'students', studentDoc.id), {
            onLeave: isRejoin ? false : true
          });
        }
      }

      toast.success(`${isRejoin ? 'Rejoin' : 'Leave'} request approved!`);
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const rejectLeaveRequest = async (requestId: string) => {
    try {
      await updateDoc(doc(db, 'leaveRequests', requestId), {
        status: 'Rejected'
      });

      toast.success('Request rejected');
      fetchLeaveRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  return {
    leaveRequests,
    loading,
    submitLeaveRequest,
    submitRejoinRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    refetch: fetchLeaveRequests
  };
};