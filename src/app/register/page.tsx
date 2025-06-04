
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Key, User } from 'lucide-react';
import { Logo } from '@/components/icons';

export default function RegisterPage() {
  const { registerUser, currentUser } = useAppContext();
  const router = useRouter();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // const [confirmPassword, setConfirmPassword] = useState(''); // Optional: for password confirmation
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // If user is already logged in, redirect to home
    if (currentUser) {
      router.push('/');
    }
  }, [currentUser, router]);

   if (currentUser && typeof window !== 'undefined' && window.location.pathname === '/register') {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // if (password !== confirmPassword) { // Optional: password confirmation check
    //   toast({ title: "Passwords do not match", variant: "destructive" });
    //   return;
    // }
    setIsLoading(true);
    const success = await registerUser(username, password);
    if (!success) {
      setIsLoading(false); // Only set to false if registration failed, otherwise login handles redirect
    }
    // Navigation is handled by registerUser on success OR the useEffect above
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-8 left-8 flex items-center gap-2 text-2xl font-semibold text-foreground">
        <Logo className="h-10 w-10 text-primary" />
        <span>LUN'S MEDIA</span>
      </div>
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold flex items-center justify-center">
            <UserPlus className="mr-2 h-8 w-8 text-primary" /> Register
          </CardTitle>
          <CardDescription>Create a new account to start shopping.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center">
                <User className="mr-2 h-4 w-4 text-muted-foreground" />
                Username
              </Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center">
                <Key className="mr-2 h-4 w-4 text-muted-foreground" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                disabled={isLoading}
              />
            </div>
            {/* Optional: Confirm Password
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                required
              />
            </div>
            */}
            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-foreground"></div>
              ) : (
                <>
                  <UserPlus className="mr-2 h-5 w-5" /> Register
                </>
              )}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Login here
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    