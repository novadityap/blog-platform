'use client';

import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import BreadcrumbNav from '@/components/ui/BreadcrumbNav';
import { Skeleton } from '@/components/shadcn/skeleton';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/shadcn/card';
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from '@/components/shadcn/form';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shadcn/avatar';
import { useSelector, useDispatch } from 'react-redux';
import { useShowUserQuery, useUpdateProfileMutation } from '@/services/userApi';
import useFormHandler from '@/hooks/useFormHandler';
import { useEffect } from 'react';
import { TbLoader } from 'react-icons/tb';
import AuthGuard from '@/components/auth/AuthGuard';
import { toast } from 'react-hot-toast';
import { updateCurrentUser } from '@/lib/features/authSlice';

const ProfileSkeleton = () => {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="w-1/3 h-6 mb-1" />
        <Skeleton className="w-1/2 h-4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center">
            <Skeleton className="size-32 rounded-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="space-y-2">
            <Skeleton className="w-24 h-4" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
          <div className="flex justify-end">
            <Skeleton className="h-10 w-full sm:w-28 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Profile = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(state => state.auth.currentUser);
  const {
    data: user,
    isLoading: isUserLoading,
    isFetching: isUserFetching,
  } = useShowUserQuery(currentUser?.id);
  const { form, handleSubmit, isLoading } = useFormHandler({
    file: { fieldName: 'avatar', isMultiple: false },
    isUpdate: true,
    params: [{ name: 'userId', value: currentUser?.id }],
    mutation: useUpdateProfileMutation,
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
    onSuccess: result => {
      toast.success(result.message);
      dispatch(updateCurrentUser(result.data));
    },
  });

  useEffect(() => {
    if (user?.data) {
      form.reset({
        username: user.data.username,
        email: user.data.email,
        password: '',
      });
    }
  }, [user]);

  if (isUserLoading || isUserFetching) return <ProfileSkeleton />;

  return (
    <AuthGuard requiredRoles={['admin', 'user']}>
      <BreadcrumbNav />
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-800">Profile</CardTitle>
          <CardDescription>Manage your profile</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="flex justify-center">
                <Avatar className="size-32">
                  <AvatarImage
                    src={user?.data?.avatar}
                    fallback={
                      <AvatarFallback>
                        {currentUser?.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    }
                  />
                </Avatar>
              </div>
              <FormField
                control={form.control}
                name="avatar"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Avatar</FormLabel>
                    <FormControl>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={e => field.onChange(e.target.files[0])}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="w-full sm:w-32"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <TbLoader className="animate-spin mr-2 size-5" />
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </AuthGuard>
  );
};

export default Profile;
