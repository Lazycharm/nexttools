import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function InsufficientBalanceDialog({
  open,
  onOpenChange,
  amount,
  onDeposit,
  onPayWithCrypto,
  loading = false,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Insufficient Wallet Balance</DialogTitle>
          <DialogDescription>
            You need ${Number(amount || 0).toFixed(2)} to complete this purchase.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button className="flex-1" onClick={onDeposit} disabled={loading}>
            Deposit Now
          </Button>
          <Button variant="outline" className="flex-1" onClick={onPayWithCrypto} disabled={loading}>
            Pay with Crypto
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
