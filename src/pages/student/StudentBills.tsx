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
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Eye, Loader2 } from "lucide-react";
import { useBilling } from "@/hooks/useBilling";
import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";

const StudentBills = () => {
  const navigate = useNavigate();
  const { getCurrentStudent } = useAuth();
  const { bills, loading, refetch } = useBilling();
  
  const currentStudent = getCurrentStudent();
  const studentId = currentStudent?.studentId || "STU2024001";
  
  useEffect(() => {
    refetch(studentId);
  }, [studentId]);
  
  const studentBills = bills.filter(bill => bill.studentId === studentId);
  const totalAmount = studentBills.reduce((sum, bill) => sum + bill.price, 0);
  const totalMeals = studentBills.length;
  const avgPerMeal = totalMeals > 0 ? Math.round(totalAmount / totalMeals) : 0;
  
  // Group bills by date
  const billsByDate = studentBills.reduce((acc, bill) => {
    const key = bill.date;
    if (!acc[key]) acc[key] = { date: key, afternoon: 0, night: 0, total: 0 };
    if (bill.timeSlot === 'Afternoon') acc[key].afternoon += bill.price;
    if (bill.timeSlot === 'Night') acc[key].night += bill.price;
    acc[key].total += bill.price;
    return acc;
  }, {} as Record<string, any>);
  
  const dailyBreakdown = Object.values(billsByDate);

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

        <h1 className="text-3xl font-bold mb-2">Monthly Bills</h1>
        <p className="text-muted-foreground mb-6">View and download your mess bills</p>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Bill History</h2>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Loading bills...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {studentBills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell className="font-medium">{bill.date}</TableCell>
                        <TableCell>{bill.itemName}</TableCell>
                        <TableCell>{bill.timeSlot}</TableCell>
                        <TableCell className="font-semibold">₹{bill.price}</TableCell>
                      </TableRow>
                    ))}
                    {studentBills.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          No bills found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-warning/10 to-destructive/10">
            <h3 className="font-semibold mb-4">Current Month Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Meals</span>
                <span className="font-semibold">{totalMeals}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Avg. per Meal</span>
                <span className="font-semibold">₹{avgPerMeal}</span>
              </div>
              <div className="border-t pt-3 mt-3">
                <div className="flex justify-between">
                  <span className="font-semibold">Total Amount</span>
                  <span className="text-2xl font-bold text-warning">₹{totalAmount}</span>
                </div>
              </div>
              <Button
                className="w-full mt-4"
                onClick={() => navigate("/student/payments")}
              >
                Pay Now
              </Button>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Daily Breakdown</h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Afternoon</TableHead>
                <TableHead>Night</TableHead>
                <TableHead>Daily Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dailyBreakdown.map((day, index) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">{day.date}</TableCell>
                  <TableCell>₹{day.afternoon}</TableCell>
                  <TableCell>₹{day.night}</TableCell>
                  <TableCell className="font-semibold">₹{day.total}</TableCell>
                </TableRow>
              ))}
              {dailyBreakdown.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No daily breakdown available.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      </div>
    </div>
  );
};

export default StudentBills;
