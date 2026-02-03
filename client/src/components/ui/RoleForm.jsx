'use client';

import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import useFormHandler from '@/hooks/useFormHandler';
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from '@/components/shadcn/form';
import { TbLoader } from 'react-icons/tb';
import { Skeleton } from '@/components/shadcn/skeleton';
import {
  useShowRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
} from '@/services/roleApi';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

const RoleFormSkeleton = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-10 w-full rounded-md" />
    </div>
    <div className="flex justify-end gap-x-2">
      <Skeleton className="h-10 w-24 rounded-md" />
      <Skeleton className="h-10 w-24 rounded-md" />
    </div>
  </div>
);

const RoleForm = ({ id, onSuccess, onClose, isUpdate }) => {
  const { data: role, isLoading: isRoleLoading } = useShowRoleQuery(id, {
    skip: !isUpdate || !id,
  });
  const { form, handleSubmit, isLoading } = useFormHandler({
    formType: 'datatable',
    isUpdate,
    mutation: isUpdate ? useUpdateRoleMutation : useCreateRoleMutation,
    onSuccess,
    defaultValues: {
      name: '',
    },
    onSuccess: result => {
      onSuccess();
      toast.success(result.message);
    },
    onError: e => toast.error(e.message),
    ...(isUpdate && { params: [{ name: 'roleId', value: id }] }),
  });

  useEffect(() => {
    if (isUpdate && role?.data) form.reset({ name: role.data.name });
  }, [role]);

  if (isRoleLoading) return <RoleFormSkeleton />;

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-x-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <TbLoader className="animate-spin" />
                {isUpdate ? 'Updating..' : 'Creating..'}
              </>
            ) : isUpdate ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default RoleForm;
