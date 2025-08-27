'use client';

import AuthGuard from '@/components/auth/AuthGuard';
import DataTable from '@/components/ui/DataTable';
import {
  useSearchCategoriesQuery,
  useRemoveCategoryMutation,
} from '@/services/categoryApi';
import CategoryForm from '@/components/ui/CategoryForm';
import { createColumnHelper } from '@tanstack/react-table';
import BreadcrumbNav from '@/components/ui/BreadcrumbNav';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/card';

const Category = () => {
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor('name', {
      id: 'name',
      header: 'Name',
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
          <CardTitle className="text-gray-600">Categories</CardTitle>
          <CardDescription>Manage categories</CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            searchQuery={useSearchCategoriesQuery}
            removeMutation={useRemoveCategoryMutation}
            FormComponent={CategoryForm}
            entityName='category'
          />
        </CardContent>
      </Card>
    </AuthGuard>
  );
};

export default Category;
