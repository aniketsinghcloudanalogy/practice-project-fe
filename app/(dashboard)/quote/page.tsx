import React from 'react'
import Table from '@/components/common/Table'
import Button from '@/components/common/Button'
import {
    useGetQuotesQuery,
    useGetQuoteDetailQuery,
    useCreateQuoteMutation,
} from '@/store/services/quote/apiSlice';
import type { QuoteListItem } from '@/store/services/quote/types';


const QuotePage = () => {


    return (
        <div>
            <h1 className="text-2xl font-bold px-2 mb-5">Quotes</h1>
        </div>
    )
}

export default QuotePage
