import { zodResolver } from '@hookform/resolvers/zod';
import { UserPlus } from 'lucide-react';
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
    <main className="min-h-screen bg-gray-50 px-4 py-10">
      <div className="mx-auto max-w-md">
        <section className="card">
          <h1 className="text-2xl font-semibold text-gray-900">{PORTAL_ROLE_LABEL} Register</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create a dedicated {PORTAL_ROLE} account for this portal.
          </p>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <Input id="name" label="Name" error={errors.name?.message} {...register('name')} />
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
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            {PORTAL_ROLE === 'admin' && (
              <Input
                id="adminRegistrationKey"
                label="Admin Registration Key"
                type="password"
                autoComplete="off"
                error={errors.adminRegistrationKey?.message}
                {...register('adminRegistrationKey')}
              />
            )}

            <Button type="submit" loading={isSubmitting} className="w-full">
              <UserPlus size={16} />
              Create {PORTAL_ROLE_LABEL} Account
            </Button>
          </form>

          <p className="mt-4 text-sm text-gray-600">
            Already have an account?{' '}
            <Link to={PORTAL_LOGIN_PATH} className="font-medium text-blue-700 hover:text-blue-800">
              Sign in
            </Link>
          </p>
        </section>
      </div>
    </main>
  );
}
