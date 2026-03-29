import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Phone, Home, Camera } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useStudents } from "@/hooks/useStudents";

const StudentProfile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string>("");
  const [formData, setFormData] = useState({ name: "", username: "" });
  
  const { getCurrentStudent } = useAuth();
  const { updateStudent } = useStudents();
  
  const currentStudent = getCurrentStudent();
  
  useEffect(() => {
    if (!currentStudent) {
      navigate('/student/login');
      return;
    }
    setFormData({ name: currentStudent.name, username: currentStudent.username });
    setProfilePhoto(currentStudent.profilePhoto || "");
  }, [currentStudent, navigate]);

  const handleCancel = () => {
    setFormData({ name: currentStudent?.name || "", username: currentStudent?.username || "" });
    setProfilePhoto(currentStudent?.profilePhoto || "");
    setIsEditing(false);
  };

  const handlePhotoSelect = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentStudent) return;
    
    if (file.size > 1024 * 1024) {
      toast.error("File size must be less than 1MB");
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file");
      return;
    }
    
    const reader = new FileReader();
    reader.onload = async () => {
      const base64String = reader.result as string;
      
      try {
        // Update database immediately
        await updateStudent(currentStudent.id, {
          profilePhoto: base64String
        });
        
        // Update local state and localStorage
        setProfilePhoto(base64String);
        const updatedStudent = { ...currentStudent, profilePhoto: base64String };
        localStorage.setItem('currentStudent', JSON.stringify(updatedStudent));
        
        toast.success("Profile photo updated!");
      } catch (error) {
        toast.error("Failed to update photo");
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSave = async () => {
    if (!currentStudent) return;
    
    if (!formData.name.trim() || !formData.username.trim()) {
      toast.error("Name and username are required");
      return;
    }
    
    try {
      await updateStudent(currentStudent.id, {
        name: formData.name.trim(),
        username: formData.username.trim()
      });
      
      // Update localStorage
      const updatedStudent = {
        ...currentStudent,
        name: formData.name.trim(),
        username: formData.username.trim(),
        profilePhoto: profilePhoto
      };
      localStorage.setItem('currentStudent', JSON.stringify(updatedStudent));
      
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      toast.error("Failed to update profile");
    }
  };
  
  if (!currentStudent) {
    return null;
  }

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

        <Card className="max-w-2xl mx-auto p-8">
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <Avatar className="w-32 h-32 cursor-pointer" onClick={handlePhotoSelect}>
                <AvatarImage 
                  src={profilePhoto || undefined} 
                  alt="Profile" 
                  className="object-cover w-full h-full" 
                />
                <AvatarFallback className="text-2xl bg-primary/10">
                  <User className="w-12 h-12" />
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                className="absolute bottom-0 right-0 rounded-full"
                variant="secondary"
                onClick={handlePhotoSelect}
              >
                <Camera className="w-4 h-4" />
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <h1 className="text-2xl font-bold mt-4">{currentStudent.name}</h1>
            <p className="text-muted-foreground">ID: {currentStudent.studentId}</p>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({...formData, username: e.target.value})}
                  className="pl-10"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="studentId">Student ID</Label>
              <div className="relative">
                <Home className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="studentId"
                  value={currentStudent.studentId}
                  className="pl-10"
                  disabled
                />
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              {!isEditing ? (
                <Button onClick={() => setIsEditing(true)} className="w-full">
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button onClick={handleSave} className="flex-1">
                    Save Changes
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;
