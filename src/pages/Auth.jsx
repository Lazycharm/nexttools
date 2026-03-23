import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/AuthContext';
import { toast } from 'sonner';

export default function Auth() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, login, signUp } = useAuth();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [lastError, setLastError] = useState('');

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (!isLoading && isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setLastError('');
    try {
      const email = form.email.trim().toLowerCase();
      if (mode === 'login') {
        const { error } = await login({ email, password: form.password });
        if (error) throw error;
        toast.success('Signed in successfully');
      } else {
        const { data, error } = await signUp({
          fullName: form.fullName,
          email,
          password: form.password,
        });
        if (error) throw error;
        if (data?.session) {
          toast.success('Account created and signed in');
        } else {
          toast.success('Account created. Confirm your email, then sign in.');
        }
        setMode('login');
      }
    } catch (error) {
      const message = error?.message || 'Authentication failed';
      setLastError(message);
      if (message.toLowerCase().includes('email not confirmed')) {
        toast.error('Email not confirmed. Open your inbox and verify first.');
      } else if (message.toLowerCase().includes('invalid login credentials')) {
        toast.error('Invalid email or password.');
      } else {
        toast.error(message);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>{mode === 'login' ? 'Sign in' : 'Create account'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {mode === 'signup' && (
              <div>
                <Label className="text-xs">Full name</Label>
                <Input
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>
            )}
            <div>
              <Label className="text-xs">Email</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Password</Label>
              <Input
                type="password"
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                required
                minLength={6}
              />
            </div>
            <Button className="w-full" type="submit" disabled={submitting}>
              {submitting
                ? mode === 'login'
                  ? 'Signing in...'
                  : 'Creating...'
                : mode === 'login'
                ? 'Sign in'
                : 'Create account'}
            </Button>
            {lastError && (
              <p className="text-xs text-destructive">{lastError}</p>
            )}
          </form>

          <Button
            type="button"
            variant="ghost"
            className="w-full mt-3"
            onClick={() => setMode((prev) => (prev === 'login' ? 'signup' : 'login'))}
          >
            {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
