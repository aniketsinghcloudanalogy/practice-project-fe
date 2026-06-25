import { baseApi } from "../baseApi";
import type { Customer, CustomerPayload, ApiResponse } from "../types";

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<Customer[], void>({
      query: () => "/api/customers",
      keepUnusedDataFor: 300,
      transformResponse: (response: ApiResponse<Customer[]>) =>
        Array.isArray(response.data) ? response.data : [],
      providesTags: (result) =>
        result
          ? [
              { type: "Customer" as const, id: "LIST" },
              ...result.map((customer) => ({
                type: "Customer" as const,
                id: customer.id,
              })),
            ]
          : [{ type: "Customer" as const, id: "LIST" }],
    }),

    getCustomer: builder.query<Customer, string>({
      query: (customerId) => `/api/customers/${customerId}`,
      transformResponse: (response: ApiResponse<Customer>) =>
        response.data as Customer,
      providesTags: (_result, _error, customerId) => [
        { type: "Customer" as const, id: customerId },
      ],
    }),

    createCustomer: builder.mutation<ApiResponse<Customer>, CustomerPayload>({
      query: (body) => ({
        url: "/api/customers",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Customer" as const, id: "LIST" }],
    }),

    updateCustomer: builder.mutation<
      ApiResponse<Customer>,
      { id: string; body: Partial<CustomerPayload> }
    >({
      query: ({ id, body }) => ({
        url: `/api/customers/${id}`,
        method: "PATCH",
        body,
      }),
      async onQueryStarted({ id }, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          const updatedCustomer = data?.data;

          if (!updatedCustomer) return;

          dispatch(
            customerApi.util.updateQueryData(
              "getCustomers",
              undefined,
              (draft) => {
                const index = draft.findIndex((c) => c.id === id);
                if (index !== -1) {
                  draft[index] = updatedCustomer;
                }
              },
            ),
          );
        } catch {
          // Let endpoint consumer handle mutation failure UI.
        }
      },
      invalidatesTags: (_result, _error, arg) => [
        { type: "Customer" as const, id: arg.id },
      ],
    }),

    deleteCustomer: builder.mutation<ApiResponse<null>, string>({
      query: (customerId) => ({
        url: `/api/customers/${customerId}`,
        method: "DELETE",
      }),

      async onQueryStarted(_customerId, { queryFulfilled }) {
        await queryFulfilled;
      },

      invalidatesTags: ["Customer"],
    }),
  }),
  overrideExisting: process.env.NODE_ENV === "development",
});

export const {
  useGetCustomersQuery,
  useGetCustomerQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,
} = customerApi;
