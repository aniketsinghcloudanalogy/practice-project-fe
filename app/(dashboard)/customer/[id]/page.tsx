'use client';

import React, { useState } from 'react';
import { App } from 'antd';
import { useParams } from 'next/navigation';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import Table from '@/components/common/Table';
import Select from '@/components/common/Select';
import confirm from '@/components/common/antd/Confirm';
import { EditOutlined, DeleteOutlined,CheckOutlined} from '@/components/common/antd/icons';
import AddressTabs, { buildAddressPayload } from '@/components/common/AddressForm';
import type { AddressFormValues, AddressTab } from '@/components/common/AddressForm';
import Form from '@/components/common/Form';
import Input from '@/components/common/Input';
import Checkbox from '@/components/common/Checkbox';
import {
  useGetCustomerQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useCreateCustomerContactMutation,
  useUpdateCustomerContactMutation,
  useDeleteCustomerContactMutation,
} from '@/store/services/customer/apiSlice';
import type { Address, Contact } from '@/store/services/types';

const CustomerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();

  const { data: customer, isLoading } = useGetCustomerQuery(id);
  const [createAddress, { isLoading: isCreatingAddr }] = useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdatingAddr }] = useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [createContact, { isLoading: isCreatingContact }] = useCreateCustomerContactMutation();
  const [updateContact, { isLoading: isUpdatingContact }] = useUpdateCustomerContactMutation();
  const [deleteContact] = useDeleteCustomerContactMutation();

  // ─── Contact state ────────────────────────────────────────────────
  const [contactOpen, setContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactForm] = Form.useForm();

  const [addrOpen, setAddrOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [addrTab, setAddrTab] = useState<AddressTab>('SHIPPING');
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [shippingForm] = Form.useForm<AddressFormValues>();
  const [billingForm] = Form.useForm<AddressFormValues>();

  const [addrFilter, setAddrFilter] = useState<'BILLING' | 'SHIPPING'>('SHIPPING');

  const contacts = (customer?.contacts ?? []) as Contact[];
  const isSingleContact = contacts.length === 1;
  const isFirstContact = contacts.length === 0;
  const lockBillingDefault = isFirstContact || Boolean(
    editingContact?.isPrimaryBillingContact
    && !contacts.some((contact) => contact.id !== editingContact.id && contact.isPrimaryBillingContact)
  );
  const lockShippingDefault = isFirstContact || Boolean(
    editingContact?.isPrimaryShippingContact
    && !contacts.some((contact) => contact.id !== editingContact.id && contact.isPrimaryShippingContact)
  );

  const contactColumns = [
    {
      title: 'Name', key: 'name', width: 180,
      render: (_: unknown, c: Contact) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">{c.firstName} {c.lastName ?? ''}</span>
          {c.company && <span className="text-xs text-gray-400">{c.company}</span>}
        </div>
      ),
    },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    {
      title: 'Phone', key: 'primaryContact',
      render: (_: unknown, c: Contact) => (
        <div className="flex items-center gap-2">
          <span>{c.primaryContact}</span>
          {c.isPrimaryBillingContact && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">Billing</span>}
          {c.isPrimaryShippingContact && <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">Shipping</span>}
        </div>
      ),
    },
    {
      title: 'Actions', key: 'actions', width: 80,
      render: (_: unknown, c: Contact) => (
        <div className="flex gap-1">
          <Button variant="icon-button-1" onClick={() => { setEditingContact(c); setContactOpen(true); }}><EditOutlined /></Button>
          <Button variant="icon-button-2" onClick={() => handleContactDelete(c.id)} className="bg-red-50! border! border-red-200! w-8! h-7!"><DeleteOutlined /></Button>
        </div>
      ),
    },
  ];

  const handleContactAfterOpenChange = (open: boolean) => {
    if (!open) { contactForm.resetFields(); setEditingContact(null); return; }
    if (editingContact) {
      contactForm.setFieldsValue({
        firstName: editingContact.firstName,
        lastName: editingContact.lastName,
        email: editingContact.email,
        primaryContact: editingContact.primaryContact,
        company: editingContact.company,
        isPrimaryBillingContact: isSingleContact ? true : editingContact.isPrimaryBillingContact,
        isPrimaryShippingContact: isSingleContact ? true : editingContact.isPrimaryShippingContact,
      });
    } else {
      contactForm.setFieldsValue({
        isPrimaryBillingContact: isFirstContact,
        isPrimaryShippingContact: isFirstContact,
      });
    }
  };

  const handleContactSave = async () => {
    try {
      const values = await contactForm.validateFields();
      const body = (isFirstContact || isSingleContact)
        ? { ...values, isPrimaryBillingContact: true, isPrimaryShippingContact: true }
        : values;
      if (editingContact) {
        await updateContact({ customerId: id, contactId: editingContact.id, body }).unwrap();
      } else {
        await createContact({ customerId: id, body }).unwrap();
      }
      message.success('Contact saved');
      setContactOpen(false);
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.data?.message || err?.message || 'Failed to save contact');
    }
  };

  const handleContactDelete = (contactId: string) => {
    confirm({
      title: 'Delete Contact',
      content: 'Are you sure?',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteContact({ customerId: id, contactId }).unwrap();
          message.success('Contact deleted');
        } catch {
          message.error('Failed to delete contact');
        }
      },
    });
  };

  const addresses = (customer?.addresses ?? []) as Address[];
  const isFirstAddress = addresses.length === 0;
  const isSingleAddress = addresses.length === 1;
  const lockBillingAddressDefault = isFirstAddress || Boolean(
    editingAddr?.isDefaultBilling
    && !addresses.some((address) => address.id !== editingAddr.id && address.isDefaultBilling)
  );
  const lockShippingAddressDefault = isFirstAddress || Boolean(
    editingAddr?.isDefaultShipping
    && !addresses.some((address) => address.id !== editingAddr.id && address.isDefaultShipping)
  );

  // Deduplicate: if a SHIPPING address has an identical BILLING address, hide the BILLING entry
  const deduplicatedAddresses = addresses.filter((a) => {
    if (a.type !== 'BILLING') return true;
    return !addresses.some(
      (s) =>
        s.type === 'SHIPPING' &&
        s.addressLine === a.addressLine &&
        s.city === a.city &&
        s.state === a.state &&
        s.zipCode === a.zipCode &&
        s.country === a.country
    );
  });

  const filteredAddresses = deduplicatedAddresses.filter((a) => {
    if (a.type === addrFilter || a.type === 'BOTH') return true;
    return addrFilter === 'BILLING' ? a.isDefaultBilling : a.isDefaultShipping;
  });

  const addrColumns = [
    { title: 'Type', dataIndex: 'type', key: 'type', width: 180,
      render: (type: string, addr: Address) => {
        const displayType = isSingleAddress ? addrFilter : type;

        return (
          <div className="flex flex-wrap gap-1">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${displayType === 'BILLING' ? 'bg-blue-50 text-blue-600' : displayType === 'BOTH' ? 'bg-indigo-50 text-indigo-600' : 'bg-green-50 text-green-600'}`}>{displayType}</span>
            {((addrFilter === 'BILLING' && addr.isDefaultBilling) || (addrFilter === 'SHIPPING' && addr.isDefaultShipping)) && (
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${addrFilter === 'BILLING' ? 'text-blue-700' : 'text-green-700'}`}>
                <CheckOutlined />
              </span>
            )}
          </div>
        );
      } },
    { title: 'Address', dataIndex: 'addressLine', key: 'addressLine' },
    { title: 'City', dataIndex: 'city', key: 'city' },
    { title: 'State', dataIndex: 'state', key: 'state' },
    { title: 'Zip', dataIndex: 'zipCode', key: 'zipCode' },
    { title: 'Country', dataIndex: 'country', key: 'country' },
    {
      title: 'Actions', key: 'actions', width: 80,
      render: (_: unknown, addr: Address) => (
        <div className="flex gap-1">
          <Button variant="icon-button-1" onClick={() => { setEditingAddr(addr); setAddrOpen(true); }}><EditOutlined /></Button>
          <Button variant="icon-button-2" onClick={() => handleAddrDelete(addr.id)} className="bg-red-50! border! border-red-200! w-8! h-7!"><DeleteOutlined /></Button>
        </div>
      ),
    },
  ];

  const handleAddrAfterOpenChange = (open: boolean) => {
    if (!open) {
      shippingForm.resetFields();
      billingForm.resetFields();
      setSameAsShipping(false);
      setAddrTab('SHIPPING');
      setEditingAddr(null);
      return;
    }
    if (editingAddr) {
      const values = {
        addressLine: editingAddr.addressLine,
        city: editingAddr.city,
        state: editingAddr.state,
        zipCode: editingAddr.zipCode,
        country: editingAddr.country,
      };
      if (editingAddr.type === 'BOTH') {
        shippingForm.setFieldsValue({
          ...values,
          isDefault: editingAddr.isDefaultShipping,
        });
        billingForm.setFieldsValue({
          ...values,
          isDefault: editingAddr.isDefaultBilling,
        });
        setSameAsShipping(true);
        setAddrTab('SHIPPING');
        return;
      }
      const isBilling = editingAddr.type === 'BILLING';
      const targetForm = isBilling ? billingForm : shippingForm;
      targetForm.setFieldsValue({
        ...values,
        isDefault: isBilling ? editingAddr.isDefaultBilling : editingAddr.isDefaultShipping,
      });
      setAddrTab(isBilling ? 'BILLING' : 'SHIPPING');
    } else {
      shippingForm.setFieldsValue({ isDefault: isFirstAddress });
      billingForm.setFieldsValue({ isDefault: isFirstAddress });
    }
  };

  const handleAddrSave = async () => {
    try {
      const saves: Array<() => Promise<unknown>> = [];
      const forceDefaultAddress = isFirstAddress || Boolean(editingAddr && isSingleAddress);

      const shippingValues = await shippingForm.validateFields().catch(() => null);
      if (shippingValues?.addressLine) {
        const body = buildAddressPayload(
          { ...shippingValues, isDefault: forceDefaultAddress || shippingValues.isDefault },
          'SHIPPING',
        );
        if (editingAddr && (editingAddr.type === 'SHIPPING' || editingAddr.type === 'BOTH')) {
          saves.push(() => updateAddress({ customerId: id, addressId: editingAddr.id, body }).unwrap());
        } else {
          saves.push(() => createAddress({ customerId: id, body }).unwrap());
        }
      }

      if (!sameAsShipping) {
        const billingValues = await billingForm.validateFields().catch(() => null);
        if (billingValues?.addressLine) {
          const body = buildAddressPayload(
            { ...billingValues, isDefault: forceDefaultAddress || billingValues.isDefault },
            'BILLING',
          );
          if (editingAddr && editingAddr.type === 'BILLING') {
            saves.push(() => updateAddress({ customerId: id, addressId: editingAddr.id, body }).unwrap());
          } else {
            saves.push(() => createAddress({ customerId: id, body }).unwrap());
          }
        }
      }

      if (!saves.length) { message.warning('No address data to save'); return; }
      for (const save of saves) {
        await save();
      }
      message.success('Address saved');
      setAddrOpen(false);
    } catch (err: any) {
      message.error(err?.data?.message || err?.message || 'Failed to save address');
    }
  };

  const handleAddrDelete = (addressId: string) => {
    confirm({
      title: 'Delete Address',
      content: 'Are you sure?',
      okText: 'Delete',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteAddress({ customerId: id, addressId }).unwrap();
          message.success('Address deleted');
        } catch {
          message.error('Failed to delete address');
        }
      },
    });
  };

  if (isLoading) return <div className="p-6 text-gray-400">Loading...</div>;
  if (!customer) return <div className="p-6 text-gray-400">Customer not found.</div>;

  const initials = customer.name?.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) ?? '?';
  const primaryBilling = contacts.find((c) => c.isPrimaryBillingContact);
  const primaryShipping = contacts.find((c) => c.isPrimaryShippingContact);
  const defaultShipping = addresses.find((a) => a.isDefaultShipping);
  const defaultBilling = addresses.find((a) => a.isDefaultBilling);

  return (
    <div className="px-4 pb-6 pt-0 -ml-[92px] md:ml-0">
      {/* Profile Info Cards — 2x2 grid: row1=(Avatar, ContactInfo), row2=(Overview, AddressInfo) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Row 1, Col 1 — Avatar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-20 bg-linear-to-r from-indigo-500 to-violet-500" />
          <div className="flex flex-col items-center -mt-8 pb-4 px-4">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xl font-bold border-4 border-white">
              {initials}
            </div>
            <h2 className="mt-2 text-base font-bold text-gray-900">{customer.name || '—'}</h2>
          </div>
        </div>

        {/* Row 1, Col 2 — Contact Information */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-800">Contact Information</p>
          <p className="text-xs text-gray-400 mb-4">Personal and contact details</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">👤</div>
              <div>
                <p className="text-xs text-gray-400">FULL NAME</p>
                <p className="text-sm font-medium text-gray-800">{customer.name || '—'}</p>
              </div>
            </div>
            {primaryBilling && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">📋</div>
                <div>
                  <p className="text-xs text-gray-400">PRIMARY BILLING CONTACT</p>
                  <p className="text-sm font-medium text-gray-800">{primaryBilling.firstName} {primaryBilling.lastName ?? ''}</p>
                  <p className="text-xs text-gray-400">{primaryBilling.primaryContact}</p>
                </div>
              </div>
            )}
            {primaryShipping && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500 shrink-0">🚚</div>
                <div>
                  <p className="text-xs text-gray-400">PRIMARY SHIPPING CONTACT</p>
                  <p className="text-sm font-medium text-gray-800">{primaryShipping.firstName} {primaryShipping.lastName ?? ''}</p>
                  <p className="text-xs text-gray-400">{primaryShipping.primaryContact}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2, Col 1 — Overview */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-400 tracking-widest mb-3">OVERVIEW</p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-blue-600">{contacts.length}</p>
              <p className="text-xs text-blue-400">Contacts</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-purple-600">{addresses.length}</p>
              <p className="text-xs text-purple-400">Addresses</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2 mb-2">
            <p className="text-xs text-gray-400">INDUSTRY</p>
            <p className="text-sm font-medium text-gray-700">{customer.industry || '—'}</p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">CUSTOMER ID</p>
            <p className="text-xs font-mono text-gray-500 truncate">{customer.id}</p>
          </div>
        </div>

        {/* Row 2, Col 2 — Address Information */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-800">Address Information</p>
          <p className="text-xs text-gray-400 mb-4">Default billing and shipping addresses</p>
          <div className="flex flex-col gap-3">
            {defaultShipping ? (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500 shrink-0">📦</div>
                <div>
                  <p className="text-xs text-gray-400">DEFAULT SHIPPING ADDRESS</p>
                  <p className="text-sm font-medium text-gray-800">{defaultShipping.addressLine}</p>
                  <p className="text-xs text-gray-500">{[defaultShipping.city, defaultShipping.state, defaultShipping.zipCode, defaultShipping.country].filter(Boolean).join(', ')}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No default shipping address set</p>
            )}
            {defaultBilling ? (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">💳</div>
                <div>
                  <p className="text-xs text-gray-400">DEFAULT BILLING ADDRESS</p>
                  <p className="text-sm font-medium text-gray-800">{defaultBilling.addressLine}</p>
                  <p className="text-xs text-gray-500">{[defaultBilling.city, defaultBilling.state, defaultBilling.zipCode, defaultBilling.country].filter(Boolean).join(', ')}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">No default billing address set</p>
            )}
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <span className="text-base font-semibold text-gray-800">Addresses</span>
        <div className="flex items-center gap-2">
          <Select
            value={addrFilter}
            onChange={(v) => setAddrFilter(v as 'BILLING' | 'SHIPPING')}
            options={[
              { label: 'Billing', value: 'BILLING' },
              { label: 'Shipping', value: 'SHIPPING' },
            ]}
            style={{ width: 110 }}
          />
          <Button type="primary" onClick={() => { setEditingAddr(null); setAddrOpen(true); }}>+ Add Address</Button>
        </div>
      </div>

      <div className="overflow-x-auto -mx-4 px-4">
        <Table
          dataSource={filteredAddresses}
          columns={addrColumns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'No addresses yet' }}
        />
      </div>

      {/* Contacts Section */}
      <div className="flex items-center justify-between mb-3 mt-6">
        <span className="text-base font-semibold text-gray-800">Contacts</span>
        <Button type="primary" onClick={() => { setEditingContact(null); setContactOpen(true); }}>+ Add Contact</Button>
      </div>

      <div className="overflow-x-auto -mx-4 px-4">
        <Table
          dataSource={contacts}
          columns={contactColumns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: 'No contacts yet' }}
        />
      </div>

      <Modal
        title={editingContact ? 'Edit Contact' : 'Add Contact'}
        open={contactOpen}
        onCancel={() => setContactOpen(false)}
        afterOpenChange={handleContactAfterOpenChange}
        width="min(480px, 95vw)"
        styles={{
          container: { padding: '16px 0 0' },
          header: { padding: '0 16px 12px', marginBottom: 0, borderBottom: '1px solid #f1f5f9' },
          body: { padding: '16px', backgroundColor: '#ffffff' },
          footer: { padding: '12px 16px 16px', borderTop: '1px solid #f1f5f9', backgroundColor: '#ffffff', borderRadius: '0 0 8px 8px' },
        }}
        forceRender
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setContactOpen(false)}>Cancel</Button>
            <Button type="primary" loading={isCreatingContact || isUpdatingContact} onClick={handleContactSave}>Save</Button>
          </div>
        }
      >
        <Form form={contactForm} layout="vertical">
          <div className="grid grid-cols-2 gap-x-3">
            <Form.Item name="firstName" label="First Name" rules={[{ required: true, min: 2 }]}>
              <Input placeholder="First name" />
            </Form.Item>
            <Form.Item name="lastName" label="Last Name">
              <Input placeholder="Last name" />
            </Form.Item>
          </div>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Form.Item name="primaryContact" label="Phone" rules={[{ required: true, min: 10, max: 15 }]}>
            <Input placeholder="Phone number" />
          </Form.Item>
          <Form.Item name="company" label="Company">
            <Input placeholder="Company" />
          </Form.Item>
          <div className="flex gap-4">
            <Form.Item name="isPrimaryBillingContact" valuePropName="checked">
              <Checkbox disabled={lockBillingDefault}>Primary Billing Contact</Checkbox>
            </Form.Item>
            <Form.Item name="isPrimaryShippingContact" valuePropName="checked">
              <Checkbox disabled={lockShippingDefault}>Primary Shipping Contact</Checkbox>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title={editingAddr ? 'Edit Address' : 'Add Address'}
        open={addrOpen}
        onCancel={() => setAddrOpen(false)}
        afterOpenChange={handleAddrAfterOpenChange}
        width="min(540px, 95vw)"
        styles={{
          container: { padding: '16px 0 0' },
          header: { padding: '0 16px 12px', marginBottom: 0, borderBottom: '1px solid #f1f5f9' },
          body: { padding: '0 16px', backgroundColor: '#ffffff' },
          footer: { padding: '12px 16px 16px', borderTop: '1px solid #f1f5f9', backgroundColor: '#ffffff', borderRadius: '0 0 8px 8px' },
        }}
        forceRender
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setAddrOpen(false)}>Cancel</Button>
            <Button type="primary" loading={isCreatingAddr || isUpdatingAddr} onClick={handleAddrSave}>Save</Button>
          </div>
        }
      >
        <div className="max-h-[70vh] overflow-y-auto">
          <AddressTabs
            shippingForm={shippingForm}
            billingForm={billingForm}
            activeTab={addrTab}
            onTabChange={setAddrTab}
            sameAsShipping={sameAsShipping}
            onSameAsShippingChange={setSameAsShipping}
            shippingDefaultDisabled={lockShippingAddressDefault}
            billingDefaultDisabled={lockBillingAddressDefault}
          />
        </div>
      </Modal>
    </div>
  );
};

export default CustomerProfile;
