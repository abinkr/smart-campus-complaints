import { zodResolver } from '@hookform/resolvers/zod';
import { LogIn, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { PORTAL_HOME_PATH, PORTAL_ROLE, PORTAL_ROLE_LABEL } from '../portalConfig';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email address.'),
  password: z.string().min(1, 'Password is required.')
});

const mfaSchema = z.object({
  code: z.string().trim().regex(/^\d{6}$/, 'Enter the 6-digit code.')
});

function parseApiError(error) {
  if (!error.response) return 'Unable to connect. Please try again.';
  if (error.response.status === 403) return "You don't have permission to do this";
  return error.response?.data?.message || 'Something went wrong';
}

export default function Login() {
  const navigate = useNavigate();
  const { user, login, verifyMfa } = useAuth();
  const [mfaChallenge, setMfaChallenge] = useState(null);
  const [pendingEmail, setPendingEmail] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });
  const {
    register: registerMfa,
    handleSubmit: handleMfaSubmit,
    formState: { errors: mfaErrors, isSubmitting: isVerifying }
  } = useForm({
    resolver: zodResolver(mfaSchema),
    defaultValues: {
      code: ''
    }
  });

  if (user) {
    return <Navigate to={PORTAL_HOME_PATH} replace />;
  }

  async function onSubmit(values) {
    try {
      const data = await login(values.email, values.password);
      setPendingEmail(values.email);
      setMfaChallenge(data);
      toast.info(`Verification code sent to ${data.delivery?.destination || 'your email'}`);
    } catch (error) {
      const message = parseApiError(error);
      if (message === 'Invalid email or password') {
        toast.error('Invalid credentials');
      } else {
        toast.error(message);
      }
    }
  }

  async function onVerifyMfa(values) {
    try {
      await verifyMfa(mfaChallenge.mfaToken, values.code);
      navigate(PORTAL_HOME_PATH, { replace: true });
    } catch (error) {
      toast.error(parseApiError(error));
    }
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <section className="card">
          {!mfaChallenge ? (
            <>
              <h1 className="text-2xl font-semibold text-gray-900">{PORTAL_ROLE_LABEL} Login</h1>
              <p className="mt-1 text-sm text-gray-600">
                Sign in through the dedicated {PORTAL_ROLE} portal.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
                <Input
                  id="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  error={errors.email?.message}
                  {...register('email')}
                />
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  autoComplete="current-password"
                  error={errors.password?.message}
                  {...register('password')}
                />
                <Button type="submit" loading={isSubmitting} className="w-full">
                  <LogIn size={16} />
                  Continue
                </Button>
              </form>
            </>
          ) : (
            <>
              <h1 className="text-2xl font-semibold text-gray-900">Verify {PORTAL_ROLE_LABEL} Login</h1>
              <p className="mt-1 text-sm text-gray-600">
                Enter the 6-digit code sent to {mfaChallenge.delivery?.destination || pendingEmail}.
              </p>

              <form className="mt-6 space-y-4" onSubmit={handleMfaSubmit(onVerifyMfa)}>
                <Input
                  id="code"
                  label="Verification Code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  error={mfaErrors.code?.message}
                  {...registerMfa('code')}
                />
                <Button type="submit" loading={isVerifying} className="w-full">
                  <ShieldCheck size={16} />
                  Verify & Sign In
                </Button>
                <Button type="button" variant="secondary" className="w-full" onClick={() => setMfaChallenge(null)}>
                  Use a different account
                </Button>
              </form>
            </>
          )}

          <p className="mt-4 text-sm text-gray-600">
            Need a {PORTAL_ROLE} account?{' '}
            <Link to="/register" className="font-medium text-blue-700 hover:text-blue-800">
              Register
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
