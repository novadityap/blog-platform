'use client';

import { useSearchPostsQuery } from '@/services/postApi';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/shadcn/card';
import { Skeleton } from '@/components/shadcn/skeleton';
import { Button } from '@/components/shadcn/button';
import { useSelector } from 'react-redux';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/shadcn/avatar';
import Link from 'next/link';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/shadcn/select';
import { useLazyListCategoriesQuery } from '@/services/categoryApi';
import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { TbLoader } from 'react-icons/tb';
import Image from 'next/image';
import { AspectRatio } from '@/components/shadcn/aspect-ratio';

const SkeletonLoader = ({ count }) => (
  <div className="flex flex-col items-center space-y-6 w-[400px] sm:w-[500px] md:w-[600px]">
    {[...Array(count)].map((_, index) => (
      <div
        key={index}
        className="w-full shadow-lg hover:shadow-xl transition-shadow p-4 bg-white rounded-lg"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-x-4">
            <Skeleton className="w-10 h-10 rounded-full bg-gray-200" />
            <div className="flex flex-col space-y-1">
              <Skeleton className="h-4 w-24 bg-gray-200" />
              <Skeleton className="h-3 w-16 bg-gray-200" />
            </div>
          </div>
          <Skeleton className="h-6 w-full rounded bg-gray-200" />
        </div>
        <Skeleton className="h-56 w-full object-cover rounded-lg bg-gray-200 mt-4" />
        <div className="space-y-2 mt-4">
          <Skeleton className="h-4 w-full rounded bg-gray-200" />
          <Skeleton className="h-4 w-5/6 rounded bg-gray-200" />
        </div>
        <div className="flex justify-end mt-4">
          <Skeleton className="h-8 w-24 rounded bg-gray-200" />
        </div>
      </div>
    ))}
  </div>
);

const PostCard = ({ post }) => (
  <Card className="shadow-lg hover:shadow-xl transition-shadow">
    <CardHeader className="space-y-4">
      <CardTitle className="capitalize text-xl font-bold">
        <Link
          href={`/posts/${post?.slug}?postId=${post?.id}`}
          className="hover:underline"
        >
          {post?.title}
        </Link>
      </CardTitle>
      <CardDescription className="flex items-center gap-x-4 text-sm text-gray-600">
        <Avatar className="w-10 h-10">
          <AvatarImage src={post?.user?.avatar} alt={post?.user?.username} />
          <AvatarFallback>
            {post?.user?.username.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="font-medium">{post?.user?.username}</span>
        <span className="text-gray-400">
          {dayjs(post?.createdAt).format('DD MMMM YYYY hh:mm A')}
        </span>
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Link href={`/posts/${post?.slug}?postId=${post?.id}`} className="block">
        <AspectRatio ratio={16 / 9}>
          <Image
            fill
            src={post?.image}
            alt={post?.title}
            className="w-full h-56 object-cover rounded-lg mb-4"
          />
        </AspectRatio>
      </Link>
      <div
        dangerouslySetInnerHTML={{ __html: post?.content }}
        className="line-clamp-2 text-gray-700 text-sm"
      />
    </CardContent>
    <CardFooter className="flex justify-end">
      <Button asChild>
        <Link href={`/posts/${post?.slug}?postId=${post?.id}`}>Read More</Link>
      </Button>
    </CardFooter>
  </Card>
);

const CategoryFilter = ({ categories, onOpen, onChange }) => (
  <div className="space-y-8 mt-6">
    <div>
      <h2 className="text-lg font-semibold mb-4">Categories</h2>
      <Select onOpenChange={onOpen} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a category" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Categories</SelectItem>
          {categories?.data?.map(category => (
            <SelectItem key={category.id} value={category.id}>
              {category.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
    <div>
      <h3 className="text-lg font-semibold mb-4">Trending Posts</h3>
      <p className="text-gray-500">Coming soon...</p>
    </div>
  </div>
);

const Home = () => {
  const [fetchCategories, { data: categories }] = useLazyListCategoriesQuery();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  const [posts, setPosts] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const { searchTerm } = useSelector(state => state.query);
  const { data, isLoading, isError } = useSearchPostsQuery({
    limit: 10,
    page: currentPage,
    ...filters,
  });

  useEffect(() => {
    setFilters(prev => ({ ...prev, q: searchTerm }));
  }, [searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
    setPosts([]);
    setHasMore(true);
  }, [filters]);

  useEffect(() => {
    if (data?.data) {
      setPosts(prev =>
        currentPage === 1 ? data.data : [...prev, ...data.data],
      );
      setHasMore(data.data.length >= 10);
    }
  }, [data, currentPage]);

  useEffect(() => {
    if (isError) setHasMore(false);
  }, [isError]);

  const fetchMoreData = () => {
    if (!isLoading && hasMore) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="grid w-full grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <InfiniteScroll
          dataLength={posts.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={
            <TbLoader className="animate-spin text-gray-500 mx-auto mt-4" />
          }
          endMessage={
            <p className="text-center text-gray-500 mt-4">
              You&apos;ve seen all posts
            </p>
          }
        >
          <div className="space-y-6">
            {isLoading ? (
              <SkeletonLoader count={3} />
            ) : posts.length === 0 && !isLoading ? (
              <p className="text-gray-500 font-semibold text-2xl mb-8 text-center">
                No posts found.
              </p>
            ) : (
              posts.map(post => <PostCard key={post?.id} post={post} />)
            )}
          </div>
        </InfiniteScroll>
      </div>
      <CategoryFilter
        categories={categories}
        onOpen={open => open && !categories && fetchCategories()}
        onChange={value => {
          setFilters(prev => {
            if (value === 'all') {
              const { category, ...rest } = prev;
              return rest;
            }
            return { ...prev, category: value };
          });
        }}
      />
    </div>
  );
};

export default Home;
