import {onSchedule} from 'firebase-functions/v2/scheduler';
import {initializeApp} from 'firebase-admin/app';
import {getFirestore} from 'firebase-admin/firestore';

initializeApp();

export const autoMarkAttendance = onSchedule(
  '0 0 * * *', // Runs at midnight every day
  async (event) => {
    try {
      const db = getFirestore();
      const today = new Date().toISOString().split('T')[0];
      
      // Get all students
      const studentsSnapshot = await db.collection('students').get();
      const students = studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      // Get today's attendance records
      const attendanceSnapshot = await db
        .collection('attendance')
        .where('date', '==', today)
        .get();
      const attendanceRecords = attendanceSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() as any }));
      
      // Get today's absence requests
      const requestsSnapshot = await db
        .collection('attendanceRequests')
        .where('date', '==', today)
        .where('status', '==', 'Pending')
        .get();
      const absenceRequests = requestsSnapshot.docs.map(doc => doc.data() as any);
      
      // Get Thali price
      const messItemsSnapshot = await db.collection('messItems').get();
      const thaliItem = messItemsSnapshot.docs.find(doc => doc.data().name === 'Thali');
      const thaliPrice = thaliItem ? thaliItem.data().price : 50;
      
      for (const student of students) {
        for (const timeSlot of ['Afternoon', 'Night']) {
          // Check if attendance already exists
          const existingAttendance = attendanceRecords.find(
            (record: any) => record.studentId === student.studentId && 
                           record.timeSlot === timeSlot &&
                           record.date === today
          );
          
          // Check if there's a pending absence request
          const hasAbsenceRequest = absenceRequests.find(
            (request: any) => request.studentId === student.studentId && request.timeSlot === timeSlot
          );
          
          // If no attendance record and no absence request, mark as Present
          if (!existingAttendance && !hasAbsenceRequest) {
            // Mark attendance as Present
            await db.collection('attendance').add({
              studentId: student.studentId,
              date: today,
              timeSlot,
              status: 'Present',
              time: timeSlot === 'Afternoon' ? '01:00 PM' : '08:00 PM'
            });
            
            // Add Thali to bill
            await db.collection('bills').add({
              studentId: student.studentId,
              itemName: 'Thali',
              price: thaliPrice,
              date: today,
              timeSlot,
              createdAt: new Date().toISOString()
            });
          }
        }
      }
      
      console.log('Auto attendance marked for', today);
    } catch (error) {
      console.error('Error marking auto attendance:', error);
      throw error;
    }
  }
);
