import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import getBaseUrl from "../../../utils/baseURL";
import { auth } from "../../../firebase/firebase.config";

const baseQuery = fetchBaseQuery({
  baseUrl: `${getBaseUrl()}/api/books`,
  credentials: "include",
  prepareHeaders: (Headers) => {
    const token = localStorage.getItem("token");
    const user = auth.currentUser;
    console.log(user);

    if (token) {
      Headers.set("Authorization", `Bearer ${token}`);
    }
    if (user) {
      Headers.set("X-User-UID", user.uid); // send uidto server for add bookId to user to recommend books
    }
    return Headers;
  },
});

const booksApi = createApi({
  reducerPath: "booksApi",
  baseQuery,
  tagTypes: ["Books"],
  endpoints: (builder) => ({
    fetchAllBooks: builder.query({
      query: () => "/",
      providesTags: ["Books"],
    }),
    fetchBookById: builder.query({
      query: (id) => `/${id}`,
      providesTags: (result, error, id) => [{ type: "Books", id }],
    }),
    addBook: builder.mutation({
      query: (newBook) => ({
        url: "/create-book",
        method: "POST",
        body: newBook,
      }),
      invalidatesTags: ["Books"],
    }),
    updateBook: builder.mutation({
      query: ({ id, ...rest }) => ({
        url: `/edit/${id}`,
        method: "PUT",
        body: rest,
        headers: {
          "Content-Type": "application/json",
        },
      }),
      invalidatesTags: ["Books"],
    }),
    fetchRecommendedBooks: builder.query({
      query: () => "/recommend",
      providesTags: ["Books"],
    }),
    addBookToFav: builder.mutation({
      query: (id) => ({
        url: `/favourite/${id}`,
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }),
    }),
    getFavoriteBook: builder.query({
      query: () => "/favourite",
      method: "GET",
    }),
    deleteBook: builder.mutation({
      query: (id) => ({
        url: `/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Books"],
    }),
    rateBook: builder.mutation({
      query: ({ bookId, stars }) => ({
        url: `/rate/${bookId}`,
        method: "POST",
        body: { stars },
      }),
      invalidatesTags: ["Book"],
    }),
    searchBooks: builder.query({
      query: (searchTerm) => `/search?search=${searchTerm}`,
    }),
  }),
});

export const {
  useFetchAllBooksQuery,
  useFetchBookByIdQuery,
  useAddBookMutation,
  useUpdateBookMutation,
  useFetchRecommendedBooksQuery,
  useAddBookToFavMutation,
  useDeleteBookMutation,
  useGetFavoriteBookQuery,
  useRateBookMutation,
  useSearchBooksQuery,
} = booksApi;
export default booksApi;
