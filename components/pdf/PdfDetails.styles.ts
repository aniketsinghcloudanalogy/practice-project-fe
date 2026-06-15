"use client";

import styled from "styled-components";

export const StyledPdfDetailsPage = styled.div`
  .pdf-detail-layout {
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  .pdf-detail-topbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }

  .pdf-detail-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .pdf-detail-actions__menu-slot {
    flex: 0 0 42px;
    width: 42px;
    display: flex;
    justify-content: center;
  }

  .pdf-detail-actions__menu-slot--hidden {
    visibility: hidden;
    pointer-events: none;
  }

  .pdf-icon-button.ant-btn {
    min-width: 42px;
    padding-inline: 10px;
  }

  .pdf-row-actions {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    gap: 6px;
  }

  .pdf-row-actions .ant-btn {
    white-space: nowrap;
  }

  .pdf-section-card {
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 20px;
    background: #ffffff;
    box-shadow: 0 18px 50px -40px rgba(15, 23, 42, 0.3);
  }

  .pdf-section-header {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 18px 20px 0;
  }

  .pdf-section-title {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #0f172a;
  }

  .pdf-section-copy {
    margin: 6px 0 0;
    font-size: 13px;
    line-height: 1.65;
    color: #64748b;
  }

  .pdf-text-toggle {
    padding: 0;
    border: 0;
    background: transparent;
  }

  .pdf-text-panel {
    border-top: 1px solid #e2e8f0;
    background: #f8fafc;
  }

  .pdf-text-content {
    max-height: 280px;
    overflow: auto;
    padding: 16px 20px 20px;
    white-space: pre-wrap;
    word-break: break-word;
    font-size: 13px;
    line-height: 1.8;
    color: #1e293b;
  }

  .pdf-status-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 700;
    background: #eff6ff;
    color: #1d4ed8;
  }

  .pdf-detail-card {
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    background: #ffffff;
    box-shadow: 0 24px 70px -36px rgba(15, 23, 42, 0.45);
  }

  .pdf-detail-header {
    border-bottom: 1px solid #e2e8f0;
    padding: 20px 24px;
    color: #ffffff;
    background: linear-gradient(90deg, #020617 0%, #0f172a 50%, #1e293b 100%);
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
  }

  .pdf-detail-badge {
    display: flex;
    height: 44px;
    width: 44px;
    align-items: center;
    justify-content: center;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.1);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.08);
  }

  .pdf-detail-title {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #ffffff;
  }

  .pdf-detail-header > div:first-child {
    flex: 1 1 auto;
    min-width: 0;
  }

  .pdf-detail-actions {
    margin-left: auto;
    justify-content: flex-end;
    flex-wrap: nowrap;
    white-space: nowrap;
  }

  .pdf-detail-subtitle {
    margin: 0;
    font-size: 14px;
    color: #cbd5e1;
  }

  .pdf-table-shell {
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 18px;
  }

  .pdf-structured-table .ant-table {
    background: transparent;
  }

  .pdf-structured-table .ant-table-container {
    border-radius: 1rem;
  }

  .pdf-structured-table .ant-table-thead > tr > th {
    padding: 14px 16px;
    color: #334155;
    font-weight: 700;
    letter-spacing: 0.01em;
    background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
    border-bottom: 1px solid #e2e8f0;
  }

  .pdf-structured-table .ant-table-tbody > tr > td {
    padding: 14px 16px;
    color: #1e293b;
    border-bottom: 1px solid #e2e8f0;
    vertical-align: middle;
  }

  .pdf-structured-table .ant-table-tbody > tr:hover > td {
    background: #f8fafc;
  }

  .pdf-structured-table .ant-table-tbody > tr:nth-child(even) > td {
    background: #fbfdff;
  }

  .pdf-structured-table .ant-table-cell:first-child {
    font-weight: 600;
  }

  .pdf-structured-table .ant-table-selection-column {
    text-align: center !important;
  }

  .pdf-structured-table .ant-table-selection-column .ant-table-selection,
  .pdf-structured-table .ant-table-selection-column .ant-checkbox-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pdf-structured-table .pdf-actions-cell {
    white-space: nowrap;
    text-align: center !important;
  }

  .pdf-structured-table .ant-table-thead th:last-child {
    text-align: center !important;
  }

  .pdf-structured-table .ant-table-tbody > tr.pdf-editing-row > td {
    background: #eff6ff !important;
    border-bottom-color: #bfdbfe;
  }

  .pdf-structured-table .ant-table-expanded-row > .ant-table-cell {
    padding: 0 !important;
    background: #f8fafc;
    border-bottom: 1px solid #e2e8f0;
  }

  .pdf-editing-badge {
    display: inline-flex;
    align-items: center;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 12px;
    font-weight: 700;
    background: #dbeafe;
    color: #1d4ed8;
  }

  .pdf-row-edit-panel {
    padding: 18px 20px 20px;
    background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
  }

  .pdf-row-edit-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 14px 16px;
  }

  .pdf-row-edit-field label {
    display: block;
    margin-bottom: 6px;
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
  }

  .pdf-row-edit-field .ant-input {
    width: 100%;
  }

  .pdf-row-edit-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid #e2e8f0;
  }

  .pdf-bulk-edit-form {
    display: flex;
    flex-direction: column;
    gap: 18px;
  }

  .pdf-bulk-edit-toolbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding-bottom: 12px;
  }

  .pdf-bulk-edit-hint {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    color: #64748b;
  }

  .pdf-bulk-edit-selected-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .pdf-bulk-edit-row {
    display: flex;
    align-items: stretch;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 14px;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
  }

  .pdf-bulk-edit-row-main {
    flex: 1 1 auto;
    display: grid !important;
    grid-template-columns: minmax(180px, 220px) 240px;
    gap: 12px;
    width: 100%;
    min-width: 0;
    align-items: end;
  }

  .pdf-bulk-edit-row > .pdf-bulk-edit-row-actions {
    display: none;
  }

  .pdf-bulk-edit-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    flex: 1 1 0;
  }

  .pdf-bulk-edit-field:first-child {
    flex-basis: auto;
  }

  .pdf-bulk-edit-field:last-child {
    width: 240px;
    justify-self: start;
  }

  .pdf-bulk-edit-field label {
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
  }

  .pdf-bulk-edit-field .ant-select,
  .pdf-bulk-edit-field .ant-input {
    width: 100%;
  }

  .pdf-bulk-edit-row-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pdf-bulk-edit-empty {
    padding: 18px 16px;
    border: 1px dashed #cbd5e1;
    border-radius: 16px;
    background: #f8fafc;
    color: #64748b;
    font-size: 13px;
  }

  .pdf-structured-table .ant-table-pagination {
    margin: 20px 0 0;
  }

  .pdf-empty-state {
    display: flex;
    min-height: 20rem;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2.5rem 1.5rem;
    text-align: center;
    background: #f8fafc;
    border: 1px dashed #cbd5e1;
    border-radius: 18px;
  }

  .pdf-empty-state__icon {
    display: flex;
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
    align-items: center;
    justify-content: center;
    background: #ffffff;
    border-radius: 9999px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.06);
    box-shadow: inset 0 0 0 1px #e2e8f0;
  }
`;
