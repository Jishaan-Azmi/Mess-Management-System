import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import React from "react";
import { toast } from "sonner";
import { useAttendance } from "@/hooks/useAttendance";
import { useAttendanceRequests } from "@/hooks/useAttendanceRequests";
import { useAuth } from "@/hooks/useAuth";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

const StudentAttendance = () => {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [requestDate, setRequestDate] = useState<string>("");
  const [requestTimeSlot, setRequestTimeSlot] = useState<string>("");
  
  const { getCurrentStudent } = useAuth();
  const currentStudent = getCurrentStudent();
  const studentId = currentStudent?.studentId || "";
  const { attendance, loading, refetch } = useAttendance(studentId);
  const { submitRequest } = useAttendanceRequests();
  const [directAttendance, setDirectAttendance] = useState<any[]>([]);
  
  // Direct fetch from Firebase
  const fetchDirectAttendance = async () => {
    if (!studentId) return;
    try {
      const attendanceRef = collection(db, 'attendance');
      const q = query(attendanceRef, where('studentId', '==', studentId));
      const snapshot = await getDocs(q);
      const records = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setDirectAttendance(records);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    }
  };

  // Force refresh attendance data when component mounts and when dialog closes
  React.useEffect(() => {
    if (studentId) {
      fetchDirectAttendance();
      refetch();
    }
  }, [studentId]);
  
  React.useEffect(() => {
    if (!isOpen && studentId) {
      // Refresh when dialog closes to get updated data
      fetchDirectAttendance();
      refetch();
    }
  }, [isOpen, studentId]);

  // Generate complete monthly attendance records
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  
  const monthlyAttendance = [];
  
  // Generate all dates for current month (from day 1 to current day)
  for (let day = 1; day <= daysInMonth; day++) {
    // Create date string in YYYY-MM-DD format to match database
    const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const formattedDate = `${day.toString().padStart(2, '0')}/${(currentMonth + 1).toString().padStart(2, '0')}/${currentYear}`;
    
    // Check for afternoon record in database using direct fetch
    const afternoonRecord = directAttendance.find(record => 
      record.date === dateStr && record.timeSlot === 'Afternoon'
    );
    
    // Check for night record in database using direct fetch
    const nightRecord = directAttendance.find(record => 
      record.date === dateStr && record.timeSlot === 'Night'
    );
    
    // Determine status: if record exists, use its status; otherwise 'Not Marked'
    const afternoonStatus = afternoonRecord ? afternoonRecord.status : 'Not Marked';
    const nightStatus = nightRecord ? nightRecord.status : 'Not Marked';
    
    monthlyAttendance.push({
      id: dateStr,
      date: formattedDate,
      afternoon: {
        status: afternoonStatus
      },
      night: {
        status: nightStatus
      }
    });
  }
  
  // Keep chronological order (01 to 31)
  
  const presentCount = attendance.filter(record => record.status === 'Present').length;
  const absentCount = attendance.filter(record => record.status === 'Absent').length;
  const totalCount = presentCount + absentCount;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const handleAbsenceRequest = async () => {
    if (!selectedDate || !selectedTimeSlot) {
      toast.error("Please select both date and time slot");
      return;
    }
    
    try {
      // Fix timezone issue by using local date format
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      
      if (selectedTimeSlot === "Day and Night") {
        // Submit requests for both time slots
        await submitRequest({
          studentId,
          date: dateStr,
          timeSlot: "Afternoon",
          reason: "Student requested absence marking"
        });
        await submitRequest({
          studentId,
          date: dateStr,
          timeSlot: "Night",
          reason: "Student requested absence marking"
        });
      } else {
        await submitRequest({
          studentId,
          date: dateStr,
          timeSlot: selectedTimeSlot === "Day" ? "Afternoon" : selectedTimeSlot as 'Afternoon' | 'Night',
          reason: "Student requested absence marking"
        });
      }
      toast.success(`Absence request submitted for ${selectedTimeSlot} on ${dateStr}`);
      setSelectedTimeSlot("");
      setIsOpen(false);
    } catch (error) {
      toast.error("Failed to submit request");
    }
  };

  const handleRequestAbsence = (date: string, timeSlot: 'Afternoon' | 'Night') => {
    setRequestDate(date);
    setRequestTimeSlot(timeSlot);
    setIsOpen(true);
  };



  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/student/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Attendance History</h1>
            <p className="text-muted-foreground">View and manage your meal attendance</p>
          </div>
          <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
              setRequestDate("");
              setRequestTimeSlot("");
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <AlertCircle className="w-4 h-4 mr-2" />
                Request Absence Mark
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request Absence Marking</DialogTitle>
                <DialogDescription>
                  {requestDate && requestTimeSlot ? 
                    `Request to mark ${requestDate} ${requestTimeSlot} as absent` :
                    "Select a date when you missed a meal and want it marked as absent"
                  }
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                {requestDate && requestTimeSlot ? (
                  <>
                    <div>
                      <Label>Selected Date:</Label>
                      <p className="text-sm font-medium">{requestDate}</p>
                    </div>
                    <div>
                      <Label>Selected Time Slot:</Label>
                      <p className="text-sm font-medium">{requestTimeSlot}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      This will send a request to the admin for approval. If approved, this meal will be marked as absent and removed from your bill.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="flex justify-center">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        className="rounded-md border"
                      />
                    </div>
                    <div className="space-y-3">
                      <Label>Select Time Slot:</Label>
                      <Select value={selectedTimeSlot} onValueChange={setSelectedTimeSlot}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Day">Day</SelectItem>
                          <SelectItem value="Night">Night</SelectItem>
                          <SelectItem value="Day and Night">Day and Night</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
              <Button onClick={requestDate && requestTimeSlot ? 
                () => {
                  handleAbsenceRequest();
                  setRequestDate("");
                  setRequestTimeSlot("");
                } : 
                handleAbsenceRequest
              }>
                {requestDate && requestTimeSlot ? "Send Request to Admin" : "Submit Request"}
              </Button>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6 mb-6 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Present</p>
              <p className="text-2xl font-bold text-success">{presentCount} meals</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Absent</p>
              <p className="text-2xl font-bold text-destructive">{absentCount} meals</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Attendance Rate</p>
              <p className="text-2xl font-bold">{attendanceRate}%</p>
            </div>
          </div>
        </Card>

        <Card>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading attendance...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Afternoon</TableHead>
                  <TableHead>Night</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyAttendance.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell className="font-medium">{record.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            record.afternoon.status === "Present" ? "default" : 
                            record.afternoon.status === "Absent" ? "destructive" :
                            record.afternoon.status === "Leave" ? "outline" : "secondary"
                          }
                          className="gap-1"
                        >
                          {record.afternoon.status === "Present" ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : record.afternoon.status === "Absent" ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {record.afternoon.status}
                        </Badge>
                        {record.afternoon.status === "Present" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequestAbsence(record.id, 'Afternoon')}
                          >
                            Request Absent
                          </Button>
                        )}
                        {record.afternoon.status === "Leave" && (
                          <span className="text-sm text-muted-foreground">On Leave</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            record.night.status === "Present" ? "default" : 
                            record.night.status === "Absent" ? "destructive" :
                            record.night.status === "Leave" ? "outline" : "secondary"
                          }
                          className="gap-1"
                        >
                          {record.night.status === "Present" ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : record.night.status === "Absent" ? (
                            <XCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {record.night.status}
                        </Badge>
                        {record.night.status === "Present" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRequestAbsence(record.id, 'Night')}
                          >
                            Request Absent
                          </Button>
                        )}
                        {record.night.status === "Leave" && (
                          <span className="text-sm text-muted-foreground">On Leave</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default StudentAttendance;
