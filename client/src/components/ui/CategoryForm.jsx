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
import {
  useShowCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from '@/services/categoryApi';
import { useEffect } from 'react';
import { Skeleton } from '@/components/shadcn/skeleton';
import { toast } from 'react-hot-toast';

const CategoryFormSkeleton = () => (
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

const CategoryForm = ({ id, onSuccess, onClose, isUpdate }) => {
  const { data: category, isLoading: isCategoryLoading } = useShowCategoryQuery(
    id,
    {
      skip: !isUpdate || !id,
    }
  );
  const { form, handleSubmit, isLoading } = useFormHandler({
    isUpdate,
    mutation: isUpdate ? useUpdateCategoryMutation : useCreateCategoryMutation,
    defaultValues: {
      name: '',
    },
    onSuccess: result => {
      onSuccess();
      toast.success(result.message);
    },
    onError: e => toast.error(e.message),
    ...(isUpdate && { params: [{ name: 'categoryId', value: id }] }),
  });

  useEffect(() => {
    if (isUpdate && category?.data) form.reset({ name: category.data.name });
  }, [category]);

  if (isCategoryLoading) return <CategoryFormSkeleton />;

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

export default CategoryForm;
