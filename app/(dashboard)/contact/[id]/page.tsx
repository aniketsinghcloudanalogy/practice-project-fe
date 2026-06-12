'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { App } from 'antd';
import { useParams, useRouter } from 'next/navigation';
import { getContact, updateContact, deleteContact } from '@/lib/api/contact.api';
import Button from '@/components/common/Button';
import Form from '@/components/common/Form';
import Input from '@/components/common/Input';
import Card from '@/components/common/Card';
import AntdModal from '@/components/common/antd/Modal';

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

const InfoRow = ({ icon, label, value }: { icon: string; label: string; value?: string }) => {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4 py-4 border-b border-gray-100 last:border-0">
      <div className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center text-base shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
        <p className="text-sm font-medium text-gray-800 break-all">{value}</p>
      </div>
    </div>
  );
};

const SkeletonBlock = ({ w = 'w-full', h = 'h-4' }: { w?: string; h?: string }) => (
  <div className={`${w} ${h} bg-gray-100 rounded-lg animate-pulse`} />
);

const ContactDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { message } = App.useApp();
  const contactId = params?.id as string;
  const [contact, setContact] = useState<Contact | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [form] = Form.useForm();

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      setCurrentTime(Date.now());
    }, 0);

    return () => window.clearTimeout(timerId);
  }, []);

  useEffect(() => {
    if (!contactId) return;
    const fetchContact = async () => {
      setIsLoading(true);
      try {
        const response = await getContact(contactId);
        if (response.success && response.data) {
          const data = response.data as Contact;
          setContact(data);
          form.setFieldsValue(data);
        }
      } catch {
        message.error('Failed to fetch contact');
      } finally {
        setIsLoading(false);
      }
    };
    void fetchContact();
  }, [contactId, form]);

  const handleUpdate = async (values: Partial<Contact>) => {
    setIsSaving(true);
    try {
      const response = await updateContact(contactId, values);
      if (response.success) {
        message.success('Contact updated successfully');
        setContact((prev) => (prev ? { ...prev, ...values } : prev));
        setIsEditing(false);
      } else {
        message.error(response.message || 'Failed to update contact');
      }
    } catch {
      message.error('Failed to update contact');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    AntdModal.confirm({
      title: 'Delete Contact',
      content: 'Are you sure you want to delete this contact?',
      okText: 'Yes, Delete',
      okButtonProps: { danger: true },
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await deleteContact(contactId);
          message.success('Contact deleted');
          router.push('/contact');
        } catch {
          message.error('Failed to delete contact');
        }
      },
    });
  };

  const cancelEdit = () => {
    form.setFieldsValue(contact ?? {});
    setIsEditing(false);
  };

  const initials = useMemo(() =>
    contact ? `${contact.firstName[0]}${contact.lastName?.[0] ?? ''}`.toUpperCase() : '?',
  [contact]);

  const fullName = useMemo(() =>
    contact ? `${contact.firstName} ${contact.lastName ?? ''}`.trim() : '—',
  [contact]);

  const memberSince = useMemo(() =>
    contact?.createdAt
      ? new Date(contact.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
      : '—',
  [contact]);

  const daysSince = useMemo(() =>
    contact?.createdAt && currentTime
      ? Math.floor((currentTime - new Date(contact.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      : 0,
  [contact, currentTime]);

  const phoneCount = useMemo(() =>
    [contact?.primaryContact, contact?.secondaryContact].filter(Boolean).length,
  [contact]);

  return (
    <div className="px-2 pb-3 pt-0 sm:px-4 sm:pb-6 max-w-5xl mx-auto">

      {/* Top nav */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => router.push('/contact')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <span className="text-lg leading-none">←</span>
          <span className="hidden sm:inline">Back to Contacts</span>
          <span className="sm:hidden">Back</span>
        </button>
        {!isEditing && !isLoading && (
          <div className="flex gap-2">
            <Button type="primary" size="small" onClick={() => setIsEditing(true)}>✏️ <span className="hidden sm:inline">Edit</span></Button>
            <Button danger size="small" onClick={handleDelete}>🗑️ <span className="hidden sm:inline">Delete</span></Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">

        {/* LEFT — Profile + Stats */}
        <div className="lg:col-span-1 flex flex-col gap-4 sm:gap-5">

          {/* Identity card */}
          <Card className="!rounded-2xl shadow-sm border border-gray-100 overflow-hidden !p-0">
            <div className="h-20 sm:h-24 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-t-2xl" />
            <div className="flex flex-col items-center -mt-10 pb-5 px-4 sm:px-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold ring-4 ring-white shadow-md">
                {isLoading ? '?' : initials}
              </div>
              {isLoading ? (
                <div className="w-full mt-4 flex flex-col items-center gap-2">
                  <SkeletonBlock w="w-32" h="h-5" />
                  <SkeletonBlock w="w-48" h="h-3" />
                </div>
              ) : (
                <>
                  <h2 className="mt-3 text-lg font-bold text-gray-900 text-center leading-tight">{fullName}</h2>
                  <p className="text-sm text-gray-500 text-center mt-1 break-all">{contact?.email || '—'}</p>
                  {contact?.company && (
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full border border-indigo-100 font-medium">
                      🏢 {contact.company}
                    </span>
                  )}
                </>
              )}
            </div>
          </Card>

          {/* Stats */}
          <Card className="!rounded-2xl shadow-sm border border-gray-100">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-4 font-semibold">Overview</p>
            {isLoading ? (
              <div className="grid grid-cols-2 gap-3">
                <SkeletonBlock h="h-16" />
                <SkeletonBlock h="h-16" />
                <SkeletonBlock w="col-span-2 w-full" h="h-14" />
                <SkeletonBlock w="col-span-2 w-full" h="h-14" />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
                  <p className="text-2xl font-bold text-blue-600">{phoneCount}</p>
                  <p className="text-xs text-blue-400 mt-0.5">Phones</p>
                </div>
                <div className="bg-violet-50 rounded-xl p-3 text-center border border-violet-100">
                  <p className="text-2xl font-bold text-violet-600">{daysSince}</p>
                  <p className="text-xs text-violet-400 mt-0.5">Days Active</p>
                </div>
                <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Added On</p>
                  <p className="text-sm font-semibold text-gray-700 mt-1">{memberSince}</p>
                </div>
                <div className="col-span-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                  <p className="text-xs text-gray-400 uppercase tracking-wider">Contact ID</p>
                  <p className="text-xs font-mono text-gray-500 mt-1 break-all">{contact?.id || '—'}</p>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT — Info / Edit */}
        <div className="lg:col-span-2">
          <Card className="!rounded-2xl shadow-sm border border-gray-100 h-full">

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100 mb-2">
              <div>
                <h3 className="text-base font-semibold text-gray-800">
                  {isEditing ? 'Edit Contact' : 'Contact Information'}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isEditing ? 'Update the fields below and save' : 'Personal and contact details'}
                </p>
              </div>
              {isEditing && (
                <div className="flex gap-2 self-end sm:self-auto">
                  <Button size="small" onClick={cancelEdit}>Cancel</Button>
                  <Button size="small" type="primary" loading={isSaving} onClick={() => form.submit()}>Save Changes</Button>
                </div>
              )}
            </div>

            {/* Skeleton */}
            {isLoading && !isEditing && (
              <div className="flex flex-col gap-4 py-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 py-2">
                    <SkeletonBlock w="w-9" h="h-9" />
                    <div className="flex-1 flex flex-col gap-1.5">
                      <SkeletonBlock w="w-20" h="h-3" />
                      <SkeletonBlock w="w-40" h="h-4" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View mode */}
            {!isLoading && (
              <div className={isEditing ? 'hidden' : ''}>
                <InfoRow icon="👤" label="Full Name" value={fullName} />
                <InfoRow icon="📧" label="Email Address" value={contact?.email} />
                <InfoRow icon="📞" label="Primary Contact" value={contact?.primaryContact} />
                <InfoRow icon="📱" label="Secondary Contact" value={contact?.secondaryContact} />
                <InfoRow icon="🏢" label="Company" value={contact?.company} />
                <InfoRow icon="📝" label="Notes" value={contact?.notes} />
              </div>
            )}

            {/* Edit mode — always mounted */}
            <Form
              form={form}
              layout="vertical"
              onFinish={handleUpdate}
              className={isEditing ? 'mt-2' : 'hidden'}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5">
                <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: 'Required' }]}>
                  <Input size="large" placeholder="First name" />
                </Form.Item>
                <Form.Item label="Last Name" name="lastName">
                  <Input size="large" placeholder="Last name" />
                </Form.Item>
                <Form.Item label="Email" name="email" className="sm:col-span-2"
                  rules={[{ required: true, message: 'Required' }, { type: 'email', message: 'Invalid email' }]}>
                  <Input size="large" placeholder="email@example.com" />
                </Form.Item>
                <Form.Item label="Primary Contact" name="primaryContact" rules={[{ required: true, message: 'Required' }]}>
                  <Input size="large" placeholder="+1 000 000 0000" />
                </Form.Item>
                <Form.Item label="Secondary Contact" name="secondaryContact">
                  <Input size="large" placeholder="+1 000 000 0000" />
                </Form.Item>
                <Form.Item label="Company" name="company" className="sm:col-span-2">
                  <Input size="large" placeholder="Company name" />
                </Form.Item>
                <Form.Item label="Notes" name="notes" className="sm:col-span-2">
                  <Input size="large" placeholder="Any additional notes..." />
                </Form.Item>
              </div>
            </Form>

          </Card>
        </div>
      </div>
    </div>
  );
};

export default ContactDetailPage;
