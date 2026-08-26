import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser } from '@/store/authSlice';
import AuthLayout from '@/layouts/AuthLayout';

const loginSchema = z.object({
  email: z.string().email({ message: 'Must be a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    const resultAction = await dispatch(loginUser({
      email: values.email,
      password: values.password
    }));
    if (loginUser.fulfilled.match(resultAction)) {
      navigate('/');
    }
  };

  return (
    <AuthLayout>
      {error && (
        <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg font-medium text-center border border-destructive/20 mb-4">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-primary-theme mb-1.5" htmlFor="email">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-theme w-4 h-4 pointer-events-none" />
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="name@example.com"
              disabled={status === 'loading'}
              className="clarion-input pl-9"
            />
          </div>
          {errors.email && <p className="text-destructive text-xs mt-1 font-medium">{errors.email.message}</p>}
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-primary-theme" htmlFor="password">Password</label>
            <a className="text-[12px] font-medium text-muted-theme hover:text-primary transition-colors" href="#">Forgot?</a>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-theme w-4 h-4 pointer-events-none" />
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              disabled={status === 'loading'}
              className="clarion-input pl-9 pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-theme hover:text-primary-theme transition-colors focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
              disabled={status === 'loading'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-destructive text-xs mt-1 font-medium">{errors.password.message}</p>}
        </div>
        
        <button
          type="submit"
          disabled={status === 'loading'}
          className="clarion-btn clarion-btn-primary w-full mt-4 py-3"
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <LogIn className="w-4 h-4" />
          )}
          {status === 'loading' ? 'Signing in...' : 'Log In'}
        </button>

      </form>
    </AuthLayout>
  );
}
