import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowRight, KeyRound, Lock, Mail, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { z } from 'zod';
import { registerUser } from '../api/authApi';
import { useAuth } from '../hooks/useAuth';
import { PORTAL_HOME_PATH, PORTAL_LOGIN_PATH, PORTAL_ROLE, PORTAL_ROLE_LABEL } from '../portalConfig';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'Password must include an uppercase letter.')
    .regex(/[a-z]/, 'Password must include a lowercase letter.')
    .regex(/[0-9]/, 'Password must include a number.')
    .regex(/[^A-Za-z0-9]/, 'Password must include a special character.'),
  ...(PORTAL_ROLE === 'admin'
    ? {
        adminRegistrationKey: z.string().min(1, 'Admin registration key is required.')
      }
    : {})
});

function parseApiError(error) {
  if (!error.response) return 'Unable to connect. Please try again.';
  if (error.response.status === 403) return "You don't have permission to do this";
  return error.response?.data?.message || 'Something went wrong';
}

export default function Register() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      ...(PORTAL_ROLE === 'admin' ? { adminRegistrationKey: '' } : {})
    }
  });

  if (user) {
    return <Navigate to={PORTAL_HOME_PATH} replace />;
  }

  async function onSubmit(values) {
    try {
      await registerUser(values, PORTAL_ROLE);
      toast.success(`${PORTAL_ROLE_LABEL} account created. Sign in and verify the code sent to your email.`);
      navigate(PORTAL_LOGIN_PATH, { replace: true });
    } catch (error) {
      toast.error(parseApiError(error));
    }
  }

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
        <section className="bg-surface-container-lowest rounded-2xl p-10 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-outline-variant text-center">
          <h1 className="font-display-sm text-display-sm text-primary font-bold">{PORTAL_ROLE_LABEL} Register</h1>
          <p className="mt-2 font-body-md text-body-md text-on-surface-variant max-w-[280px] mx-auto">
            Create a dedicated {PORTAL_ROLE} account for this portal.
          </p>

          <form className="mt-8 space-y-5 text-left" onSubmit={handleSubmit(onSubmit)}>
            <Input 
              id="name" 
              label="Name" 
              icon={UserPlus}
              placeholder="Full Name"
              error={errors.name?.message} 
              {...register('name')} 
            />
            <Input
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              icon={Mail}
              placeholder="Email Address"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              autoComplete="new-password"
              icon={Lock}
              placeholder="Strong Password"
              error={errors.password?.message}
              {...register('password')}
            />
            {PORTAL_ROLE === 'admin' && (
              <Input
                id="adminRegistrationKey"
                label="Admin Registration Key"
                type="password"
                autoComplete="off"
                icon={KeyRound}
                placeholder="Secure Admin Key"
                error={errors.adminRegistrationKey?.message}
                {...register('adminRegistrationKey')}
              />
            )}

            <div className="pt-2">
              <Button type="submit" loading={isSubmitting} className="group w-full h-12 text-base font-semibold rounded-lg flex justify-center items-center gap-2">
                Create {PORTAL_ROLE_LABEL} Account
                {!isSubmitting && <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1" />}
              </Button>
            </div>
          </form>

          <p className="mt-8 font-body-sm text-body-sm text-on-surface-variant">
            Already have an account?{' '}
            <Link to={PORTAL_LOGIN_PATH} className="font-semibold text-primary hover:text-secondary transition-colors">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
