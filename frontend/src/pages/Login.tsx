import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

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
          <label className="block text-sm font-medium text-foreground mb-1.5" htmlFor="email">Email Address</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-[20px]">mail</span>
            <input
              {...register('email')}
              id="email"
              type="email"
              placeholder="name@example.com"
              disabled={status === 'loading'}
              className="w-full pl-10 pr-3 py-2.5 border border-border/60 rounded-lg bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none text-sm text-foreground disabled:opacity-50 transition-all placeholder:text-muted-foreground"
            />
          </div>
          {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="block text-sm font-medium text-foreground" htmlFor="password">Password</label>
            <a className="text-[12px] font-medium text-primary hover:underline" href="#">Forgot?</a>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground text-[20px]">lock</span>
            <input
              {...register('password')}
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              disabled={status === 'loading'}
              className="w-full pl-10 pr-10 py-2.5 border border-border/60 rounded-lg bg-background focus:ring-2 focus:ring-primary/30 focus:border-primary/40 outline-none text-sm text-foreground disabled:opacity-50 transition-all placeholder:text-muted-foreground"
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
              disabled={status === 'loading'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
            </button>
          </div>
          {errors.password && <p className="text-destructive text-xs mt-1">{errors.password.message}</p>}
        </div>
        
        <button
          type="submit"
          disabled={status === 'loading'}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors mt-2 flex items-center justify-center gap-2 disabled:opacity-70"
        >
          {status === 'loading' ? (
            <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
          ) : (
            <span className="material-symbols-outlined text-[18px]">login</span>
          )}
          {status === 'loading' ? 'Signing in...' : 'Log In'}
        </button>
      </form>
    </AuthLayout>
  );
}
