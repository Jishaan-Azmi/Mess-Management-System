import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Search, UserPlus, Edit, Trash2, Mail, Phone, Loader2, CheckCircle, XCircle, Eye } from "lucide-react";
import { toast } from "sonner";
import { useStudents } from "@/hooks/useStudents";
import { useAttendance } from "@/hooks/useAttendance";
import { useBilling } from "@/hooks/useBilling";

const AdminStudents = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", username: "", password: "" });
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { students, loading, addStudent, updateStudent, deleteStudent } = useStudents();
  const { attendance, refetch: refetchAttendance } = useAttendance();
  const { bills, refetch: refetchBills } = useBilling();

  const handleViewStudent = async (student: any) => {
    setSelectedStudent(student);
    await refetchAttendance(student.studentId);
    await refetchBills(student.studentId);
    setIsDetailsDialogOpen(true);
  };

  const getStudentAttendance = () => {
    if (!selectedStudent) return [];
    return attendance.filter(record => record.studentId === selectedStudent.studentId);
  };

  const getStudentBills = () => {
    if (!selectedStudent) return [];
    return bills.filter(bill => bill.studentId === selectedStudent.studentId);
  };

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const studentId = `STU${Date.now()}`;
      await addStudent({
        studentId,
        name: formData.name,
        username: formData.username,
        password: formData.password
      });
      toast.success("Student added successfully!");
      setFormData({ name: "", username: "", password: "" });
      setIsAddDialogOpen(false);
    } catch (error) {
      toast.error("Failed to add student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStudent = (student: any) => {
    setEditingStudent(student);
    setFormData({ name: student.name, username: student.username, password: student.password });
    setIsEditDialogOpen(true);
  };

  const handleUpdateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.password) {
      toast.error("Please fill all fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateStudent(editingStudent.id, {
        name: formData.name,
        username: formData.username,
        password: formData.password
      });
      toast.success("Student updated successfully!");
      setFormData({ name: "", username: "", password: "" });
      setIsEditDialogOpen(false);
      setEditingStudent(null);
    } catch (error) {
      toast.error("Failed to update student");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStudent = async (student: any) => {
    if (window.confirm(`Are you sure you want to delete ${student.name}?`)) {
      try {
        await deleteStudent(student.id);
        toast.success(`${student.name} deleted successfully!`);
      } catch (error) {
        toast.error("Failed to delete student");
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-6"
          onClick={() => navigate("/admin/dashboard")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Student Management</h1>
            <p className="text-muted-foreground">Manage student profiles and information</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>Enter student details to create a new profile</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddStudent} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="student-name">Full Name</Label>
                  <Input 
                    id="student-name" 
                    placeholder="Enter student name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-username">Username</Label>
                  <Input 
                    id="student-username" 
                    placeholder="Enter username" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="student-password">Password</Label>
                  <Input 
                    id="student-password" 
                    type="password"
                    placeholder="Enter password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    "Add Student"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Edit Student</DialogTitle>
                <DialogDescription>Update student details</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpdateStudent} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-student-name">Full Name</Label>
                  <Input 
                    id="edit-student-name" 
                    placeholder="Enter student name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-student-username">Username</Label>
                  <Input 
                    id="edit-student-username" 
                    placeholder="Enter username" 
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-student-password">Password</Label>
                  <Input 
                    id="edit-student-password" 
                    type="password"
                    placeholder="Enter password" 
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    "Update Student"
                  )}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Student Details - {selectedStudent?.name}</DialogTitle>
                <DialogDescription>Attendance and billing information</DialogDescription>
              </DialogHeader>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Attendance Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Attendance History</h3>
                  <div className="max-h-60 overflow-y-auto border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Day</TableHead>
                          <TableHead>Night</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(() => {
                          const now = new Date();
                          const currentMonth = now.getMonth();
                          const currentYear = now.getFullYear();
                          const currentDay = now.getDate();
                          const studentAttendance = getStudentAttendance();
                          const monthlyAttendance = [];
                          
                          // Generate dates from 1 to current day only
                          for (let day = 1; day <= currentDay; day++) {
                            const dateStr = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
                            
                            const afternoonRecord = studentAttendance.find(record => 
                              record.date === dateStr && record.timeSlot === 'Afternoon'
                            );
                            const nightRecord = studentAttendance.find(record => 
                              record.date === dateStr && record.timeSlot === 'Night'
                            );
                            
                            monthlyAttendance.push({
                              date: dateStr,
                              day: afternoonRecord?.status || 'Not Marked',
                              night: nightRecord?.status || 'Not Marked'
                            });
                          }
                          
                          return monthlyAttendance.map((record) => (
                            <TableRow key={record.date}>
                              <TableCell className="font-medium">{record.date}</TableCell>
                              <TableCell>
                                <Badge variant={record.day === "Present" ? "default" : record.day === "Absent" ? "destructive" : "secondary"} className="gap-1">
                                  {record.day === "Present" ? (
                                    <CheckCircle className="w-3 h-3" />
                                  ) : record.day === "Absent" ? (
                                    <XCircle className="w-3 h-3" />
                                  ) : (
                                    <XCircle className="w-3 h-3" />
                                  )}
                                  {record.day}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant={record.night === "Present" ? "default" : record.night === "Absent" ? "destructive" : "secondary"} className="gap-1">
                                  {record.night === "Present" ? (
                                    <CheckCircle className="w-3 h-3" />
                                  ) : record.night === "Absent" ? (
                                    <XCircle className="w-3 h-3" />
                                  ) : (
                                    <XCircle className="w-3 h-3" />
                                  )}
                                  {record.night}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ));
                        })()}
                        {getStudentAttendance().length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                              No attendance records found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Bills Section */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Billing History</h3>
                  <div className="max-h-60 overflow-y-auto border rounded">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getStudentBills().map((bill) => (
                          <TableRow key={bill.id}>
                            <TableCell className="font-medium">{bill.date}</TableCell>
                            <TableCell>{bill.itemName}</TableCell>
                            <TableCell className="font-semibold">₹{bill.price}</TableCell>
                          </TableRow>
                        ))}
                        {getStudentBills().length === 0 && (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                              No billing records found
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                  
                  {/* Summary */}
                  <div className="mt-4 p-4 bg-muted rounded">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="text-lg font-bold">₹{getStudentBills().reduce((sum, bill) => sum + bill.price, 0)}</span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-muted-foreground">Total Meals:</span>
                      <span className="text-sm">{getStudentBills().length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name or ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading students...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Username</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {students
                  .filter((student) =>
                    searchQuery === "" ||
                    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    student.username.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.studentId}</TableCell>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.username}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => handleViewStudent(student)}>
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleEditStudent(student)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="icon" variant="ghost" onClick={() => handleDeleteStudent(student)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                {students.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No students found. Add your first student to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminStudents;
