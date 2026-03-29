import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Lock, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { loginAdmin, isLoggedIn, getUserType } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if already logged in
  useEffect(() => {
    if (isLoggedIn() && getUserType() === 'admin') {
      navigate('/admin/dashboard');
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.target as HTMLFormElement);
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    
    try {
      if (username === 'admin' && password === 'admin123') {
        await loginAdmin('admin@mess.com', 'password123');
        toast.success("Admin login successful!");
        navigate("/admin/dashboard");
      } else {
        toast.error("Invalid credentials. Use username: admin, password: admin123");
      }
    } catch (error) {
      toast.error("Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-secondary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Admin Portal</h1>
            <p className="text-muted-foreground">Secure access for administrators</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="admin-username">Admin Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-username"
                  name="username"
                  placeholder="Enter admin username"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  name="password"
                  type="password"
                  placeholder="Enter admin password"
                  className="pl-10"
                  required
                />
              </div>
            </div>

            <Button type="submit" variant="secondary" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Admin Login"}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
