import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { auth, googleProvider } from '../../lib/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithPopup } from 'firebase/auth';
import { supabase } from '../../lib/supabase';

export const AuthScreen: React.FC = () => {
  const { navigateTo, goBack } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email) {
      setError('Please enter your email.');
      return;
    }
    if (!validateEmail(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (mode === 'forgot') {
      setLoading(true);
      try {
        await sendPasswordResetEmail(auth, email);
        setSuccess('Password reset email sent.');
      } catch (err: any) {
        setError(err.message || 'Unable to send password reset email.');
      } finally {
        setLoading(false);
      }
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (mode === 'signup') {
      if (!name) {
        setError('Please enter your name.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        // Create Supabase profile
        if (supabase) {
          await supabase.from('users').insert({
            id: userCredential.user.uid,
            email: userCredential.user.email,
            display_name: name,
            created_at: new Date().toISOString()
          });
        }
        navigateTo('home');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        navigateTo('home');
      }
    } catch (err: any) {
      // Map Firebase errors to human-readable errors
      let errorMessage = 'An error occurred during authentication.';
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        errorMessage = 'Email or password is incorrect.';
      } else if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (err.code === 'auth/network-request-failed') {
        errorMessage = 'Network failure. Please check your connection.';
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // Ensure Supabase profile exists
      if (supabase) {
         const { data } = await supabase.from('users').select('id').eq('id', result.user.uid).single();
         if (!data) {
           await supabase.from('users').insert({
              id: result.user.uid,
              email: result.user.email,
              display_name: result.user.displayName,
              avatar_url: result.user.photoURL,
              created_at: new Date().toISOString()
           });
         }
      }
      navigateTo('home');
    } catch (err: any) {
      setError(err.message || 'Google authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between px-6 py-6 max-w-md mx-auto">
      {/* Top Bar with Back Arrow */}
      <div className="flex items-center">
        <button
          onClick={goBack}
          aria-label="Go back"
          className="w-10 h-10 rounded-full bg-white/70 border border-white/80 flex items-center justify-center text-[#151515] hover:bg-white shadow-sm cursor-pointer active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Center Auth Card */}
      <div className="flex-1 flex flex-col justify-center my-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6 text-center"
        >
          {/* Brand Logo */}
          <div className="flex items-center justify-center">
            <span className="text-3xl font-extrabold tracking-tight text-[#151515]">LEX</span>
            <span className="text-3xl font-extrabold tracking-tight text-[#FF6B22]">FLOW</span>
          </div>

          <div className="space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-[#151515]">
              {mode === 'signin' && 'Sign in to continue'}
              {mode === 'signup' && 'Create an account'}
              {mode === 'forgot' && 'Reset your password'}
            </h2>
            <p className="text-sm text-[#6F6A64]">
              {mode === 'forgot' ? 'Enter your email to receive a reset link' : 'Access your documents securely'}
            </p>
          </div>

          {(mode === 'signin' || mode === 'signup') && (
            <>
              {/* Continue with Google (Glass Button) */}
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-2xl glass-panel hover:bg-white/90 text-[#151515] font-semibold flex items-center justify-center gap-3 shadow-md shadow-[#46321e]/5 active:scale-[0.99] transition-all cursor-pointer border border-white/80 disabled:opacity-50"
              >
                {/* Google G Logo SVG */}
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Or Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-stone-200/80 w-full" />
                <span className="bg-[#F7F2EC] px-3 text-xs text-[#6F6A64] font-medium uppercase absolute">
                  or
                </span>
              </div>
            </>
          )}

          {/* Email Input Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <AnimatePresence mode="popLayout">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl text-left"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-center gap-2 text-green-700 text-sm bg-green-50 p-3 rounded-xl text-left"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  aria-label="Name"
                  className="w-full px-4 py-3.5 rounded-2xl glass-input text-sm text-[#151515] placeholder-stone-400"
                />
              </motion.div>
            )}

            <div className="relative">
              <Mail className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                aria-label="Email address"
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl glass-input text-sm text-[#151515] placeholder-stone-400"
              />
            </div>

            {mode !== 'forgot' && (
              <div className="relative">
                <Lock className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  aria-label="Password"
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl glass-input text-sm text-[#151515] placeholder-stone-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            )}

            {mode === 'signup' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="relative"
              >
                <Lock className="w-5 h-5 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  aria-label="Confirm password"
                  className="w-full pl-11 pr-11 py-3.5 rounded-2xl glass-input text-sm text-[#151515] placeholder-stone-400"
                />
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-2xl bg-white/70 hover:bg-white text-stone-700 font-semibold border border-white/90 shadow-sm active:scale-[0.99] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-stone-400 border-t-transparent rounded-full animate-spin" />
                  Please wait...
                </span>
              ) : (
                mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Sign Up' : 'Send Reset Link'
              )}
            </button>
          </form>

          {/* Mode Toggles */}
          <div className="flex flex-col space-y-3 pt-4 text-sm text-[#6F6A64]">
            {mode === 'signin' && (
              <>
                <button type="button" onClick={() => setMode('forgot')} className="hover:text-[#151515] hover:underline transition-colors">
                  Forgot password?
                </button>
                <button type="button" onClick={() => setMode('signup')} className="hover:text-[#151515] hover:underline transition-colors">
                  Don't have an account? Sign up
                </button>
              </>
            )}
            {mode === 'signup' && (
              <button type="button" onClick={() => setMode('signin')} className="hover:text-[#151515] hover:underline transition-colors">
                Already have an account? Sign in
              </button>
            )}
            {mode === 'forgot' && (
              <button type="button" onClick={() => setMode('signin')} className="hover:text-[#151515] hover:underline transition-colors">
                Back to Sign in
              </button>
            )}
          </div>
        </motion.div>
      </div>

      {/* Footer Legal Terms */}
      <div className="text-center pt-4">
        <p className="text-xs text-[#6F6A64] leading-relaxed max-w-xs mx-auto">
          By continuing, you agree to our{' '}
          <button onClick={() => navigateTo('terms')} className="text-[#151515] font-medium cursor-pointer hover:underline bg-transparent border-none p-0">
            Terms of Service
          </button>{' '}
          and{' '}
          <button onClick={() => navigateTo('terms')} className="text-[#151515] font-medium cursor-pointer hover:underline bg-transparent border-none p-0">
            Privacy Policy
          </button>
          .
        </p>
      </div>
    </div>
  );
};

