import { configureStore } from '@reduxjs/toolkit'
import dashboardReducer from '@/store/features/dashboard/dashboardSlice'
import baseApi from '@/store/services/baseApi'

export const store = configureStore({
	reducer: {
		dashboard: dashboardReducer,
		[baseApi.reducerPath]: baseApi.reducer,
	},
	middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(baseApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch