import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Lock, Mail, UserRound } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import * as authService from '../services/authService';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import { useUiStore } from '../store/uiStore';

const isValidEmail = (email) => /\S+@\S+\.\S+/.test(email);

export default function Auth() {
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { addToast } = useUiStore();
  const from = location.state?.from?.pathname || '/';
  const isSignup = mode === 'signup';

  const validateForm = () => {
    if (isSignup && name.trim().length < 2) return 'Please enter your full name';
    if (!isValidEmail(email)) return 'Please enter a valid email address';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationError = validateForm();
    setError(validationError);
    if (validationError) return;

    setIsLoading(true);
    try {
      const data = isSignup
        ? await authService.signupWithEmail(name, email, password)
        : await authService.loginWithEmail(email, password);

      login(data.user, data.accessToken || data.token);
      navigate(from, { replace: true });
      addToast({ type: 'success', message: isSignup ? 'Account created successfully' : 'Logged in successfully' });
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-primary)] flex flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/" className="mx-auto mb-8 text-2xl font-bold tracking-normal text-[var(--text-primary)]">
        Freshcart
      </Link>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h1 className="text-center text-3xl font-bold tracking-normal text-[var(--text-primary)]">
          {isSignup ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="mt-2 text-center text-sm text-[var(--text-secondary)]">
          Use email and password to continue.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-8 shadow-sm sm:px-10">
          <div className="mb-6 grid grid-cols-2 rounded-xl bg-[var(--bg-surface)] p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError('');
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                !isSignup ? 'bg-[var(--bg-card)] text-[#6366F1] shadow-sm' : 'text-[var(--text-secondary)]'
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError('');
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                isSignup ? 'bg-[var(--bg-card)] text-[#6366F1] shadow-sm' : 'text-[var(--text-secondary)]'
              }`}
            >
              Sign up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {isSignup && (
              <div className="relative">
                <UserRound className="pointer-events-none absolute left-4 top-[42px] h-5 w-5 text-[var(--text-secondary)]" />
                <Input
                  label="Full name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="pl-12"
                  required
                />
              </div>
            )}

            <div className="relative">
              <Mail className="pointer-events-none absolute left-4 top-[42px] h-5 w-5 text-[var(--text-secondary)]" />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-12"
                required
              />
            </div>

            <div className="relative">
              <Lock className="pointer-events-none absolute left-4 top-[42px] h-5 w-5 text-[var(--text-secondary)]" />
              <Input
                label="Password"
                type="password"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-12"
                required
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full py-4 text-base" disabled={isLoading}>
              {isLoading ? 'Please wait...' : isSignup ? 'Create account' : 'Login'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
