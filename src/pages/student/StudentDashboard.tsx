import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { Calendar, IndianRupee, CheckCircle, User, LogOut, Bell, Plane } from "lucide-react";
import { useAttendance } from "@/hooks/useAttendance";
import { useBilling } from "@/hooks/useBilling";
import { useAuth } from "@/hooks/useAuth";
import { useNotices } from "@/hooks/useNotices";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useEffect, useState } from "react";
import { NoticesPanel } from "@/components/NoticesPanel";
import { LeaveRequestDialog } from "@/components/LeaveRequestDialog";
import { LogoutDialog } from "@/components/LogoutDialog";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const { getCurrentStudent, logout } = useAuth();
  const currentStudent = getCurrentStudent();
  
  const studentId = currentStudent?.studentId || "";
  const studentName = currentStudent?.name || "Student";
  
  const { attendance } = useAttendance(studentId);
  const { bills } = useBilling(studentId);
  const { getUnreadNotices } = useNotices();
  const { leaveRequests, refetch } = useLeaveManagement();
  
  // Refetch leave requests when component mounts to ensure fresh data
  useEffect(() => {
    if (studentId) {
      refetch(studentId);
    }
  }, [studentId, refetch]);
  const [showNoticesPanel, setShowNoticesPanel] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showLeaveDialog, setShowLeaveDialog] = useState(false);
  const [showRejoinDialog, setShowRejoinDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  // Filter leave requests for current student and sort by creation date
  const studentLeaveRequests = leaveRequests
    .filter(r => r.studentId === currentStudent?.studentId)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  // Get the most recent leave request
  const latestLeaveRequest = studentLeaveRequests.find(r => !r.rejoinRequest && r.status === 'Approved');
  
  // Get the most recent rejoin request after the latest leave
  const latestRejoinRequest = latestLeaveRequest ? 
    studentLeaveRequests.find(r => 
      r.rejoinRequest && 
      r.status === 'Approved' && 
      new Date(r.createdAt) > new Date(latestLeaveRequest.createdAt)
    ) : null;
  
  // Check if student has pending rejoin request
  const hasPendingRejoin = studentLeaveRequests.some(r => 
    r.status === 'Pending' && 
    r.rejoinRequest
  );
  
  // Student is on leave if they have latest approved leave and no rejoin after it
  const isOnLeave = !!latestLeaveRequest && !latestRejoinRequest;
  
  // Debug logging
  console.log('Student Leave Debug:', {
    studentId: currentStudent?.studentId,
    latestLeaveRequest: !!latestLeaveRequest,
    latestRejoinRequest: !!latestRejoinRequest,
    hasPendingRejoin,
    isOnLeave,
    totalRequests: studentLeaveRequests.length
  });
  
  // Redirect if not logged in
  useEffect(() => {
    if (!currentStudent) {
      navigate('/student/login');
    }
  }, [currentStudent, navigate]);
  
  // Check for unread notices
  useEffect(() => {
    const checkUnreadNotices = async () => {
      if (currentStudent && getUnreadNotices) {
        const unreadNotices = await getUnreadNotices(currentStudent.studentId);
        setUnreadCount(unreadNotices.length);
      }
    };
    checkUnreadNotices();
    
    // Refresh unread count when notices panel closes
    if (!showNoticesPanel) {
      checkUnreadNotices();
    }
  }, [currentStudent, getUnreadNotices, showNoticesPanel]);
  
  // Filter data for current student and full current month
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const firstOfMonth = new Date(currentYear, currentMonth, 1).toISOString().split('T')[0];
  const lastOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString().split('T')[0];
  
  const studentAttendance = attendance.filter(record => {
    const recordDate = new Date(record.date);
    const monthStart = new Date(currentYear, currentMonth, 1);
    const monthEnd = new Date(currentYear, currentMonth + 1, 0);
    return recordDate >= monthStart && recordDate <= monthEnd;
  });
  const studentBills = bills.filter(bill => bill.studentId === studentId);
  
  const presentCount = studentAttendance.filter(record => record.status === 'Present').length;
  const totalCount = studentAttendance.length;
  const totalBillAmount = studentBills.reduce((sum, bill) => sum + bill.price, 0);
  
  // Get next meal time
  const currentHour = now.getHours();
  const nextMeal = currentHour < 13 ? "Afternoon at 1:00 PM" : "Night at 8:00 PM";
  
  const stats = [
    { label: "This Month Attendance", value: `${presentCount} meals`, icon: CheckCircle, bgColor: "bg-green-100", iconColor: "text-green-600" },
    { label: "Total Bill Amount", value: `₹${totalBillAmount}`, icon: IndianRupee, bgColor: "bg-yellow-100", iconColor: "text-yellow-600" },
    { label: "Next Meal", value: nextMeal, icon: Calendar, bgColor: "bg-blue-100", iconColor: "text-blue-600" },
  ];
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  if (!currentStudent) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Student Dashboard</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="relative" onClick={() => setShowNoticesPanel(true)}>
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowLogoutDialog(true)}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Card */}
        <Card className="p-6 mb-8 bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage 
                src={currentStudent?.profilePhoto || undefined} 
                alt="Profile" 
                className="object-cover w-full h-full" 
              />
              <AvatarFallback className="bg-primary/20">
                <User className="w-8 h-8 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">Welcome back, {studentName}!</h2>
              <p className="text-muted-foreground">ID: {studentId}</p>
            </div>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 ${stat.iconColor}`} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Button
            className="h-24 flex-col gap-2"
            variant="outline"
            onClick={() => navigate("/student/profile")}
          >
            <User className="w-6 h-6" />
            My Profile
          </Button>
          <Button
            className="h-24 flex-col gap-2"
            variant="outline"
            onClick={() => navigate("/student/attendance")}
          >
            <Calendar className="w-6 h-6" />
            Attendance
          </Button>
          <Button
            className="h-24 flex-col gap-2"
            variant="outline"
            onClick={() => navigate("/student/bills")}
          >
            <IndianRupee className="w-6 h-6" />
            View Bills
          </Button>
          <Button
            className="h-24 flex-col gap-2"
            variant="outline"
            onClick={() => navigate("/student/payments")}
          >
            <CheckCircle className="w-6 h-6" />
            Payments
          </Button>
          {isOnLeave ? (
            hasPendingRejoin ? (
              <Button
                className="h-24 flex-col gap-2"
                variant="outline"
                disabled
              >
                <Plane className="w-6 h-6" />
                Rejoin Request Pending
              </Button>
            ) : (
              <Button
                className="h-24 flex-col gap-2"
                variant="outline"
                onClick={() => setShowRejoinDialog(true)}
              >
                <Plane className="w-6 h-6" />
                Request to Rejoin
              </Button>
            )
          ) : (
            <Button
              className="h-24 flex-col gap-2"
              variant="outline"
              onClick={() => setShowLeaveDialog(true)}
            >
              <Plane className="w-6 h-6" />
              Request Leave
            </Button>
          )}
        </div>
      </div>
      
      <NoticesPanel open={showNoticesPanel} onOpenChange={setShowNoticesPanel} />
      <LeaveRequestDialog 
        open={showLeaveDialog} 
        onOpenChange={setShowLeaveDialog}
        studentId={studentId}
      />
      <LeaveRequestDialog 
        open={showRejoinDialog} 
        onOpenChange={setShowRejoinDialog}
        studentId={studentId}
        isRejoin={true}
      />
      <LogoutDialog 
        open={showLogoutDialog} 
        onOpenChange={setShowLogoutDialog}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default StudentDashboard;
