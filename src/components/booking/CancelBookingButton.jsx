import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Ban } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * "Cancel booking" button + confirmation dialog (optional reason).
 * Sets status to cancelled with cancelled_by / cancel_reason / cancelled_at.
 */
export default function CancelBookingButton({ booking, cancelledBy, onDone }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);

  const handleConfirm = async () => {
    setActing(true);
    const updates = {
      status: 'cancelled',
      cancelled_by: cancelledBy,
      cancelled_at: new Date().toISOString(),
      ...(reason.trim() ? { cancel_reason: reason.trim() } : {}),
    };
    await base44.entities.Booking.update(booking.id, updates);
    setActing(false);
    setOpen(false);
    onDone(updates);
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        className="rounded-xl gap-1.5 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
        onClick={() => setOpen(true)}
      >
        <Ban className="w-3.5 h-3.5" />
        Cancel booking
      </Button>

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
            <AlertDialogDescription>
              {cancelledBy === 'guide'
                ? "The traveller will see this booking as cancelled by you. This can't be undone."
                : "The guide will see this booking as cancelled by you. This can't be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={2}
            placeholder="Reason (optional)"
            className="w-full px-3 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-foreground/30 resize-none"
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Keep booking</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={acting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {acting ? 'Cancelling…' : 'Cancel Booking'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}