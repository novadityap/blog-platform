'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import DataTable from '@/components/ui/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import {
  useSearchCommentsQuery,
  useRemoveCommentMutation,
} from '@/services/commentApi.js';
import BreadcrumbNav from '@/components/ui/BreadcrumbNav';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/card';

const Comment = () => {
  const columnsHelper = createColumnHelper();
  const columns = [
    columnsHelper.accessor('user.username', {
      id: 'user.username',
      header: 'Username',
      size: 100,
      cell: info => (
        <div className="whitespace-normal break-words">{info.getValue()}</div>
      ),
    }),
    columnsHelper.accessor('post.title', {
      id: 'post.title',
      header: 'Post Title',
      size: 100,
      cell: info => (
        <div className="whitespace-normal break-words">{info.getValue()}</div>
      ),
    }),
    columnsHelper.accessor('text', {
      id: 'text',
      header: 'Text',
      size: 150,
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
          <CardTitle className="text-gray-600">Comments</CardTitle>
          <CardDescription>Manage comments</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            searchQuery={useSearchCommentsQuery}
            removeMutation={useRemoveCommentMutation}
            entityName="comment"
            allowCreate={false}
            allowUpdate={false}
          />
        </CardContent>
      </Card>
    </AuthGuard>
  );
};
export default Comment;
