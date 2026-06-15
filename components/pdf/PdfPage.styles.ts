"use client";

import styled from "styled-components";

export const StyledPdfPage = styled.div`
  .pdf-page-hero {
    margin-bottom: 24px;
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 28px;
    background:
      radial-gradient(circle at top right, rgba(59, 130, 246, 0.14), transparent 32%),
      linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    box-shadow: 0 24px 60px -38px rgba(15, 23, 42, 0.35);
  }

  .pdf-page-hero__inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    padding: 24px 28px;
  }

  .pdf-page-kicker {
    margin: 0 0 8px;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.22em;
    text-transform: uppercase;
    color: #64748b;
  }

  .pdf-page-title {
    margin: 0;
    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.03em;
    color: #0f172a;
  }

  .pdf-page-copy {
    max-width: 640px;
    margin-top: 10px;
    font-size: 14px;
    line-height: 1.75;
    color: #475569;
  }

  .pdf-upload-card {
    min-width: 280px;
    padding: 16px;
    border: 1px solid #dbeafe;
    border-radius: 20px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(239, 246, 255, 0.98) 100%);
    box-shadow: 0 16px 30px -26px rgba(37, 99, 235, 0.4);
  }

  .pdf-upload-card__label {
    margin: 0 0 6px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.16em;
    color: #2563eb;
  }

  .pdf-upload-card__title {
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: #0f172a;
  }

  .pdf-upload-card__copy {
    margin: 6px 0 14px;
    font-size: 13px;
    line-height: 1.65;
    color: #475569;
  }

  .pdf-list-card {
    overflow: hidden;
    border: 1px solid #e2e8f0;
    border-radius: 24px;
    background: #ffffff;
    box-shadow: 0 18px 50px -40px rgba(15, 23, 42, 0.3);
  }

  .pdf-list-card__header {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px;
    padding: 22px 24px 0;
  }

  .pdf-list-card__title {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: #0f172a;
  }

  .pdf-list-card__subtitle {
    margin: 6px 0 0;
    font-size: 14px;
    color: #64748b;
  }
`;
