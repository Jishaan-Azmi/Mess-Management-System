import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNotices } from "@/hooks/useNotices";
import { useAuth } from "@/hooks/useAuth";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface NoticesPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NoticesPanel = ({ open, onOpenChange }: NoticesPanelProps) => {
  const { notices } = useNotices();
  const { getCurrentStudent } = useAuth();
  const { markNoticeAsRead } = useNotices();
  const currentStudent = getCurrentStudent();

  // Mark all notices as read when panel opens
  useEffect(() => {
    if (open && currentStudent) {
      notices.forEach(notice => {
        if (notice.id) {
          markNoticeAsRead(notice.id, currentStudent.studentId);
        }
      });
    }
  }, [open, notices, currentStudent, markNoticeAsRead]);

  const handleNoticeClick = async (noticeId: string) => {
    if (currentStudent) {
      await markNoticeAsRead(noticeId, currentStudent.studentId);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Notices</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {notices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No notices available</p>
          ) : (
            notices.map((notice) => (
              <Card key={notice.id} className="p-4" onClick={() => handleNoticeClick(notice.id!)}>
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold">{notice.title}</h3>
                  <Badge variant="secondary">
                    {new Date(notice.createdAt).toLocaleDateString()}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-2">{notice.message}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(notice.createdAt).toLocaleString()}
                </p>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};