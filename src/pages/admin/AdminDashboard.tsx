import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Users, Calendar, Utensils, IndianRupee, LogOut, Bell, UserX, CheckCircle, Plane } from "lucide-react";
import { useStudents } from "@/hooks/useStudents";
import { useAttendance } from "@/hooks/useAttendance";
import { useAutoAttendance } from "@/hooks/useAutoAttendance";
import { useBilling } from "@/hooks/useBilling";
import { useEffect, useState } from "react";
import { NoticeDialog } from "@/components/NoticeDialog";
import { LogoutDialog } from "@/components/LogoutDialog";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { students } = useStudents();
  const { attendance, loading } = useAttendance();
  const { markAutoAttendance } = useAutoAttendance();
  const { bills } = useBilling();
  const [showNoticeDialog, setShowNoticeDialog] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  
  // Check if logged in and run auto attendance
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userType = localStorage.getItem('userType');
    
    if (!isLoggedIn || userType !== 'admin') {
      navigate('/admin/login');
      return;
    }
    
    markAutoAttendance();
  }, []);
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const thisMonthPresent = loading ? 0 : attendance.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === currentMonth && 
           recordDate.getFullYear() === currentYear && 
           record.status === 'Present';
  }).length;
  
  const thisMonthAbsent = loading ? 0 : attendance.filter(record => {
    const recordDate = new Date(record.date);
    return recordDate.getMonth() === currentMonth && 
           recordDate.getFullYear() === currentYear && 
           record.status === 'Absent';
  }).length;
  
  const thisMonthRevenue = bills.filter(bill => {
    const billDate = new Date(bill.date);
    return billDate.getMonth() === currentMonth && 
           billDate.getFullYear() === currentYear;
  }).reduce((sum, bill) => sum + bill.price, 0);
  
  const stats = [
    { label: "Total Students", value: students.length.toString(), icon: Users, color: "primary" },
    { label: "This Month Present", value: loading ? "Loading..." : thisMonthPresent.toString(), icon: Calendar, color: "success" },
    { label: "Monthly Absent", value: loading ? "Loading..." : thisMonthAbsent.toString(), icon: UserX, color: "destructive" },
    { label: "This Month Revenue", value: `₹${thisMonthRevenue}`, icon: IndianRupee, color: "secondary" },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowNoticeDialog(true)}>
                <Bell className="w-5 h-5" />
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
        <Card className="p-6 mb-8 bg-gradient-to-r from-secondary/10 to-primary/10">
          <div>
            <h2 className="text-2xl font-bold mb-2">Admin Control Panel</h2>
            <p className="text-muted-foreground">Manage your mess operations efficiently</p>
          </div>
        </Card>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg bg-${stat.color}/10 flex items-center justify-center`}>
                    <Icon className={`w-6 h-6 text-${stat.color}`} />
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
            onClick={() => navigate("/admin/students")}
          >
            <Users className="w-6 h-6" />
            Manage Students
          </Button>
          <Button
            className="h-24 flex-col gap-2"
            variant="outline"
            onClick={() => navigate("/admin/attendance-requests")}
          >
            <Calendar className="w-6 h-6" />
            Attendance Requests
          </Button>
          <Button
            className="h-24 flex-col gap-2"
            variant="outline"
            onClick={() => navigate("/admin/mess-items")}
          >
            <Utensils className="w-6 h-6" />
            Mess Items
          </Button>
          <Button
            className="h-24 flex-col gap-2"
            variant="outline"
            onClick={() => navigate("/admin/billing")}
          >
            <IndianRupee className="w-6 h-6" />
            Billing Overview
          </Button>
          <Button
            className="h-24 flex-col gap-2"
            variant="outline"
            onClick={() => navigate("/admin/payments")}
          >
            <CheckCircle className="w-6 h-6" />
            Payment Verification
          </Button>
          <Button
            className="h-24 flex-col gap-2"
            variant="outline"
            onClick={() => navigate("/admin/leave-management")}
          >
            <Plane className="w-6 h-6" />
            Leave Management
          </Button>
        </div>
      </div>
      
      <NoticeDialog open={showNoticeDialog} onOpenChange={setShowNoticeDialog} />
      <LogoutDialog 
        open={showLogoutDialog} 
        onOpenChange={setShowLogoutDialog}
        onConfirm={() => {
          localStorage.clear();
          navigate('/');
        }}
      />
    </div>
  );
};

export default AdminDashboard;
