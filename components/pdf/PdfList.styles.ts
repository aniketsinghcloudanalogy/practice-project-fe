"use client";

import styled from "styled-components";

export const StyledPdfList = styled.div`
  .pdf-list-table {
    padding: 0 24px 24px;
  }

  .pdf-list-table .ant-table {
    background: transparent;
  }

  .pdf-list-table .ant-table-container {
    border-radius: 18px;
  }

  .pdf-list-table .ant-table-thead > tr > th {
    padding: 18px 20px;
    color: #334155;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    background: linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%);
    border-bottom: 1px solid #e2e8f0;
  }

  .pdf-list-table .ant-table-tbody > tr > td {
    padding: 18px 20px;
    color: #1e293b;
    border-bottom: 1px solid #e2e8f0;
  }

  .pdf-list-actions {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    white-space: nowrap;
  }

  .pdf-list-actions .ant-btn {
    white-space: nowrap;
  }

  .pdf-list-table .ant-table-tbody > tr:hover > td {
    background: #f8fafc;
  }

  .pdf-list-table .ant-table-tbody > tr:nth-child(even) > td {
    background: #fbfdff;
  }

  .pdf-list-table .ant-pagination {
    margin: 20px 24px 24px;
  }

  .pdf-empty-state {
    display: flex;
    min-height: 320px;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 1.5rem;
    text-align: center;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    border-top: 1px solid #e2e8f0;
  }

  .pdf-empty-state__icon {
    display: flex;
    width: 68px;
    height: 68px;
    margin-bottom: 18px;
    align-items: center;
    justify-content: center;
    border-radius: 9999px;
    background: #ffffff;
    box-shadow: inset 0 0 0 1px #e2e8f0, 0 1px 2px rgba(15, 23, 42, 0.06);
  }

  .pdf-empty-state__title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
  }

  .pdf-empty-state__copy {
    max-width: 420px;
    margin: 10px 0 0;
    font-size: 14px;
    line-height: 1.7;
    color: #64748b;
  }

  .pdf-action-button .ant-btn {
    border-radius: 10px;
    font-weight: 600;
  }
`;
