'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { App } from 'antd';
import { useRouter } from 'next/navigation';
import Table from '@/components/common/Table';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import AntdModal from '@/components/common/antd/Modal';
import Form from '@/components/common/Form';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';
import { getContacts, deleteContact, createContact } from '@/lib/api/contact.api';
import type { ColumnsType } from '@/components/common/Table/types';

interface Contact {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  primaryContact: string;
  secondaryContact?: string;
  company?: string;
  notes?: string;
  createdAt?: string;
}

interface CreateFormValues {
  firstName: string;
  lastName?: string;
  email: string;
  primaryContact: string;
  secondaryContact?: string;
}

const StatCard = ({
  emoji,
  label,
  value,
  bg,
  color,
}: {
  emoji: string;
  label: string;
  value: number;
  bg: string;
  color: string;
}) => (
  <Card className="!rounded-2xl shadow-sm border border-gray-100">
    <div className="flex items-center gap-4">
      <div className={`${bg} ${color} rounded-xl p-3 text-2xl`}>{emoji}</div>
      <div>
        <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  </Card>
);

const ContactPage = () => {
  const router = useRouter();
  const { message } = App.useApp();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [form] = Form.useForm();

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getContacts();
      if (response.success && response.data) {
        setContacts(Array.isArray(response.data) ? response.data : []);
      }
    } catch {
      message.error('Failed to fetch contacts');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setCurrentTime(Date.now());
      void fetchContacts();
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [fetchContacts]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    form.resetFields();
  }, [form]);

  const handleCreateContact = async (values: CreateFormValues) => {
    setIsCreating(true);
    try {
      const response = await createContact(values);
      if (response.success) {
        message.success('Contact created successfully');
        closeModal();
        await fetchContacts();
      } else {
        message.error(response.message || 'Failed to create contact');
      }
    } catch (error: unknown) {
      message.error(error instanceof Error ? error.message : 'Failed to create contact');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = useCallback((id: string) => {
    AntdModal.confirm({
      title: 'Delete Contact',
      content: 'Are you sure you want to delete this contact?',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      cancelText: 'No',
      onOk: async () => {
        try {
          await deleteContact(id);
          message.success('Contact deleted successfully');
          await fetchContacts();
        } catch {
          message.error('Failed to delete contact');
        }
      },
    });
  }, [fetchContacts]);

  const columns: ColumnsType<Contact> = useMemo(() => [
    {
      title: 'Name',
      key: 'name',
      width: 180,
      render: (_: unknown, r: Contact) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {r.firstName[0]}{r.lastName?.[0] ?? ''}
          </div>
          <span className="font-medium text-gray-800">{r.firstName} {r.lastName ?? ''}</span>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 210,
      render: (val: string) => <span className="text-gray-600">{val}</span>,
    },
    {
      title: 'Primary Contact',
      dataIndex: 'primaryContact',
      key: 'primaryContact',
      width: 160,
      render: (val: string) => <span className="font-mono text-sm text-gray-700">{val}</span>,
    },
    {
      title: 'Secondary Contact',
      dataIndex: 'secondaryContact',
      key: 'secondaryContact',
      width: 160,
      render: (val?: string) => <span className="font-mono text-sm text-gray-500">{val || '—'}</span>,
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
      width: 150,
      render: (val?: string) => val
        ? <span className="inline-flex items-center gap-1 text-xs bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full border border-indigo-100">{val}</span>
        : <span className="text-gray-300">—</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      render: (_: unknown, record: Contact) => (
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/contact/${record.id}`)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100 transition-colors cursor-pointer"
          >
            👁️ View
          </button>
          <button
            onClick={() => handleDelete(record.id)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-500 border border-red-200 hover:bg-red-100 transition-colors cursor-pointer"
          >
            🗑️ Delete
          </button>
        </div>
      ),
    },
  ], [router, handleDelete]);

  const recentCount = useMemo(() =>
    contacts.filter((c) => {
      if (!currentTime) return false;
      if (!c.createdAt) return false;
      return currentTime - new Date(c.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000;
    }).length,
  [contacts, currentTime]);

  const companyCount = useMemo(() => contacts.filter((c) => c.company).length, [contacts]);

  return (
    <div className="px-2 pb-3 pt-0 sm:px-4 sm:pb-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Contacts</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage your contact directory</p>
        </div>
        <Button type="primary" onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">+ Create Contact</Button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
        <StatCard emoji="👥" label="Total Contacts" value={contacts.length} bg="bg-blue-100" color="text-blue-600" />
        <StatCard emoji="🆕" label="Added This Week" value={recentCount} bg="bg-green-100" color="text-green-600" />
        <StatCard emoji="🏢" label="Companies" value={companyCount} bg="bg-violet-100" color="text-violet-600" />
      </div>

      {/* Table — horizontally scrollable on small screens */}
      <Card className="!rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <Table
            columns={columns}
            dataSource={contacts}
            rowKey="id"
            loading={loading}
            scroll={{ x: 800 }}
            pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (total) => `${total} contacts` }}
            locale={{ emptyText: '📭 No contacts found. Create your first contact!' }}
          />
        </div>
      </Card>

      {/* Create Modal */}
      <Modal
        title={<span className="text-base font-semibold">Create New Contact</span>}
        open={isModalOpen}
        onCancel={closeModal}
        width="min(480px, 95vw)"
        variant="compact"
        footer={
          <div className="flex justify-end gap-2 pt-2">
            <Button onClick={closeModal}>Cancel</Button>
            <Button type="primary" loading={isCreating} onClick={() => form.submit()}>Create Contact</Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" onFinish={handleCreateContact} className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: 'First name is required' }]}>
              <Input placeholder="Enter first name" />
            </Form.Item>
            <Form.Item label="Last Name" name="lastName">
              <Input placeholder="Enter last name" />
            </Form.Item>
          </div>
          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Invalid email' }]}>
            <Input placeholder="Enter email" />
          </Form.Item>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
            <Form.Item label="Primary Contact" name="primaryContact" rules={[{ required: true, message: 'Primary contact is required' }]}>
              <Input placeholder="Primary number" />
            </Form.Item>
            <Form.Item label="Secondary Contact" name="secondaryContact">
              <Input placeholder="Secondary number" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default ContactPage;
