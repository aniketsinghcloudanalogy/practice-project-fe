"use client";

import styled from "styled-components";
import { Typography, Upload } from "antd";
import Button from "@/components/common/Button";

const { Title, Text, Paragraph } = Typography;
const { Dragger } = Upload;

export const PageWrapper = styled.div`
  min-height: 100vh;
  background: #f8f9fc;
  padding: 32px;
`;

export const HeroCard = styled.div`
  background: linear-gradient(135deg, #1d1f2b 0%, #2d3250 100%);
  border-radius: 16px;
  padding: 48px;
  margin-bottom: 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    width: 320px;
    height: 320px;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.2) 0%, transparent 70%);
    top: -80px;
    right: 80px;
    pointer-events: none;
  }
`;

export const HeroLeft = styled.div`
  flex: 1;
  z-index: 1;
`;

export const HeroTitle = styled(Title)`
  && {
    color: #ffffff;
    font-size: 32px;
    font-weight: 700;
    margin-bottom: 12px;
    letter-spacing: -0.5px;
  }
`;

export const HeroSubtitle = styled(Paragraph)`
  && {
    color: rgba(255, 255, 255, 0.6);
    font-size: 15px;
    margin-bottom: 0;
    max-width: 480px;
    line-height: 1.7;
  }
`;

export const StepBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
`;

export const StepDot = styled.span<{ $active?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? '#6366f1' : 'rgba(255,255,255,0.2)')};
  display: inline-block;
`;

export const StepLabel = styled(Text)`
  && {
    color: #6366f1;
    font-size: 12px;
    font-weight: 600;
    letter-spacing: 1.5px;
    text-transform: uppercase;
  }
`;

export const StatGrid = styled.div`
  display: flex;
  gap: 24px;
  z-index: 1;
  flex-shrink: 0;
`;

export const StatBox = styled.div`
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px 28px;
  text-align: center;
  backdrop-filter: blur(8px);
`;

export const StatNumber = styled(Title)`
  && {
    color: #ffffff;
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 4px;
  }
`;

export const StatLabel = styled(Text)`
  && {
    color: rgba(255, 255, 255, 0.45);
    font-size: 12px;
  }
`;

export const SectionCard = styled.div`
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e8eaed;
  padding: 28px;
  margin-bottom: 24px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

export const SectionTitle = styled(Title)`
  && {
    font-size: 16px;
    font-weight: 600;
    color: #1d1f2b;
    margin-bottom: 0;
  }
`;

export const StyledDragger = styled(Dragger)`
  && {
    background: #fafbff;
    border: 2px dashed #c7d2fe;
    border-radius: 10px;
    transition: all 0.2s;

    &:hover {
      border-color: #6366f1;
      background: #f0f1ff;
    }

    .ant-upload-drag-icon .anticon {
      color: #6366f1;
      font-size: 36px;
    }

    .ant-upload-text {
      color: #1d1f2b;
      font-weight: 600;
      font-size: 15px;
    }

    .ant-upload-hint {
      color: #8b8fa8;
      font-size: 13px;
    }
  }
`;

export const UploadButton = styled(Button)`
  && {
    background: #6366f1;
    border-color: #6366f1;
    border-radius: 8px;
    font-weight: 600;
    height: 40px;
    padding: 0 24px;
    margin-top: 16px;

    &:hover {
      background: #4f46e5;
      border-color: #4f46e5;
    }
  }
`;

export const FileNameText = styled(Text)`
  && {
    color: #6366f1;
    font-weight: 500;
    font-size: 13px;
  }
`;

export const OpenButton = styled(Button)`
  && {
    border-radius: 7px;
    font-weight: 500;
<<<<<<< HEAD
    font-size: 11px;
=======
    font-size: 13px;
>>>>>>> c318904 (Ui using HOtTables)
    height: 32px;
    border-color: #e8eaed;
    color: #1d1f2b;

    &:hover {
      border-color: #6366f1;
      color: #6366f1;
    }
  }
`;

<<<<<<< HEAD
export const DeleteButton = styled(Button)`
  && {
    border-radius: 7px;
    font-weight: 500;
    font-size: 11px;
    height: 32px;
    border-color: #fecaca;
    color: #dc2626;
    background: #fff5f5;

    &:hover {
      border-color: #ef4444;
      color: #ffffff;
      background: #ef4444;
    }
  }
`;

=======
>>>>>>> c318904 (Ui using HOtTables)
export const EmptyWrapper = styled.div`
  padding: 48px 0;
  text-align: center;
`;
