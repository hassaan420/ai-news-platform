import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, Eye, EyeOff, Loader2, UserPlus, User } from 'lucide-react';

import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { registerUser } from '@/store/authSlice';
import AuthLayout from '@/layouts/AuthLayout';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  email: z.string().email({ message: 'Must be a valid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, error } = useAppSelector((state) => state.auth);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const { register, handleSubmit, formState: { errors } } = form;

  const onSubmit = async (values: z.infer<typeof registerSchema>) => {
    const resultAction = await dispatch(registerUser({
      name: values.name,
      email: values.email,
      password: values.password
    }));
    if (registerUser.fulfilled.match(resultAction)) {
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
          <label className="block text-sm font-medium text-primary-theme mb-1.5" htmlFor="name">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-theme w-4 h-4 pointer-events-none" />
            <input
              {...register('name')}
              id="name"
              type="text"
              placeholder="Jane Doe"
              disabled={status === 'loading'}
              className="clarion-input pl-9"
            />
          </div>
          {errors.name && <p className="text-destructive text-xs mt-1 font-medium">{errors.name.message}</p>}
        </div>

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
          <label className="block text-sm font-medium text-primary-theme mb-1.5" htmlFor="password">Password</label>
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

        <div>
          <label className="block text-sm font-medium text-primary-theme mb-1.5" htmlFor="confirmPassword">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-theme w-4 h-4 pointer-events-none" />
            <input
              {...register('confirmPassword')}
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirm your password"
              disabled={status === 'loading'}
              className="clarion-input pl-9 pr-10"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-theme hover:text-primary-theme transition-colors focus:outline-none"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              disabled={status === 'loading'}
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-destructive text-xs mt-1 font-medium">{errors.confirmPassword.message}</p>}
        </div>
        
        <button
          type="submit"
          disabled={status === 'loading'}
          className="clarion-btn clarion-btn-primary w-full mt-4 py-3"
        >
          {status === 'loading' ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <UserPlus className="w-4 h-4" />
          )}
          {status === 'loading' ? 'Creating account...' : 'Sign Up'}
        </button>

      </form>
    </AuthLayout>
  );
}
