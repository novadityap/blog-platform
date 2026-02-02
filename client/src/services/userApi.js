import axiosBaseQuery from '@/lib/baseQuery.js';
import { createApi } from '@reduxjs/toolkit/query/react';

const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: axiosBaseQuery(),
  tagTypes: ['User'],
  endpoints: builder => ({
    createUser: builder.mutation({
      query: data => ({
        url: '/users',
        method: 'POST',
        data,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),
    searchUsers: builder.query({
      query: params => ({
        url: '/users/search',
        method: 'GET',
        params,
      }),
      providesTags: result =>
        result
          ? [
              ...result.data.map(({ id }) => ({ type: 'User', id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),
    showUser: builder.query({
      query: userId => ({
        url: `/users/${userId}`,
        method: 'GET',
      }),
      providesTags: (result, error, userId) => [{ type: 'User', id: userId }],
    }),
    updateUser: builder.mutation({
      query: ({ data, userId }) => ({
        url: `/users/${userId}`,
        method: 'PUT',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),
    updateProfile: builder.mutation({
      query: ({ data, userId }) => ({
        url: `/users/${userId}/profile`,
        method: 'PUT',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),
    removeUser: builder.mutation({
      query: userId => ({
        url: `/users/${userId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { userId }) => [
        { type: 'User', id: userId },
        { type: 'User', id: 'LIST' },
      ],
    }),
  }),
});

export const {
  useSearchUsersQuery,
  useLazySearchUsersQuery,
  useShowUserQuery,
  useLazyShowUserQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useUpdateProfileMutation,
  useRemoveUserMutation,
} = userApi;

export default userApi;
