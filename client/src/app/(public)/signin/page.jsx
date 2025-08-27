'use client';

import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/shadcn/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/shadcn/form';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/shadcn/card';
import { useSigninMutation } from '@/services/authApi';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { TbLoader, TbExclamationCircle, TbBrandGoogle } from 'react-icons/tb';
import useFormHandler from '@/hooks/useFormHandler';
import useGoogleSignin from '@/hooks/useGoogleSignin';
import { setToken, setCurrentUser } from '@/lib/features/authSlice';

const Signin = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const handleGoogleSignin = useGoogleSignin();
  const { token } = useSelector(state => state.auth);
  const { form, handleSubmit, isLoading, error, isSuccess, message } =
    useFormHandler({
      onSuccess: result => {
        dispatch(setToken(result.data.token));
        dispatch(setCurrentUser(result.data));
      },
      mutation: useSigninMutation,
      defaultValues: {
        email: '',
        password: '',
      },
    });

  useEffect(() => {
    if (token || isSuccess) router.replace('/');
  }, [token, isSuccess]);

  if (!token) {
    return (
      <Card className="w-full sm:w-[450px]">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-600">
            Sign In
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error?.code === 401 && (
            <Alert variant="destructive">
              <TbExclamationCircle className="size-5 text-red-500" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-4 mb-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <TbLoader className="animate-spin mr-2 size-5" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </Form>
          <Button
            onClick={handleGoogleSignin}
            variant="outline"
            className="w-full flex items-center gap-2"
          >
            <TbBrandGoogle size={20} />
            Sign in with Google
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          <div className="flex items-center justify-betweens gap-2">
            <p className="text-gray-500 text-sm">Don&apos;t have an account?</p>
            <Link
              href="/signup"
              className="text-sm text-gray-500 hover:underline hover:text-blue-600"
            >
              Sign Up
            </Link>
          </div>
          <Link
            href="/request-reset-password"
            className="text-sm text-gray-500 hover:underline hover:text-blue-600"
          >
            Forgot Password?
          </Link>
        </CardFooter>
      </Card>
    );
  }
};

export default Signin;
