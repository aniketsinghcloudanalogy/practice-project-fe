"use client";

import React, { useState } from "react";
import { App } from "antd";
import { useParams } from "next/navigation";
import Button from "@/components/common/Button";
import Modal from "@/components/common/Modal";
import Table from "@/components/common/Table";
import Select from "@/components/common/Select";
import confirm from "@/components/common/antd/Confirm";
import {
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
} from "@/components/common/antd/icons";
import AddressTabs, {
  buildAddressPayload,
} from "@/components/common/AddressForm";
import type {
  AddressFormValues,
  AddressTab,
} from "@/components/common/AddressForm";
import Form from "@/components/common/Form";
import Input from "@/components/common/Input";
import Checkbox from "@/components/common/Checkbox";
import {
  useGetCustomerQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useCreateCustomerContactMutation,
  useUpdateCustomerContactMutation,
  useDeleteCustomerContactMutation,
} from "@/store/services/customer/apiSlice";
import type { Address, Contact } from "@/store/services/types";

const CustomerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const { message } = App.useApp();

  const { data: customer, isLoading } = useGetCustomerQuery(id);
  const [createAddress, { isLoading: isCreatingAddr }] =
    useCreateAddressMutation();
  const [updateAddress, { isLoading: isUpdatingAddr }] =
    useUpdateAddressMutation();
  const [deleteAddress] = useDeleteAddressMutation();
  const [createContact, { isLoading: isCreatingContact }] =
    useCreateCustomerContactMutation();
  const [updateContact, { isLoading: isUpdatingContact }] =
    useUpdateCustomerContactMutation();
  const [deleteContact] = useDeleteCustomerContactMutation();

  // ─── Contact state ────────────────────────────────────────────────
  const [contactOpen, setContactOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [contactForm] = Form.useForm();

  const [addrOpen, setAddrOpen] = useState(false);
  const [editingAddr, setEditingAddr] = useState<Address | null>(null);
  const [addrTab, setAddrTab] = useState<AddressTab>("SHIPPING");
  const [sameAsShipping, setSameAsShipping] = useState(false);
  const [shippingForm] = Form.useForm<AddressFormValues>();
  const [billingForm] = Form.useForm<AddressFormValues>();

  const [addrFilter, setAddrFilter] = useState<"BILLING" | "SHIPPING">(
    "SHIPPING",
  );

  const contacts = (customer?.contacts ?? []) as Contact[];
  const isSingleContact = contacts.length === 1;
  const isFirstContact = contacts.length === 0;
  const lockBillingDefault =
    isFirstContact ||
    Boolean(
      editingContact?.isPrimaryBillingContact &&
      !contacts.some(
        (contact) =>
          contact.id !== editingContact.id && contact.isPrimaryBillingContact,
      ),
    );
  const lockShippingDefault =
    isFirstContact ||
    Boolean(
      editingContact?.isPrimaryShippingContact &&
      !contacts.some(
        (contact) =>
          contact.id !== editingContact.id && contact.isPrimaryShippingContact,
      ),
    );

  const contactColumns = [
    {
      title: "Name",
      key: "name",
      width: 180,
      render: (_: unknown, c: Contact) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-800">
            {c.firstName} {c.lastName ?? ""}
          </span>
          {c.company && (
            <span className="text-xs text-gray-400">{c.company}</span>
          )}
        </div>
      ),
    },
    { title: "Email", dataIndex: "email", key: "email" },
    {
      title: "Phone",
      key: "primaryContact",
      render: (_: unknown, c: Contact) => (
        <div className="flex items-center gap-2">
          <span>{c.primaryContact}</span>
          {c.isPrimaryBillingContact && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              Billing
            </span>
          )}
          {c.isPrimaryShippingContact && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-600">
              Shipping
            </span>
          )}
        </div>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_: unknown, c: Contact) => (
        <div className="flex gap-1">
          <Button
            variant="icon-button-1"
            onClick={() => {
              setEditingContact(c);
              setContactOpen(true);
            }}
          >
            <EditOutlined />
          </Button>
          <Button
            variant="icon-button-2"
            onClick={() => handleContactDelete(c.id)}
            className="bg-red-50! border! border-red-200! w-8! h-7!"
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  const handleContactAfterOpenChange = (open: boolean) => {
    if (!open) {
      contactForm.resetFields();
      setEditingContact(null);
      return;
    }
    if (editingContact) {
      contactForm.setFieldsValue({
        firstName: editingContact.firstName,
        lastName: editingContact.lastName,
        email: editingContact.email,
        primaryContact: editingContact.primaryContact,
        company: editingContact.company,
        isPrimaryBillingContact: isSingleContact
          ? true
          : editingContact.isPrimaryBillingContact,
        isPrimaryShippingContact: isSingleContact
          ? true
          : editingContact.isPrimaryShippingContact,
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
      const body =
        isFirstContact || isSingleContact
          ? {
              ...values,
              isPrimaryBillingContact: true,
              isPrimaryShippingContact: true,
            }
          : values;
      if (editingContact) {
        await updateContact({
          customerId: id,
          contactId: editingContact.id,
          body,
        }).unwrap();
      } else {
        await createContact({ customerId: id, body }).unwrap();
      }
      message.success("Contact saved");
      setContactOpen(false);
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(
        err?.data?.message || err?.message || "Failed to save contact",
      );
    }
  };

  const handleContactDelete = (contactId: string) => {
    confirm({
      title: "Delete Contact",
      content: "Are you sure?",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteContact({ customerId: id, contactId }).unwrap();
          message.success("Contact deleted");
        } catch {
          message.error("Failed to delete contact");
        }
      },
    });
  };

  const addresses = (customer?.addresses ?? []) as Address[];
  const isFirstAddress = addresses.length === 0;
  const isSingleAddress = addresses.length === 1;

  // Lock default if editing the only record that holds that default (can't unset last default)
  const hasOtherDefaultBilling = addresses.some(
    (a) =>
      a.id !== editingAddr?.id && (a.isDefaultBilling || a.type === "BOTH"),
  );
  const hasOtherDefaultShipping = addresses.some(
    (a) =>
      a.id !== editingAddr?.id && (a.isDefaultShipping || a.type === "BOTH"),
  );
  const lockBillingAddressDefault =
    isFirstAddress ||
    Boolean(
      editingAddr &&
      (editingAddr.isDefaultBilling || editingAddr.type === "BOTH") &&
      !hasOtherDefaultBilling,
    );
  const lockShippingAddressDefault =
    isFirstAddress ||
    Boolean(
      editingAddr &&
      (editingAddr.isDefaultShipping || editingAddr.type === "BOTH") &&
      !hasOtherDefaultShipping,
    );

  // BOTH type address appears in both BILLING and SHIPPING tabs
 const filteredAddresses = addresses.filter((a) => a.type === addrFilter);
  const addrColumns = [
    { title: 'Type', dataIndex: 'type', key: 'type', width: 200,
  render: (type: string, addr: Address) => {
    const isDefaultForFilter = addrFilter === 'BILLING' ? addr.isDefaultBilling : addr.isDefaultShipping;
    return (
      <div className="flex flex-wrap gap-1 items-center">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          type === 'BILLING' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'
        }`}>{type}</span>
        {isDefaultForFilter && (
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${
            addrFilter === 'BILLING' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
          }`}>
            <CheckOutlined />
          </span>
        )}
      </div>
    );
  } },
    { title: "Address", dataIndex: "addressLine", key: "addressLine" },
    { title: "City", dataIndex: "city", key: "city" },
    { title: "State", dataIndex: "state", key: "state" },
    { title: "Zip", dataIndex: "zipCode", key: "zipCode" },
    { title: "Country", dataIndex: "country", key: "country" },
    {
      title: "Actions",
      key: "actions",
      width: 80,
      render: (_: unknown, addr: Address) => (
        <div className="flex gap-1">
          <Button
            variant="icon-button-1"
            onClick={() => {
              setEditingAddr(addr);
              setAddrOpen(true);
            }}
          >
            <EditOutlined />
          </Button>
          <Button
            variant="icon-button-2"
            onClick={() => handleAddrDelete(addr.id)}
            className="bg-red-50! border! border-red-200! w-8! h-7!"
          >
            <DeleteOutlined />
          </Button>
        </div>
      ),
    },
  ];

  const handleAddrAfterOpenChange = (open: boolean) => {
    if (!open) {
      shippingForm.resetFields();
      billingForm.resetFields();
      setSameAsShipping(false);
      setAddrTab("SHIPPING");
      setEditingAddr(null);
      return;
    }

    if (editingAddr) {
      const baseValues = {
        addressLine: editingAddr.addressLine,
        city: editingAddr.city,
        state: editingAddr.state,
        zipCode: editingAddr.zipCode,
        country: editingAddr.country,
      };

      if (editingAddr.type === "BOTH") {
        shippingForm.setFieldsValue({
          ...baseValues,
          isDefault: lockShippingAddressDefault
            ? true
            : editingAddr.isDefaultShipping,
        });
        billingForm.setFieldsValue({
          ...baseValues,
          isDefault: lockBillingAddressDefault
            ? true
            : editingAddr.isDefaultBilling,
        });
        setSameAsShipping(true);
        setAddrTab("SHIPPING");
        return;
      }

      if (editingAddr.type === "SHIPPING") {
        shippingForm.setFieldsValue({
          ...baseValues,
          isDefault: lockShippingAddressDefault
            ? true
            : editingAddr.isDefaultShipping,
        });
        setAddrTab("SHIPPING");
      } else {
        billingForm.setFieldsValue({
          ...baseValues,
          isDefault: lockBillingAddressDefault
            ? true
            : editingAddr.isDefaultBilling,
        });
        setAddrTab("BILLING");
      }
    } else {
      // New address: auto-pre-check default if no default exists yet for that type
      const noDefaultShipping = !addresses.some(
        (a) => a.isDefaultShipping || a.type === "BOTH",
      );
      const noDefaultBilling = !addresses.some(
        (a) => a.isDefaultBilling || a.type === "BOTH",
      );
      shippingForm.setFieldsValue({
        isDefault: isFirstAddress || noDefaultShipping,
      });
      billingForm.setFieldsValue({
        isDefault: isFirstAddress || noDefaultBilling,
      });
      setAddrTab("SHIPPING");
    }
  };

  const handleAddrSave = async () => {
    try {
      const saves: Array<() => Promise<unknown>> = [];

      // Force default if no other address holds that default (excluding current editingAddr)
      const noDefaultShipping = !addresses.some(
        (a) =>
          a.id !== editingAddr?.id &&
          (a.isDefaultShipping || a.type === "BOTH"),
      );
      const noDefaultBilling = !addresses.some(
        (a) =>
          a.id !== editingAddr?.id && (a.isDefaultBilling || a.type === "BOTH"),
      );

     if (sameAsShipping) {
  const shippingValues = await shippingForm.validateFields().catch(() => null);
  if (!shippingValues?.addressLine) { message.warning('Please fill in the shipping address'); return; }

  const shippingBody = buildAddressPayload(
    { ...shippingValues, isDefault: (noDefaultShipping || lockShippingAddressDefault) ? true : shippingValues.isDefault },
    'SHIPPING',
  );
  const billingBody = buildAddressPayload(
    { ...shippingValues, isDefault: (noDefaultBilling || lockBillingAddressDefault) ? true : shippingValues.isDefault },
    'BILLING',
  );

  if (editingAddr) {
    // editingAddr was a single record — once split, we only update the one being edited
    // and create the counterpart if it doesn't exist yet
    saves.push(() => updateAddress({ customerId: id, addressId: editingAddr.id, body: editingAddr.type === 'BILLING' ? billingBody : shippingBody }).unwrap());
  } else {
    saves.push(() => createAddress({ customerId: id, body: shippingBody }).unwrap());
    saves.push(() => createAddress({ customerId: id, body: billingBody }).unwrap());
  }
} else {
        // Separate shipping
        const shippingValues = await shippingForm
          .validateFields()
          .catch(() => null);
        if (shippingValues?.addressLine) {
          const body = buildAddressPayload(
            {
              ...shippingValues,
              isDefault:
                noDefaultShipping || lockShippingAddressDefault
                  ? true
                  : shippingValues.isDefault,
            },
            "SHIPPING",
          );
          if (
            editingAddr &&
            (editingAddr.type === "SHIPPING" || editingAddr.type === "BOTH")
          ) {
            saves.push(() =>
              updateAddress({
                customerId: id,
                addressId: editingAddr.id,
                body,
              }).unwrap(),
            );
          } else if (!editingAddr || editingAddr.type === "BILLING") {
            saves.push(() => createAddress({ customerId: id, body }).unwrap());
          }
        }

        // Separate billing
        const billingValues = await billingForm
          .validateFields()
          .catch(() => null);
        if (billingValues?.addressLine) {
          const body = buildAddressPayload(
            {
              ...billingValues,
              isDefault:
                noDefaultBilling || lockBillingAddressDefault
                  ? true
                  : billingValues.isDefault,
            },
            "BILLING",
          );
          if (editingAddr && editingAddr.type === "BILLING") {
            saves.push(() =>
              updateAddress({
                customerId: id,
                addressId: editingAddr.id,
                body,
              }).unwrap(),
            );
          } else if (
            !editingAddr ||
            editingAddr.type === "SHIPPING" ||
            editingAddr.type === "BOTH"
          ) {
            saves.push(() => createAddress({ customerId: id, body }).unwrap());
          }
        }
      }

      if (!saves.length) {
        message.warning("No address data to save");
        return;
      }
      for (const save of saves) await save();
      message.success("Address saved");
      setAddrOpen(false);
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(
        err?.data?.message || err?.message || "Failed to save address",
      );
    }
  };

  const handleAddrDelete = (addressId: string) => {
    confirm({
      title: "Delete Address",
      content: "Are you sure?",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await deleteAddress({ customerId: id, addressId }).unwrap();
          message.success("Address deleted");
        } catch {
          message.error("Failed to delete address");
        }
      },
    });
  };

  if (isLoading) return <div className="p-6 text-gray-400">Loading...</div>;
  if (!customer)
    return <div className="p-6 text-gray-400">Customer not found.</div>;

  const initials =
    customer.name
      ?.split(" ")
      .map((w: string) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";
  const primaryBilling = contacts.find((c) => c.isPrimaryBillingContact);
  const primaryShipping = contacts.find((c) => c.isPrimaryShippingContact);
  // BOTH type address counts as default for both shipping and billing
 const defaultShipping = addresses.find((a) => a.isDefaultShipping);
const defaultBilling = addresses.find((a) => a.isDefaultBilling);

  return (
    <div className="px-4 pb-6 pt-0 -ml-[92px] md:ml-0">
      {/* Profile Info Cards — 2x2 grid: row1=(Avatar, ContactInfo), row2=(Overview, AddressInfo) */}
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4 mb-6 mx-1">
        {/* Row 1, Col 1 — Avatar */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="h-20 bg-linear-to-r from-indigo-500 to-violet-500" />
          <div className="flex flex-col items-center -mt-8 pb-4 px-4">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-xl font-bold border-4 border-white">
              {initials}
            </div>
            <h2 className="mt-2 text-base font-bold text-gray-900">
              {customer.name || "—"}
            </h2>
          </div>
        </div>

        {/* Row 1, Col 2 — Contact Information */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-800">
            Contact Information
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Personal and contact details
          </p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                👤
              </div>
              <div>
                <p className="text-xs text-gray-400">FULL NAME</p>
                <p className="text-sm font-medium text-gray-800">
                  {customer.name || "—"}
                </p>
              </div>
            </div>
            {primaryBilling && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                  📋
                </div>
                <div>
                  <p className="text-xs text-gray-400">
                    PRIMARY BILLING CONTACT
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {primaryBilling.firstName} {primaryBilling.lastName ?? ""}
                  </p>
                  <p className="text-xs text-gray-400">
                    {primaryBilling.primaryContact}
                  </p>
                </div>
              </div>
            )}
            {primaryShipping && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                  🚚
                </div>
                <div>
                  <p className="text-xs text-gray-400">
                    PRIMARY SHIPPING CONTACT
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {primaryShipping.firstName} {primaryShipping.lastName ?? ""}
                  </p>
                  <p className="text-xs text-gray-400">
                    {primaryShipping.primaryContact}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Row 2, Col 1 — Overview */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-400 tracking-widest mb-3">
            OVERVIEW
          </p>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-blue-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-blue-600">
                {contacts.length}
              </p>
              <p className="text-xs text-blue-400">Contacts</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 text-center">
              <p className="text-lg font-bold text-purple-600">
                {addresses.length}
              </p>
              <p className="text-xs text-purple-400">Addresses</p>
            </div>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2 mb-2">
            <p className="text-xs text-gray-400">INDUSTRY</p>
            <p className="text-sm font-medium text-gray-700">
              {customer.industry || "—"}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg px-3 py-2">
            <p className="text-xs text-gray-400">CUSTOMER ID</p>
            <p className="text-xs font-mono text-gray-500 truncate">
              {customer.id}
            </p>
          </div>
        </div>

        {/* Row 2, Col 2 — Address Information */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
          <p className="text-sm font-semibold text-gray-800">
            Address Information
          </p>
          <p className="text-xs text-gray-400 mb-4">
            Default billing and shipping addresses
          </p>
          <div className="flex flex-col gap-3">
            {defaultShipping ? (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center text-green-500 shrink-0">
                  📦
                </div>
                <div>
                  <p className="text-xs text-gray-400">
                    DEFAULT SHIPPING ADDRESS
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {defaultShipping.addressLine}
                  </p>
                  <p className="text-xs text-gray-500">
                    {[
                      defaultShipping.city,
                      defaultShipping.state,
                      defaultShipping.zipCode,
                      defaultShipping.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                No default shipping address set
              </p>
            )}
            {defaultBilling ? (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
                  💳
                </div>
                <div>
                  <p className="text-xs text-gray-400">
                    DEFAULT BILLING ADDRESS
                  </p>
                  <p className="text-sm font-medium text-gray-800">
                    {defaultBilling.addressLine}
                  </p>
                  <p className="text-xs text-gray-500">
                    {[
                      defaultBilling.city,
                      defaultBilling.state,
                      defaultBilling.zipCode,
                      defaultBilling.country,
                    ]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                No default billing address set
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 mx-1">
        <span className="text-base font-semibold text-gray-800">Addresses</span>
        <div className="flex items-center gap-2">
          <Select
            value={addrFilter}
            onChange={(v) => setAddrFilter(v as "BILLING" | "SHIPPING")}
            options={[
              { label: "Billing", value: "BILLING" },
              { label: "Shipping", value: "SHIPPING" },
            ]}
            style={{ width: 110 }}
          />
          <Button
            type="primary"
            onClick={() => {
              setEditingAddr(null);
              setAddrOpen(true);
            }}
          >
            + Add Address
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto mx-1">
        <Table
          dataSource={filteredAddresses}
          columns={addrColumns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: "No addresses yet" }}
        />
      </div>

      {/* Contacts Section */}
      <div className="flex items-center justify-between mb-3 mt-6 mx-1">
        <span className="text-base font-semibold text-gray-800">Contacts</span>
        <Button
          type="primary"
          onClick={() => {
            setEditingContact(null);
            setContactOpen(true);
          }}
        >
          + Add Contact
        </Button>
      </div>

      <div className="overflow-x-auto mx-1">
        <Table
          dataSource={contacts}
          columns={contactColumns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: "No contacts yet" }}
        />
      </div>

      <Modal
        title={editingContact ? "Edit Contact" : "Add Contact"}
        open={contactOpen}
        onCancel={() => setContactOpen(false)}
        afterOpenChange={handleContactAfterOpenChange}
        width="min(480px, 95vw)"
        styles={{
          container: { padding: "16px 0 0" },
          header: {
            padding: "0 16px 12px",
            marginBottom: 0,
            borderBottom: "1px solid #f1f5f9",
          },
          body: { padding: "16px", backgroundColor: "#ffffff" },
          footer: {
            padding: "12px 16px 16px",
            borderTop: "1px solid #f1f5f9",
            backgroundColor: "#ffffff",
            borderRadius: "0 0 8px 8px",
          },
        }}
        forceRender
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setContactOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              loading={isCreatingContact || isUpdatingContact}
              onClick={handleContactSave}
            >
              Save
            </Button>
          </div>
        }
      >
        <Form form={contactForm} layout="vertical">
          <div className="grid grid-cols-2 gap-x-3">
            <Form.Item
              name="firstName"
              label="First Name"
              rules={[{ required: true, min: 2 }]}
            >
              <Input placeholder="First name" />
            </Form.Item>
            <Form.Item name="lastName" label="Last Name">
              <Input placeholder="Last name" />
            </Form.Item>
          </div>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: "email" }]}
          >
            <Input placeholder="email@example.com" />
          </Form.Item>
          <Form.Item
            name="primaryContact"
            label="Phone"
            rules={[{ required: true, min: 10, max: 15 }]}
          >
            <Input placeholder="Phone number" />
          </Form.Item>
          <Form.Item name="company" label="Company">
            <Input placeholder="Company" />
          </Form.Item>
          <div className="flex gap-4">
            <Form.Item name="isPrimaryBillingContact" valuePropName="checked">
              <Checkbox disabled={lockBillingDefault}>
                Primary Billing Contact
              </Checkbox>
            </Form.Item>
            <Form.Item name="isPrimaryShippingContact" valuePropName="checked">
              <Checkbox disabled={lockShippingDefault}>
                Primary Shipping Contact
              </Checkbox>
            </Form.Item>
          </div>
        </Form>
      </Modal>

      <Modal
        title={editingAddr ? "Edit Address" : "Add Address"}
        open={addrOpen}
        onCancel={() => setAddrOpen(false)}
        afterOpenChange={handleAddrAfterOpenChange}
        width="min(540px, 95vw)"
        styles={{
          container: { padding: "16px 0 0" },
          header: {
            padding: "0 16px 12px",
            marginBottom: 0,
            borderBottom: "1px solid #f1f5f9",
          },
          body: { padding: "0 16px", backgroundColor: "#ffffff" },
          footer: {
            padding: "12px 16px 16px",
            borderTop: "1px solid #f1f5f9",
            backgroundColor: "#ffffff",
            borderRadius: "0 0 8px 8px",
          },
        }}
        forceRender
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setAddrOpen(false)}>Cancel</Button>
            <Button
              type="primary"
              loading={isCreatingAddr || isUpdatingAddr}
              onClick={handleAddrSave}
            >
              Save
            </Button>
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
