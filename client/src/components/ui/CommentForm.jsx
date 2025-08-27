'use client';

import { useCreateCommentMutation } from '@/services/commentApi';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@/components/shadcn/form';
import { Textarea } from '@/components/shadcn/textarea';
import useFormHandler from '@/hooks/useFormHandler';
import { TbLoader } from 'react-icons/tb';
import { useEffect } from 'react';
import { Avatar, AvatarImage } from '@/components/shadcn/avatar';
import { Button } from '@/components/shadcn/button';

const CommentForm = ({
  avatarUrl,
  postId,
  parentCommentId = null,
  isReply = false,
  onCancelReply,
  replyTo,
}) => {
  const { form, handleSubmit, isLoading, isSuccess } = useFormHandler({
    params: [{ name: 'postId', value: postId }],
    mutation: useCreateCommentMutation,
    defaultValues: {
      post: postId,
      parentCommentId,
      text: replyTo ?? '',
    },
  });

  useEffect(() => {
    if (isSuccess && isReply) onCancelReply();
  }, [isSuccess, isReply]);

  return (
    <div className="flex w-full gap-x-4 mt-2">
      <Avatar className={isReply ? 'size-8' : 'size-10'}>
        <AvatarImage src={avatarUrl} alt="avatar" />
      </Avatar>
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-4 w-full">
          <FormField
            name="text"
            control={form.control}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea {...field} placeholder="Add a comment..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-end gap-x-2">
            {isReply && (
              <Button type="button" onClick={onCancelReply} variant="secondary">
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full sm:w-32"
            >
              {isLoading ? (
                <>
                  <TbLoader className="animate-spin mr-2 size-5" />
                  Loading...
                </>
              ) : isReply ? (
                'Reply'
              ) : (
                'Comment'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CommentForm;
