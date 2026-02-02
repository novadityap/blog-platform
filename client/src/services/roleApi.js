import axiosBaseQuery from '@/lib/baseQuery';
import { createApi } from '@reduxjs/toolkit/query/react';

const roleApi = createApi({
  reducerPath: 'roleApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['Role'],
  endpoints: builder => ({
    searchRoles: builder.query({
      query: params => ({
        url: '/roles/search',
        method: 'GET',
        params,
      }),
      providesTags: result =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Role', id })),
              { type: 'Role', id: 'LIST' },
            ]
          : [{ type: 'Role', id: 'LIST' }],
    }),
    listRoles: builder.query({
      query: () => ({
        url: '/roles',
        method: 'GET',
      }),
      providesTags: result =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'Role', id })),
              { type: 'Role', id: 'LIST' },
            ]
          : [{ type: 'Role', id: 'LIST' }],
    }),
    showRole: builder.query({
      query: roleId => ({
        url: `/roles/${roleId}`,
        method: 'GET',
      }),
      providesTags: (result, error, roleId) => [{ type: 'Role', id: roleId }],
    }),
    createRole: builder.mutation({
      query: data => ({
        url: '/roles',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'Role', id: 'LIST' }],
    }),
    updateRole: builder.mutation({
      query: ({ roleId, data }) => ({
        url: `/roles/${roleId}`,
        method: 'PUT',
        data,
      }),
      invalidatesTags: (result, error, { roleId }) => [
        { type: 'Role', id: roleId },
        { type: 'Role', id: 'LIST' },
      ],
    }),
    removeRole: builder.mutation({
      query: roleId => ({
        url: `/roles/${roleId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { roleId }) => [
        { type: 'Role', id: roleId },
        { type: 'Role', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useSearchRolesQuery,
  useLazySearchRolesQuery,
  useListRolesQuery,
  useLazyListRolesQuery,
  useShowRoleQuery,
  useLazyShowRoleQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useRemoveRoleMutation,
} = roleApi;

export default roleApi;
