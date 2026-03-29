import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useLeaveManagement } from "@/hooks/useLeaveManagement";

interface LeaveRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  studentId: string;
  isRejoin?: boolean;
}

export const LeaveRequestDialog = ({ open, onOpenChange, studentId, isRejoin = false }: LeaveRequestDialogProps) => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [isOpenEnded, setIsOpenEnded] = useState(false);
  const { submitLeaveRequest, submitRejoinRequest } = useLeaveManagement();

  const handleSubmit = async () => {
    if (!reason.trim()) {
      return;
    }

    if (isRejoin) {
      await submitRejoinRequest(studentId, reason);
    } else {
      if (!startDate) return;
      await submitLeaveRequest(
        studentId,
        startDate,
        isOpenEnded ? null : endDate,
        reason
      );
    }
    
    setStartDate('');
    setEndDate('');
    setReason('');
    setIsOpenEnded(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isRejoin ? 'Request to Rejoin' : 'Request Leave'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {!isRejoin && (
            <>
              <div>
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="openEnded"
                  checked={isOpenEnded}
                  onCheckedChange={(checked) => setIsOpenEnded(checked as boolean)}
                />
                <Label htmlFor="openEnded">Open-ended leave (no end date)</Label>
              </div>
              
              {!isOpenEnded && (
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              )}
            </>
          )}
          
          <div>
            <Label htmlFor="reason">Reason</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isRejoin ? "Reason for rejoining" : "Reason for leave"}
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleSubmit} 
            className="w-full" 
            disabled={!reason.trim() || (!isRejoin && !startDate)}
          >
            Submit {isRejoin ? 'Rejoin' : 'Leave'} Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};