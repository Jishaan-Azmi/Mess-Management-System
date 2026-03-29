import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Search, FileText, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useBilling } from "@/hooks/useBilling";
import { useStudents } from "@/hooks/useStudents";
import { toast } from "sonner";

const AdminBilling = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { bills, loading: billsLoading } = useBilling();
  const { students, loading: studentsLoading } = useStudents();
  
  const currentMonth = new Date().toLocaleString('default', { month: 'long', year: 'numeric' });
  
  // Calculate billing data from real data
  const billingData = students.map(student => {
    const studentBills = bills.filter(bill => bill.studentId === student.studentId);
    const totalAmount = studentBills.reduce((sum, bill) => sum + bill.price, 0);
    const mealCount = studentBills.length;
    
    return {
      studentId: student.studentId,
      name: student.name,
      month: currentMonth,
      meals: mealCount,
      amount: `₹${totalAmount.toLocaleString()}`,
      status: totalAmount > 0 ? "Pending" : "No Bills"
    };
  });
  
  // Calculate summary stats
  const totalRevenue = bills.reduce((sum, bill) => sum + bill.price, 0);
  const collected = Math.floor(totalRevenue * 0.8); // Assume 80% collected
  const pending = totalRevenue - collected;
  const thisMonth = bills.filter(bill => {
    const billDate = new Date(bill.date);
    const now = new Date();
    return billDate.getMonth() === now.getMonth() && billDate.getFullYear() === now.getFullYear();
  }).reduce((sum, bill) => sum + bill.price, 0);

  const handleExportReport = () => {
    const csvContent = [
      ['Student ID', 'Name', 'Month', 'Meals', 'Amount', 'Status'],
      ...billingData.map(bill => [
        bill.studentId,
        bill.name,
        bill.month,
        bill.meals,
        bill.amount,
        bill.status
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `billing-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Report exported successfully!');
  };

  const handleViewBill = (studentId: string) => {
    toast.info(`Viewing bill for student ${studentId}`);
  };

  const handleDownloadBill = (studentId: string, studentName: string) => {
    const student = billingData.find(b => b.studentId === studentId);
    if (!student) return;
    
    const billContent = `
BILL RECEIPT
============
Student ID: ${student.studentId}
Name: ${student.name}
Month: ${student.month}
Total Meals: ${student.meals}
Amount: ${student.amount}
Status: ${student.status}

Generated on: ${new Date().toLocaleString()}
`;
    
    const blob = new Blob([billContent], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bill-${studentId}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success(`Bill downloaded for ${studentName}`);
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
            <h1 className="text-3xl font-bold mb-2">Billing Overview</h1>
            <p className="text-muted-foreground">Monitor and manage student bills</p>
          </div>
          <Button onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-primary/10">
            <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
            <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
          </Card>
          <Card className="p-6 bg-success/10">
            <p className="text-sm text-muted-foreground mb-1">Collected</p>
            <p className="text-2xl font-bold text-success">₹{collected.toLocaleString()}</p>
          </Card>
          <Card className="p-6 bg-warning/10">
            <p className="text-sm text-muted-foreground mb-1">Pending</p>
            <p className="text-2xl font-bold text-warning">₹{pending.toLocaleString()}</p>
          </Card>
          <Card className="p-6 bg-secondary/10">
            <p className="text-sm text-muted-foreground mb-1">This Month</p>
            <p className="text-2xl font-bold">₹{thisMonth.toLocaleString()}</p>
          </Card>
        </div>

        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by student name or ID..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {billsLoading || studentsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading billing data...</span>
            </div>
          ) : (
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Meals</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingData
                .filter((bill) =>
                  searchQuery === "" ||
                  bill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  bill.studentId.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((bill, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{bill.studentId}</TableCell>
                    <TableCell>{bill.name}</TableCell>
                    <TableCell>{bill.month}</TableCell>
                    <TableCell>{bill.meals}</TableCell>
                    <TableCell className="font-semibold">{bill.amount}</TableCell>
                    <TableCell>
                      <Badge variant={bill.status === "Paid" ? "default" : "secondary"}>
                        {bill.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleViewBill(bill.studentId)}
                          title="View Bill"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="icon" 
                          variant="ghost"
                          onClick={() => handleDownloadBill(bill.studentId, bill.name)}
                          title="Download Bill"
                        >
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {billingData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No billing data found.
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

export default AdminBilling;
