'use client';

import { Button } from '@/components/shadcn/button';
import { Input } from '@/components/shadcn/input';
import { useListCategoriesQuery } from '@/services/categoryApi';
import {
  useCreatePostMutation,
  useUpdatePostMutation,
  useShowPostQuery,
} from '@/services/postApi';
import useFormHandler from '@/hooks/useFormHandler';
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from '@/components/shadcn/select';
import {
  Form,
  FormField,
  FormLabel,
  FormMessage,
  FormItem,
  FormControl,
} from '@/components/shadcn/form';
import { useEffect } from 'react';
import { AspectRatio } from '@/components/shadcn/aspect-ratio';
import { TbLoader } from 'react-icons/tb';
import { Skeleton } from '@/components/shadcn/skeleton';
import Image from 'next/image';
import { toast } from 'react-hot-toast';
import ReactQuill from 'react-quill-new';

const PostFormSkeleton = ({ isUpdate }) => (
  <div className="space-y-4">
    {isUpdate && (
      <div className="flex justify-center">
        <Skeleton className="size-52 rounded-sm" />
      </div>
    )}
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-4 w-20" />
    <Skeleton className="h-10 w-full" />
    <div className="flex justify-end gap-2">
      <Skeleton className="h-10 w-24 rounded-md" />
      <Skeleton className="h-10 w-24 rounded-md" />
    </div>
  </div>
);

const PostForm = ({ id, onSuccess, onClose, isUpdate }) => {
  const { data: categories, isLoading: isCategoriesLoading } =
    useListCategoriesQuery();
  const { data: post, isLoading: isPostLoading } = useShowPostQuery(id, {
    skip: !isUpdate || !id,
  });
  const { form, handleSubmit, isLoading } = useFormHandler({
    isUpdate,
    file: { fieldName: 'image', isMultiple: false },
    mutation: isUpdate ? useUpdatePostMutation : useCreatePostMutation,
    defaultValues: {
      title: '',
      content: '',
      category: '',
    },
    ...(isUpdate && {
      params: [{ name: 'postId', value: id }],
    }),
    onSuccess: result => {
      onSuccess();
      toast.success(result.message);
    },
    onError: e => toast.error(e.message),
  });

  useEffect(() => {
    if (isUpdate && post?.data && categories?.data) {
      form.reset({
        title: post.data.title,
        content: post.data.content,
        category: post.data.category.id,
      });
    }
  }, [post, categories]);

  if (isPostLoading || isCategoriesLoading)
    return <PostFormSkeleton isUpdate={isUpdate} />;

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {isUpdate && post?.data?.image && (
          <AspectRatio ratio={16 / 9}>
            <Image
              fill
              src={post.data.image}
              alt="post image"
              className="size-full object-cover"
            />
          </AspectRatio>
        )}
        <FormField
          control={form.control}
          name="image"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image</FormLabel>
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
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
               <ReactQuill
                  theme="snow"
                  value={field.value}
                  onChange={field.onChange}
                  style={{ height: '200px', marginBottom: '90px' }}
                  modules={{
                    toolbar: [
                      [{ header: [1, 2, 3, 4, 5, 6, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      ['blockquote', 'code-block'],
                      [{ list: 'ordered' }, { list: 'bullet' }],
                      [{ script: 'sub' }, { script: 'super' }],
                      [{ indent: '-1' }, { indent: '+1' }],
                      ['link', 'image', 'video'],
                      ['clean'],
                    ],
                  }}
                  placeholder="Write something..."
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                key={field.value}
                value={field.value}
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {categories?.data?.map(category => (
                    <SelectItem
                      key={category.id}
                      value={category.id}
                      selected={category.id === field.value}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

export default PostForm;
