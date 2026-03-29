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
import { ArrowLeft, Check, X, Calendar } from "lucide-react";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";
import { useStudents } from "@/hooks/useStudents";

const AdminLeaveManagement = () => {
  const navigate = useNavigate();
  const { leaveRequests, approveLeaveRequest, rejectLeaveRequest } = useLeaveManagement();
  const { students } = useStudents();

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.studentId === studentId);
    return student?.name || studentId;
  };

  const pendingRequests = leaveRequests.filter(r => r.status === 'Pending' && !r.rejoinRequest);
  const rejoinRequests = leaveRequests.filter(r => r.status === 'Pending' && r.rejoinRequest);
  const activeLeaves = students.filter(s => s.onLeave);

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

        <h1 className="text-3xl font-bold mb-2">Leave Management</h1>
        <p className="text-muted-foreground mb-6">Manage student leave requests and active leaves</p>

        {/* Pending Leave Requests */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Pending Leave Requests ({pendingRequests.length})
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {getStudentName(request.studentId)}
                  </TableCell>
                  <TableCell>{new Date(request.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {request.isOpenEnded ? (
                      <Badge variant="secondary">Open-ended</Badge>
                    ) : (
                      request.endDate ? new Date(request.endDate).toLocaleDateString() : 'N/A'
                    )}
                  </TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveLeaveRequest(request.id!, false)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectLeaveRequest(request.id!)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {pendingRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No pending leave requests
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Rejoin Requests */}
        <Card className="p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">
            Rejoin Requests ({rejoinRequests.length})
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rejoinRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="font-medium">
                    {getStudentName(request.studentId)}
                  </TableCell>
                  <TableCell>{new Date(request.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>{request.reason}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => approveLeaveRequest(request.id!, true)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Approve Return
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => rejectLeaveRequest(request.id!)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {rejoinRequests.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground">
                    No pending rejoin requests
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>

        {/* Active Leaves */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">
            Students Currently on Leave ({activeLeaves.length})
          </h2>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeLeaves.map((student) => (
                <TableRow key={student.studentId}>
                  <TableCell className="font-medium">{student.studentId}</TableCell>
                  <TableCell>{student.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">On Leave</Badge>
                  </TableCell>
                </TableRow>
              ))}
              {activeLeaves.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No students currently on leave
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

export default AdminLeaveManagement;