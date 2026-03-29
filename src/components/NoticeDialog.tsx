import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { useNotices } from "@/hooks/useNotices";

interface NoticeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const NoticeDialog = ({ open, onOpenChange }: NoticeDialogProps) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const { sendNotice } = useNotices();

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return;
    
    await sendNotice(title, message);
    setTitle('');
    setMessage('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Notice to All Students</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notice title"
            />
          </div>
          <div>
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notice message"
              rows={4}
            />
          </div>
          <Button onClick={handleSend} className="w-full" disabled={!title.trim() || !message.trim()}>
            Send Notice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};