"use client";

import { createGlobalStyle } from "styled-components";

export const QuoteFilesCollapseGlobalStyle = createGlobalStyle`
  .quote-files-collapse.ant-collapse {
    border: 0;
    background: transparent;
    box-shadow: none;
  }

  .quote-files-collapse .ant-collapse-item {
    border: 0;
    margin-bottom: 10px;
    border-radius: 12px !important;
    overflow: hidden !important;
  }

  .quote-files-collapse .ant-collapse-item:last-child {
    margin-bottom: 0;
  }

  .quote-files-collapse .ant-collapse-item > .ant-collapse-header {
    background: #517a9b;
    color: #ffffff !important;
    padding: 0 !important;
    min-height: 56px;
    border-radius: 12px !important;
    overflow: hidden;
  }

  .quote-files-collapse .ant-collapse-header-text {
    flex: 1;
    min-width: 0;
    width: 100%;
  }

  .quote-file-header > span {
    min-width: 0;
  }

  .quote-files-collapse .ant-collapse-item-active > .ant-collapse-header {
    border-radius: 12px 12px 0 0 !important;
  }

  .quote-files-collapse .ant-collapse-expand-icon {
    color: #ffffff;
    padding-inline-start: 10px;
  }

  .quote-files-collapse .ant-collapse-item > .ant-collapse-content {
    border-top: 0;
    background: #f8fafc;
    border-radius: 0 0 12px 12px !important;
    overflow: hidden;
  }

  .quote-files-collapse .ant-collapse-content-box {
    padding: 14px;
  }

  @media (max-width: 640px) {
    .quote-files-collapse .ant-collapse-item > .ant-collapse-header {
      min-height: 48px;
      padding-inline-end: 10px !important;
    }

    .quote-files-collapse .ant-collapse-expand-icon {
      padding-inline-start: 8px;
      padding-inline-end: 6px;
    }

    .quote-file-header {
      gap: 4px;
      padding-top: 8px;
      padding-bottom: 8px;
    }

    .quote-file-header > span {
      white-space: normal;
      line-height: 1.25;
    }

    .quote-file-header > span:first-child {
      font-size: 0.92rem;
      font-weight: 600;
    }

    .quote-file-header > span:nth-child(2),
    .quote-file-header > span:nth-child(3) {
      font-size: 0.82rem;
    }
  }
`;
