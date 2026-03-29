import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Users, Utensils, DollarSign, Calendar } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 pt-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mess Management System
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Modern attendance tracking and billing solution for college and hostel mess facilities
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Attendance Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Automated QR code-based attendance marking system
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-success" />
            </div>
            <h3 className="font-semibold mb-2">Billing System</h3>
            <p className="text-sm text-muted-foreground">
              Automatic monthly bill generation and payment tracking
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
              <Utensils className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">Menu Management</h3>
            <p className="text-sm text-muted-foreground">
              Easy mess item and pricing management
            </p>
          </Card>

          <Card className="p-6 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-warning" />
            </div>
            <h3 className="font-semibold mb-2">User Management</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive student and admin dashboard
            </p>
          </Card>
        </div>

        {/* Login Options */}
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="p-8 hover:shadow-xl transition-all hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Student Portal</h2>
                <p className="text-muted-foreground mb-6">
                  View attendance, bills, and manage payments
                </p>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => navigate("/student/login")}
                >
                  Student Login
                </Button>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-xl transition-all hover:scale-105">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                  <Utensils className="w-8 h-8 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
                <p className="text-muted-foreground mb-6">
                  Manage students, attendance, and billing
                </p>
                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full"
                  onClick={() => navigate("/admin/login")}
                >
                  Admin Login
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
