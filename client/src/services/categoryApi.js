import axiosBaseQuery from '@/lib/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';

const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Category'],
  endpoints: builder => ({
    searchCategories: builder.query({
      query: (params = {}) => ({
        url: '/categories/search',
        method: 'GET',
        params,
      }),
      providesTags: result =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Category', id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),
    listCategories: builder.query({
      query: () => ({
        url: '/categories',
        method: 'GET',
      }),
      providesTags: result =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Category', id })),
              { type: 'Category', id: 'LIST' },
            ]
          : [{ type: 'Category', id: 'LIST' }],
    }),
    showCategory: builder.query({
      query: categoryId => ({
        url: `/categories/${categoryId}`,
        method: 'GET',
      }),
      providesTags: (result, error, categoryId) => [
        { type: 'Category', id: categoryId },
        { type: 'Category', id: 'LIST' },
      ],
    }),
    createCategory: builder.mutation({
      query: data => ({
        url: '/categories',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Category', id: 'LIST' }],
    }),
    updateCategory: builder.mutation({
      query: ({ categoryId, data }) => ({
        url: `/categories/${categoryId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { categoryId }) => [
        { type: 'Category', id: categoryId },
        { type: 'Category', id: 'LIST' },
      ],
    }),
    removeCategory: builder.mutation({
      query: categoryId => ({
        url: `/categories/${categoryId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { categoryId }) => [
        { type: 'Category', id: categoryId },
        { type: 'Category', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useSearchCategoriesQuery,
  useLazySearchCategoriesQuery,
  useListCategoriesQuery,
  useLazyListCategoriesQuery,
  useShowCategoryQuery,
  useLazyShowCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useRemoveCategoryMutation,
} = categoryApi;

export default categoryApi;
