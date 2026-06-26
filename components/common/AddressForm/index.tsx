'use client';

import React from 'react';
import type { FormInstance } from 'antd';
import Form from '@/components/common/Form';
import Input from '@/components/common/Input';
import Checkbox from '@/components/common/Checkbox';
import type { AddressPayload, AddressType } from '@/store/services/types';

export type AddressFormValues = {
  addressLine: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
};

export type AddressTab = 'SHIPPING' | 'BILLING';

type ActiveTab = 'SHIPPING' | 'BILLING' | 'CONTACT';

interface AddressTabsProps {
  shippingForm: FormInstance<AddressFormValues>;
  billingForm: FormInstance<AddressFormValues>;
  contactForm?: FormInstance<any>;
  activeTab: AddressTab;
  onTabChange: (tab: AddressTab) => void;
  sameAsShipping: boolean;
  onSameAsShippingChange: (val: boolean) => void;
}

const AddressFields = ({ defaultLabel, disabled, hideDefault }: { defaultLabel: string; disabled?: boolean; hideDefault?: boolean }) => (
  <>
    <Form.Item label="Address Line" name="addressLine" rules={disabled ? [] : [{ required: true, message: 'Address line is required' }]}>
      <Input placeholder="Enter here" disabled={disabled} />
    </Form.Item>
    <div className="grid grid-cols-2 gap-x-4">
      <Form.Item label="City" name="city" rules={disabled ? [] : [{ required: true, message: 'City is required' }]}>
        <Input placeholder="Enter here" disabled={disabled} />
      </Form.Item>
      <Form.Item label="State" name="state" rules={disabled ? [] : [{ required: true, message: 'State is required' }]}>
        <Input placeholder="Enter here" disabled={disabled} />
      </Form.Item>
    </div>
    <div className="grid grid-cols-2 gap-x-4">
      <Form.Item label="Zip Code" name="zipCode" rules={disabled ? [] : [{ required: true, message: 'Zip code is required' }]}>
        <Input placeholder="Enter here" disabled={disabled} />
      </Form.Item>
      <Form.Item label="Country" name="country" rules={disabled ? [] : [{ required: true, message: 'Country is required' }]}>
        <Input placeholder="Enter here" disabled={disabled} />
      </Form.Item>
    </div>
    {!hideDefault && (
      <Form.Item name="isDefault" valuePropName="checked">
        <Checkbox disabled={disabled}>{defaultLabel}</Checkbox>
      </Form.Item>
    )}
  </>
);

const AddressTabs = ({
  shippingForm,
  billingForm,
  contactForm,
  activeTab,
  onTabChange,
  sameAsShipping,
  onSameAsShippingChange,
}: AddressTabsProps) => {
  const [activeTabState, setActiveTabState] = React.useState<ActiveTab>(activeTab);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTabState(tab);
    if (tab === 'SHIPPING' || tab === 'BILLING') onTabChange(tab);
  };

  const handleSameAsShipping = (checked: boolean) => {
    if (checked) {
      billingForm.setFieldsValue(shippingForm.getFieldsValue());
    } else {
      billingForm.resetFields();
    }
    onSameAsShippingChange(checked);
  };

  return (
    <div>
      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200 mb-4">
        {(['SHIPPING', 'BILLING', ...(contactForm ? ['CONTACT'] : [])] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => handleTabChange(tab)}
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTabState === tab
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab === 'SHIPPING' ? 'Shipping Address' : tab === 'BILLING' ? 'Billing Address' : 'Contact'}
          </button>
        ))}
      </div>

      {/* Shipping tab */}
      <div className={activeTabState === 'SHIPPING' ? 'block' : 'hidden'}>
        <Form form={shippingForm} layout="vertical">
          <AddressFields defaultLabel="Should this be your default shipping address?" />
        </Form>
      </div>

      {/* Billing tab */}
      <div className={activeTabState === 'BILLING' ? 'block' : 'hidden'}>
        <div className="mb-4">
          <Checkbox checked={sameAsShipping} onChange={(e) => handleSameAsShipping(e.target.checked)}>
            Same as Shipping Address
          </Checkbox>
        </div>
        <Form form={billingForm} layout="vertical">
          <AddressFields defaultLabel="Should this be your default billing address?" disabled={sameAsShipping} hideDefault={sameAsShipping} />
        </Form>
      </div>

      {/* Contact tab */}
      {contactForm && (
        <div className={activeTabState === 'CONTACT' ? 'block' : 'hidden'}>
          <Form form={contactForm} layout="vertical">
            <div className="grid grid-cols-2 gap-x-4">
              <Form.Item label="First Name" name="firstName" rules={[{ required: true, message: 'First name is required' }]}>
                <Input placeholder="First Name" />
              </Form.Item>
              <Form.Item label="Last Name" name="lastName">
                <Input placeholder="Last Name" />
              </Form.Item>
            </div>
            <div className="grid grid-cols-2 gap-x-4">
              <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Email is required' }, { type: 'email', message: 'Invalid email' }]}>
                <Input placeholder="Enter Email" />
              </Form.Item>
              <Form.Item label="Phone" name="primaryContact" rules={[{ required: true, message: 'Phone is required' }]}>
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </div>
            <Form.Item label="Secondary Phone" name="secondaryContact">
              <Input placeholder="Enter secondary phone" />
            </Form.Item>
            <div className="grid grid-cols-2 gap-x-4">
              <Form.Item name="primaryBillingContact" valuePropName="checked">
                <Checkbox>Primary Billing Contact</Checkbox>
              </Form.Item>
              <Form.Item name="primaryShippingContact" valuePropName="checked">
                <Checkbox>Primary Shipping Contact</Checkbox>
              </Form.Item>
            </div>
          </Form>
        </div>
      )}
    </div>
  );
};

export default AddressTabs;

export const buildAddressPayload = (
  values: AddressFormValues,
  type: AddressType,
): AddressPayload => ({
  addressLine: values.addressLine as string,
  city: values.city as string,
  state: values.state as string,
  zipCode: values.zipCode as string,
  country: values.country as string,
  type,
  isDefaultShipping: type === 'SHIPPING' ? !!(values.isDefault) : undefined,
  isDefaultBilling: type === 'BILLING' ? !!(values.isDefault) : undefined,
});
