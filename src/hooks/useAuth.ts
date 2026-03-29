import { useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useAuth = () => {
  const [loading, setLoading] = useState(false);

  const loginStudent = async (username: string, password: string) => {
    setLoading(true);
    try {
      const studentsRef = collection(db, 'students');
      const q = query(studentsRef, where('username', '==', username), where('password', '==', password));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        throw new Error('Invalid credentials');
      }
      
      const studentData = snapshot.docs[0].data();
      const userData = {
        id: snapshot.docs[0].id,
        ...studentData,
        loginTime: new Date().toISOString()
      };
      
      localStorage.setItem('currentStudent', JSON.stringify(userData));
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userType', 'student');
      
      return true;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const loginAdmin = async (email: string, password: string) => {
    setLoading(true);
    try {
      if (email === 'admin@mess.com' && password === 'password123') {
        const adminData = {
          email,
          role: 'admin',
          loginTime: new Date().toISOString()
        };
        
        localStorage.setItem('currentAdmin', JSON.stringify(adminData));
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', 'admin');
        
        return true;
      } else {
        throw new Error('Invalid admin credentials');
      }
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStudent = () => {
    const student = localStorage.getItem('currentStudent');
    return student ? JSON.parse(student) : null;
  };

  const getCurrentAdmin = () => {
    const admin = localStorage.getItem('currentAdmin');
    return admin ? JSON.parse(admin) : null;
  };
  
  const isLoggedIn = () => {
    return localStorage.getItem('isLoggedIn') === 'true';
  };
  
  const getUserType = () => {
    return localStorage.getItem('userType');
  };

  const logout = () => {
    localStorage.removeItem('currentStudent');
    localStorage.removeItem('currentAdmin');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userType');
  };

  return { 
    loginStudent, 
    loginAdmin,
    getCurrentStudent, 
    getCurrentAdmin,
    isLoggedIn,
    getUserType,
    logout, 
    loading 
  };
};