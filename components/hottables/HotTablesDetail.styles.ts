"use client";

import styled from "styled-components";
import { Typography } from "antd";
import Button from "@/components/common/Button";

const { Title } = Typography;

export const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8f9fc;
  padding: 32px;
`;

export const TopBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
`;

export const BackButton = styled(Button)`
  && {
    border-radius: 8px;
    font-weight: 500;
    font-size: 13px;
    height: 36px;
    border-color: #e8eaed;
    color: #1d1f2b;
    &:hover {
      border-color: #6366f1;
      color: #6366f1;
    }
  }
`;

export const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const FileChip = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #ffffff;
  border: 1px solid #e8eaed;
  border-radius: 8px;
  padding: 6px 14px;
`;

export const PageTitle = styled(Title)`
  && {
    font-size: 22px;
    font-weight: 700;
    color: #1d1f2b;
    margin-bottom: 24px;
  }
`;

export const TablesWrapper = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8eaed;
  overflow: hidden;
`;

export const TableSection = styled.div`
  & + & {
    border-top: 2px solid #e8eaed;
  }
`;

export const TableHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 20px;
  background: #fafbff;
  border-bottom: 1px solid #f0f1f5;
`;

export const TableTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const TableTitle = styled(Title)`
  && {
    font-size: 14px;
    font-weight: 600;
    color: #1d1f2b;
    margin-bottom: 0;
  }
`;

export const TableIndexBadge = styled.span`
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #ede9fe;
  color: #6366f1;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const ActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const AddButton = styled(Button)`
  && {
    border-radius: 6px;
    font-size: 12px;
    font-weight: 500;
    height: 28px;
    padding: 0 10px;
    border-color: #e8eaed;
    color: #3d3f52;
    &:hover {
      border-color: #6366f1;
      color: #6366f1;
    }
  }
`;

export const HotWrapper = styled.div`
  .handsontable {
    font-family: inherit;
    font-size: 13px;
  }
  .handsontable th {
    background: #f8f9fc;
    color: #1d1f2b;
    font-weight: 600;
    font-size: 12px;
  }
  .handsontable td {
    color: #3d3f52;
  }
`;

export const CenterBox = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
`;

export const BottomActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
`;
