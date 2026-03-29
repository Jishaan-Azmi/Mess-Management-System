import { useEffect } from 'react';
import { collection, getDocs, query, where, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export const useAutoAttendance = () => {
  const markAutoAttendance = async () => {
    try {
      const now = new Date();
      const lastRun = localStorage.getItem('lastAutoAttendance');
      
      // Determine the date range to process
      let startDate: Date;
      if (lastRun) {
        startDate = new Date(lastRun);
        startDate.setDate(startDate.getDate() + 1); // Start from day after last run
      } else {
        // If no last run, start from yesterday
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
      }
      
      const endDate = new Date(now);
      endDate.setDate(now.getDate() - 1); // End at yesterday
      
      // If start date is after end date, nothing to process
      if (startDate > endDate) {
        console.log('Auto attendance is up to date');
        return;
      }
      
      // Get all students
      const studentsSnapshot = await getDocs(collection(db, 'students'));
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Get Thali price
      const messItemsSnapshot = await getDocs(collection(db, 'messItems'));
      const thaliItem = messItemsSnapshot.docs.find(doc => doc.data().name === 'Thali');
      const thaliPrice = thaliItem ? thaliItem.data().price : 50;
      
      // Process each day in the range
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const attendanceDate = currentDate.toISOString().split('T')[0];
        console.log('Processing auto attendance for', attendanceDate);
        
        // Get attendance records for this date
        const attendanceSnapshot = await getDocs(
          query(collection(db, 'attendance'), where('date', '==', attendanceDate))
        );
        const attendanceRecords = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // Get absence requests for this date
        const requestsSnapshot = await getDocs(
          query(collection(db, 'attendanceRequests'), 
                where('date', '==', attendanceDate), 
                where('status', '==', 'Pending'))
        );
        const absenceRequests = requestsSnapshot.docs.map(doc => doc.data());
        
        for (const student of students) {
          for (const timeSlot of ['Afternoon', 'Night']) {
            // Check if attendance already exists for this student, date, and timeSlot
            const existingAttendance = attendanceRecords.find(
              record => record.studentId === student.studentId && 
                       record.timeSlot === timeSlot &&
                       record.date === attendanceDate
            );
            
            // Skip if attendance already exists
            if (existingAttendance) continue;
            
            // Check if student is on leave
            if (student.onLeave) {
              // Mark attendance as Leave (no billing)
              await addDoc(collection(db, 'attendance'), {
                studentId: student.studentId,
                date: attendanceDate,
                timeSlot,
                status: 'Leave',
                time: timeSlot === 'Afternoon' ? '01:00 PM' : '08:00 PM'
              });
              continue;
            }
            
            // Check if there's a pending absence request
            const hasAbsenceRequest = absenceRequests.find(
              request => request.studentId === student.studentId && request.timeSlot === timeSlot
            );
            
            // If no absence request, mark as Present
            if (!hasAbsenceRequest) {
              // Mark attendance as Present
              await addDoc(collection(db, 'attendance'), {
                studentId: student.studentId,
                date: attendanceDate,
                timeSlot,
                status: 'Present',
                time: timeSlot === 'Afternoon' ? '01:00 PM' : '08:00 PM'
              });
              
              // Add Thali to bill (only for Present status)
              await addDoc(collection(db, 'bills'), {
                studentId: student.studentId,
                itemName: 'Thali',
                price: thaliPrice,
                date: attendanceDate,
                timeSlot,
                createdAt: new Date().toISOString()
              });
            }
          }
        }
        
        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      // Mark that auto attendance has been run up to yesterday
      const lastProcessedDate = endDate.toISOString().split('T')[0];
      localStorage.setItem('lastAutoAttendance', lastProcessedDate);
      console.log('Auto attendance processed from', startDate.toISOString().split('T')[0], 'to', lastProcessedDate);
    } catch (error) {
      console.error('Error marking auto attendance:', error);
    }
  };

  return { markAutoAttendance };
};