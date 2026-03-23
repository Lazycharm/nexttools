import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import StatCard from '@/components/dashboard/StatCard';
import { Wallet, CreditCard, TrendingUp, ArrowRight } from 'lucide-react';

export default function DashboardWallet() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Wallet</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your balance and deposits</p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <StatCard title="Available Balance" value={`$${(user?.wallet_balance || 0).toFixed(2)}`} icon={Wallet} />
        <StatCard title="Total Deposited" value={`$${(user?.total_deposits || 0).toFixed(2)}`} icon={CreditCard} />
        <StatCard title="Total Spent" value={`$${(user?.total_spent || 0).toFixed(2)}`} icon={TrendingUp} />
      </div>

      <Card>
        <CardContent className="p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Add funds to your wallet</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Deposit cryptocurrency to your wallet and use the balance to purchase any service on the platform.
          </p>
          <Link to="/dashboard/deposits">
            <Button className="gap-2">
              Make a Deposit <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}