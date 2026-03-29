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
import { ArrowLeft, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAttendanceRequests } from "@/hooks/useAttendanceRequests";
import { useAttendance } from "@/hooks/useAttendance";
import { useStudents } from "@/hooks/useStudents";
import { useBilling } from "@/hooks/useBilling";

const AdminAttendanceRequests = () => {
  const navigate = useNavigate();
  const { requests, loading, updateRequestStatus, deleteRequest } = useAttendanceRequests();
  const { markAttendance } = useAttendance();
  const { students } = useStudents();
  const { addThaliToBill } = useBilling();

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.studentId === studentId);
    return student ? student.name : `Unknown Student (${studentId})`;
  };

  const pendingRequests = requests.filter(r => r.status === 'Pending');
  const pendingCount = pendingRequests.length;
  const approvedCount = 0;
  const rejectedCount = 0;

  const handleApprove = async (request: any) => {
    try {
      // Mark attendance as absent (this will also remove the bill)
      await markAttendance({
        studentId: request.studentId,
        date: request.date,
        timeSlot: request.timeSlot,
        status: 'Absent',
        time: '-'
      });
      
      // Delete the request
      await deleteRequest(request.id!);
      
      const studentName = getStudentName(request.studentId);
      toast.success(`Approved absence for ${studentName} on ${request.date} (${request.timeSlot})`);
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleReject = async (request: any) => {
    try {
      // Just delete the request, keep attendance as Present
      await deleteRequest(request.id!);
      
      const studentName = getStudentName(request.studentId);
      toast.info(`Rejected absence request for ${studentName} on ${request.date} (${request.timeSlot})`);
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
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

        <h1 className="text-3xl font-bold mb-2">Attendance Requests</h1>
        <p className="text-muted-foreground mb-6">Review and approve absence marking requests</p>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-warning/10">
            <div className="flex items-center gap-4">
              <Clock className="w-10 h-10 text-warning" />
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold">{pendingCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-success/10">
            <div className="flex items-center gap-4">
              <CheckCircle className="w-10 h-10 text-success" />
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold">{approvedCount}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 bg-destructive/10">
            <div className="flex items-center gap-4">
              <XCircle className="w-10 h-10 text-destructive" />
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold">{rejectedCount}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="ml-2">Loading requests...</span>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time Slot</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell className="font-medium">{request.studentId}</TableCell>
                    <TableCell>{getStudentName(request.studentId)}</TableCell>
                    <TableCell>{request.date}</TableCell>
                    <TableCell>{request.timeSlot}</TableCell>
                    <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === "Pending"
                            ? "secondary"
                            : request.status === "Approved"
                            ? "default"
                            : "destructive"
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {request.status === "Pending" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApprove(request)}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleReject(request)}
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
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

export default AdminAttendanceRequests;
