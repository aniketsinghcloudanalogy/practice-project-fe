import { baseApi } from "../baseApi";
import type { Customer, CustomerPayload, Address, AddressPayload, Contact, ContactPayload, ApiResponse } from "../types";

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

    // ─── Address Endpoints ────────────────────────────────────────────────
    getAddresses: builder.query<Address[], string>({
      query: (customerId) => `/api/customers/${customerId}/addresses`,
      transformResponse: (response: ApiResponse<Address[]>) =>
        Array.isArray(response.data) ? response.data : [],
      providesTags: (_result, _error, customerId) => [
        { type: "Address" as const, id: customerId },
        { type: "Customer" as const, id: customerId },
      ],
    }),

    createAddress: builder.mutation<ApiResponse<Address>, { customerId: string; body: AddressPayload }>({
      query: ({ customerId, body }) => ({
        url: `/api/customers/${customerId}/addresses`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { customerId }) => [
        { type: "Address" as const, id: customerId },
        { type: "Customer" as const, id: customerId },
        { type: "Customer" as const, id: "LIST" },
      ],
    }),

    updateAddress: builder.mutation<ApiResponse<Address>, { customerId: string; addressId: string; body: Partial<AddressPayload> }>({
      query: ({ customerId, addressId, body }) => ({
        url: `/api/customers/${customerId}/addresses/${addressId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { customerId }) => [
        { type: "Address" as const, id: customerId },
        { type: "Customer" as const, id: customerId },
        { type: "Customer" as const, id: "LIST" },
      ],
    }),

    deleteAddress: builder.mutation<ApiResponse<null>, { customerId: string; addressId: string }>({
      query: ({ customerId, addressId }) => ({
        url: `/api/customers/${customerId}/addresses/${addressId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { customerId }) => [
        { type: "Address" as const, id: customerId },
        { type: "Customer" as const, id: customerId },
        { type: "Customer" as const, id: "LIST" },
      ],
    }),

    // ─── Customer Contact Endpoints ───────────────────────────────────────
    createCustomerContact: builder.mutation<ApiResponse<Contact>, { customerId: string; body: Omit<ContactPayload, 'customerId'> }>({
      query: ({ customerId, body }) => ({
        url: `/api/customers/${customerId}/contacts`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_result, _error, { customerId }) => [
        { type: "Customer" as const, id: customerId },
        { type: "Customer" as const, id: "LIST" },
      ],
    }),

    updateCustomerContact: builder.mutation<ApiResponse<Contact>, { customerId: string; contactId: string; body: Partial<ContactPayload> }>({
      query: ({ customerId, contactId, body }) => ({
        url: `/api/customers/${customerId}/contacts/${contactId}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_result, _error, { customerId }) => [
        { type: "Customer" as const, id: customerId },
        { type: "Customer" as const, id: "LIST" },
      ],
    }),

    deleteCustomerContact: builder.mutation<ApiResponse<null>, { customerId: string; contactId: string }>({
      query: ({ customerId, contactId }) => ({
        url: `/api/customers/${customerId}/contacts/${contactId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, { customerId }) => [
        { type: "Customer" as const, id: customerId },
        { type: "Customer" as const, id: "LIST" },
      ],
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
  useGetAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useCreateCustomerContactMutation,
  useUpdateCustomerContactMutation,
  useDeleteCustomerContactMutation,
} = customerApi;
