'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import DataTable from '@/components/ui/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import {
  useSearchPostsQuery,
  useRemovePostMutation,
} from '@/services/postApi.js';
import PostForm from '@/components/ui/PostForm';
import BreadcrumbNav from '@/components/ui/BreadcrumbNav';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/card';

const Post = () => {
  const columnsHelper = createColumnHelper();
  const columns = [
    columnsHelper.accessor('title', {
      id: 'title',
      header: 'Title',
      size: 200,
      cell: info => (
        <div className="whitespace-normal break-words">{info.getValue()}</div>
      ),
    }),
    columnsHelper.accessor('user.username', {
      id: 'user.username',
      header: 'Author',
      size: 100,
      cell: info => (
        <div className="whitespace-normal break-words">{info.getValue()}</div>
      ),
    }),
    columnsHelper.accessor('category.name', {
      id: 'category.name',
      header: 'Category',
      size: 100,
      cell: info => (
        <div className="whitespace-normal break-words">{info.getValue()}</div>
      ),
    }),
  ];

  return (
    <AuthGuard requiredRoles={['admin']}>
      <BreadcrumbNav />
      <Card>
        <CardHeader>
          <CardTitle className="text-gray-600">Posts</CardTitle>
          <CardDescription>Manage posts</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            searchQuery={useSearchPostsQuery}
            removeMutation={useRemovePostMutation}
            FormComponent={PostForm}
            entityName="post"
          />
        </CardContent>
      </Card>
    </AuthGuard>
  );
};
export default Post;
