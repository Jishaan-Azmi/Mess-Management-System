import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface Student {
  id?: string;
  studentId: string;
  name: string;
  username: string;
  password: string;
  profilePhoto?: string;
  createdAt: string;
}

export const useStudents = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const studentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Student[];
      
      setStudents(studentsData);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const addStudent = async (student: Omit<Student, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'students'), {
        ...student,
        createdAt: new Date().toISOString()
      });
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      throw error;
    }
  };

  const updateStudent = async (id: string, student: Partial<Student>) => {
    try {
      await updateDoc(doc(db, 'students', id), student);
      fetchStudents();
    } catch (error) {
      console.error('Error updating student:', error);
      throw error;
    }
  };

  const deleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
      fetchStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return { students, loading, addStudent, updateStudent, deleteStudent, refetch: fetchStudents };
};