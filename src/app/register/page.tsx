'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          // Depending on Supabase settings, email confirmation might be required
          // emailRedirectTo: `${location.origin}/auth/callback`,
        }
      });

      if (error) {
        throw error;
      }

      setSuccess(true);
      // We don't automatically redirect if email confirmation is turned on.
      // If auto-confirm is on in Supabase, they could be logged in immediately.
      
      // router.push('/account');
      // router.refresh();
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center bg-surface p-12 rounded-sm border border-surfaceBorder">
          <h2 className="text-3xl font-serif text-textPrimary tracking-tight">Check your email</h2>
          <p className="text-textSecondary mt-2">
            We've sent a confirmation link to <strong>{email}</strong>. Please click the link to verify your account.
          </p>
          <div className="pt-6">
            <Link href="/login" className="text-sm font-bold uppercase tracking-widest text-accent hover:underline">
              Return to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-200px)] flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-10">
        <div>
          <h2 className="text-center text-4xl font-serif text-textPrimary tracking-tight">
            Create Account
          </h2>
          <p className="mt-3 text-center text-sm text-textSecondary uppercase tracking-widest font-semibold">
            Join the VEJO Studio family
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="first-name" className="sr-only">First Name</label>
                <input
                  id="first-name"
                  name="first-name"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-4 border border-surfaceBorder placeholder-gray-400 text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm bg-surface transition-colors"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="last-name" className="sr-only">Last Name</label>
                <input
                  id="last-name"
                  name="last-name"
                  type="text"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-4 border border-surfaceBorder placeholder-gray-400 text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm bg-surface transition-colors"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-4 border border-surfaceBorder placeholder-gray-400 text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm bg-surface transition-colors"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-4 border border-surfaceBorder placeholder-gray-400 text-textPrimary focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent sm:text-sm bg-surface transition-colors"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center font-medium bg-red-50 py-3 rounded-md">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-sm font-bold tracking-widest uppercase rounded-none text-white bg-accent hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <span className="flex items-center gap-2">
                  Create Account <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </button>
          </div>
        </form>

        <div className="text-center mt-6 border-t border-surfaceBorder pt-6">
          <p className="text-sm text-textSecondary">
            Already have an account?{' '}
            <Link href="/login" className="font-semibold text-textPrimary hover:text-accent uppercase tracking-wider text-xs ml-1">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
