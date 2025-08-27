'use client'

import { useShowPostQuery } from '@/services/postApi';
import {
  useListCommentsByPostQuery,
  useRemoveCommentMutation,
} from '@/services/commentApi';
import { useLikePostMutation } from '@/services/postApi';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/shadcn/card';
import { Skeleton } from '@/components/shadcn/skeleton';
import { useEffect } from 'react';
import { AspectRatio } from '@/components/shadcn/aspect-ratio';
import { Button } from '@/components/shadcn/button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shadcn/avatar';
import { useState } from 'react';
import dayjs from 'dayjs';
import { TbInfoCircle, TbHeartFilled, TbTrash } from 'react-icons/tb';
import { cn } from '@/lib/utils';
import { useSelector } from 'react-redux';
import Image from 'next/image';
import CommentForm from '@/components/ui/CommentForm'

const Comments = ({ comments, postId, token, onRemove, currentUser }) => {
  const [replyToCommentId, setReplyToCommentId] = useState(null);
  const topLevelComments = comments.filter(c => !c.parentCommentId);

  const getReplies = parentId =>
    comments.filter(c => c.parentCommentId === parentId);

  return (
    <div className="flex flex-col w-full gap-y-2">
      {topLevelComments.map(comment => (
        <div key={comment.id} className="flex gap-x-4">
          <Avatar className="size-10 mt-2">
            <AvatarImage
              src={comment.user.avatar}
              alt={comment.user.username}
            />
            <AvatarFallback>
              {comment.user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold text-gray-800">
                  {comment.user.username}
                </p>
                <p className="text-gray-600 text-sm">{comment.text}</p>
              </div>
              {token && currentUser?.id === comment.user.id && (
                <TbTrash
                  className="size-5 cursor-pointer text-red-600"
                  onClick={() => onRemove(postId, comment.id)}
                />
              )}
            </div>
            {token && (
              <Button
                variant="ghost"
                className="text-sm text-black font-semibold mt-2 px-4 py-2 h-8 rounded-xl hover:bg-slate-200"
                onClick={() => setReplyToCommentId(comment.id)}
              >
                Reply
              </Button>
            )}
            {replyToCommentId === comment.id && (
              <CommentForm
                avatarUrl={comment.user.avatar}
                isReply={true}
                postId={postId}
                parentCommentId={comment.id}
                replyTo={`@${comment.user.username} `}
                onCancelReply={() => setReplyToCommentId(null)}
                className="mt-2"
              />
            )}
            <div className="flex flex-col w-full gap-y-2">
              {getReplies(comment.id).map(reply => (
                <div key={reply.id}>
                  <div className="flex gap-x-4">
                    <Avatar className="size-8 mt-2">
                      <AvatarImage
                        src={reply.user.avatar}
                        alt={reply.user.username}
                      />
                      <AvatarFallback>
                        {reply.user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">
                            {reply.user.username}
                          </p>
                          <p className="text-gray-600 text-sm">{reply.text}</p>
                        </div>
                        {token && currentUser?.id === comment.user.id && (
                          <TbTrash
                            className="size-5 cursor-pointer text-red-600"
                            onClick={() => onRemove(postId, reply.id)}
                          />
                        )}
                      </div>
                      {token && (
                        <Button
                          variant="ghost"
                          className="text-sm text-black font-semibold mt-2 px-4 py-2 h-8 rounded-xl hover:bg-slate-200"
                          onClick={() => setReplyToCommentId(reply.id)}
                        >
                          Reply
                        </Button>
                      )}
                    </div>
                  </div>
                  {replyToCommentId === reply.id && (
                    <CommentForm
                      avatarUrl={reply.user.avatar}
                      isReply={true}
                      postId={postId}
                      parentCommentId={comment.id}
                      onCancelReply={() => setReplyToCommentId(null)}
                      replyTo={`@${reply.user.username} `}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const PostDetailSkeleton = () => {
  return (
    <Card className="w-full">
      <CardHeader>
        <Skeleton className="w-1/3 h-6 mb-1" />
        <Skeleton className="w-1/2 h-4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center">
            <Skeleton className="w-96 h-52 rounded-sm" />
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

const LikeButton = ({ likes, onLike, currentUser, totalLikes }) => {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setIsLiked(likes.includes(currentUser?.id));
  }, [likes, currentUser]);

  return (
    <Button
      variant="ghost"
      className="flex items-center gap-x-2 text-sm p-0 hover:no-underline hover:bg-transparent"
      onClick={onLike}
    >
      <TbHeartFilled
        className={cn('size-8', isLiked ? 'text-red-500' : 'text-gray-500')}
      />
      <span className="text-sm text-gray-500">{totalLikes} Likes</span>
    </Button>
  );
};

const PostDetail = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const postId = searchParams.get('postId');
  const { token, currentUser } = useSelector(state => state.auth);
  const [likePost] = useLikePostMutation();
  const [removeComment] = useRemoveCommentMutation();
  const { data: comments, isLoading: isCommentsLoading } =
    useListCommentsByPostQuery(postId);
  const { data: post, isLoading: isPostLoading } = useShowPostQuery(postId);

  const handleRemoveComment = async (postId, commentId) => {
    await removeComment({ postId, commentId });
  };

  const handleLike = () => {
    if (!token) {
      router.push('/signin');
    } else {
      likePost(post?.data?.id);
    }
  };

  if (isPostLoading || isCommentsLoading) return <PostDetailSkeleton />;

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="flex items-center gap-x-2 mb-6">
          <Avatar className="w-10 h-10">
            <AvatarImage
              src={post?.data?.user?.avatar}
              alt={post?.data?.user?.username}
            />
            <AvatarFallback>
              {post?.data?.user?.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardDescription className="font-semibold capitalize">
              {post?.data?.user?.username}
            </CardDescription>
            <CardDescription className="text-sm text-gray-500">
              <span className="text-gray-600">Published on </span>
              {dayjs(post?.data?.createdAt).format('DD MMMM YYYY hh:mm A')}
            </CardDescription>
          </div>
        </div>
        <CardTitle className="text-3xl font-bold capitalize text-gray-800">
          {post?.data?.title}
        </CardTitle>
        {post?.data?.category && (
          <CardDescription className="text-sm text-gray-500">
            Category: {post?.data?.category?.name}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="text-justify">
        <AspectRatio ratio={16 / 9}>
          <Image
            fill
            src={post?.data?.image}
            alt={post?.data?.title}
            className="size-full"
          />
        </AspectRatio>
        <div dangerouslySetInnerHTML={{ __html: post?.data?.content }} />
        <LikeButton
          onLike={handleLike}
          currentUser={currentUser}
          likes={post?.data?.likes}
          totalLikes={post?.data?.totalLikes}
        />
      </CardContent>
      <CardFooter className="flex flex-col gap-y-6">
        {token ? (
          <CommentForm
            avatarUrl={post?.data?.user?.avatar || process.env.NEXT_PUBLIC_API_URL}
            postId={post?.data?.id}
          />
        ) : (
          <div className="flex items-center gap-3 p-4 border border-border bg-slate-200/ rounded-xl">
            <TbInfoCircle className="size-8 text-muted-foreground mt-1" />
            <p className="text-sm text-muted-foreground">
              You must{' '}
              <Link href="/signin" className="text-blue-500">
                Sign in
              </Link>{' '}
              to post a comment.
            </p>
          </div>
        )}

        {comments?.data?.length === 0 ? (
          <p className="text-center text-muted-foreground py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <Comments
            token={token}
            comments={comments?.data}
            currentUser={currentUser}
            postId={post?.data?.id}
            onRemove={handleRemoveComment}
          />
        )}
      </CardFooter>
    </Card>
  );
};

export default PostDetail;