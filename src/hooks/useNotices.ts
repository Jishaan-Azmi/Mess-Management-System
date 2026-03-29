import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { toast } from 'sonner';

export interface Notice {
  id?: string;
  title: string;
  message: string;
  createdAt: string;
  createdBy: string;
}

export interface NoticeRead {
  id?: string;
  noticeId: string;
  studentId: string;
  readAt: string;
}

export const useNotices = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotices = async () => {
    try {
      const noticesRef = collection(db, 'notices');
      const q = query(noticesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const noticesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Notice[];
      setNotices(noticesData);
    } catch (error) {
      console.error('Error fetching notices:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendNotice = async (title: string, message: string) => {
    try {
      await addDoc(collection(db, 'notices'), {
        title,
        message,
        createdAt: new Date().toISOString(),
        createdBy: 'admin'
      });
      toast.success('Notice sent to all students!');
      fetchNotices();
    } catch (error) {
      console.error('Error sending notice:', error);
      toast.error('Failed to send notice');
    }
  };

  const markNoticeAsRead = async (noticeId: string, studentId: string) => {
    try {
      await addDoc(collection(db, 'noticeReads'), {
        noticeId,
        studentId,
        readAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error marking notice as read:', error);
    }
  };

  const getUnreadNotices = async (studentId: string) => {
    try {
      const readsRef = collection(db, 'noticeReads');
      const readsSnapshot = await getDocs(query(readsRef));
      const readNoticeIds = readsSnapshot.docs
        .filter(doc => doc.data().studentId === studentId)
        .map(doc => doc.data().noticeId);
      
      return notices.filter(notice => !readNoticeIds.includes(notice.id!));
    } catch (error) {
      console.error('Error getting unread notices:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  return { notices, loading, sendNotice, markNoticeAsRead, getUnreadNotices, refetch: fetchNotices };
};