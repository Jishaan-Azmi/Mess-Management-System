import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export interface MessItem {
  id?: string;
  name: string;
  category: string;
  price: number;
  createdAt: string;
}

export const useMessItems = () => {
  const [messItems, setMessItems] = useState<MessItem[]>([]);
  const [loading, setLoading] = useState(true);

  const ensureDefaultThali = async () => {
    try {
      const messItemsRef = collection(db, 'messItems');
      const snapshot = await getDocs(messItemsRef);
      const items = snapshot.docs.map(doc => doc.data());
      
      const thaliExists = items.some(item => item.name === 'Thali');
      
      if (!thaliExists) {
        await addDoc(messItemsRef, {
          name: 'Thali',
          category: 'Default',
          price: 50,
          createdAt: new Date().toISOString()
        });
      }
    } catch (error) {
      console.error('Error ensuring default thali:', error);
    }
  };

  const fetchMessItems = async () => {
    try {
      await ensureDefaultThali();
      
      const messItemsRef = collection(db, 'messItems');
      const q = query(messItemsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const messItemsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as MessItem[];
      
      setMessItems(messItemsData);
    } catch (error) {
      console.error('Error fetching mess items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addMessItem = async (messItem: Omit<MessItem, 'id' | 'createdAt'>) => {
    try {
      await addDoc(collection(db, 'messItems'), {
        ...messItem,
        createdAt: new Date().toISOString()
      });
      fetchMessItems();
    } catch (error) {
      console.error('Error adding mess item:', error);
      throw error;
    }
  };

  const updateMessItem = async (id: string, messItem: Partial<MessItem>) => {
    try {
      await updateDoc(doc(db, 'messItems', id), messItem);
      fetchMessItems();
    } catch (error) {
      console.error('Error updating mess item:', error);
      throw error;
    }
  };

  const deleteMessItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'messItems', id));
      fetchMessItems();
    } catch (error) {
      console.error('Error deleting mess item:', error);
      throw error;
    }
  };

  useEffect(() => {
    fetchMessItems();
  }, []);

  return { messItems, loading, addMessItem, updateMessItem, deleteMessItem, refetch: fetchMessItems };
};