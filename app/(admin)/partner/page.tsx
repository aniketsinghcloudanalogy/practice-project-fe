"use client";

import { Fragment, useMemo, useState } from "react";
import { LuPencil, LuTrash2 } from "react-icons/lu";

import Drawer from "@/components/common/Drawer";
import Button from "@/components/common/Button";
import Form from "@/components/common/Form";
import Input from "@/components/common/Input";
import Modal from "@/components/common/Modal";
import Select from "@/components/common/Select";
import Table from "@/components/common/Table";
import Switch from "@/components/common/Switch";
import { PartnerRow } from "@/lib/api/auth.api";
import { partnerStats } from "./partner";
import type { ModalType, PartnerFormValues, PartnerProgramRow, ProgramFormValues } from "./types";

const childColumns = [
  { title: "ID", dataIndex: "Id", key: "Id", width: 90 },
  { title: "Partner Program Name", dataIndex: "Partner Program Name", key: "Partner Program Name", width: 220 },
  { title: "Description", dataIndex: "Description", key: "Description", width: 260 },
  {
    title: "Verification Step",
    dataIndex: "Verification Step",
    key: "Verification Step",
    width: 170,
    render: (value: boolean) => <Switch variant="compact" defaultChecked={value} />,
  },
  { title: "Template", dataIndex: "Template", key: "Template", width: 130 },
  { title: "Login Template", dataIndex: "Login Template", key: "Login Template", width: 190 },
  { title: "Login Script", dataIndex: "Login Script", key: "Login Script", width: 170 },
];

const expandedDataSource: Record<number, PartnerProgramRow[]> = {
  1: [
    {
      Id: 11,
      "Partner Program Name": "Microsoft Program",
      Description: "Partner onboarding and verification",
      "Verification Step": true,
      Template: "View",
      "Login Template": "View Login Template",
      "Login Script": "View Login Script",
    },
  ],
  2: [
    {
      Id: 12,
      "Partner Program Name": "Google Program",
      Description: "Partner onboarding and verification",
      "Verification Step": true,
      Template: "View",
      "Login Template": "View Login Template",
      "Login Script": "View Login Script",
    },
  ],
};

const initialData: PartnerRow[] = [
  {
    Id: 1,
    "External id": 1001,
    "partner Name": "Microsoft",
    "parent Partner": "Global Partners",
    "PM Id": "PM001",
    URL: "https://microsoft.com",
    Email: "partner@microsoft.com",
  },
  {
    Id: 2,
    "External id": 1002,
    "partner Name": "Google",
    "parent Partner": "Global Partners",
    "PM Id": "PM002",
    URL: "https://google.com",
    Email: "partner@google.com",
  },
];

export default function PartnerPage() {
  const [dataSource, setDataSource] = useState<PartnerRow[]>(initialData);
  const [modalType, setModalType] = useState<ModalType>(null);
  const [programVerification, setProgramVerification] = useState(true);
  const [editingPartner, setEditingPartner] = useState<PartnerRow | null>(null);
  const [form] = Form.useForm<PartnerFormValues>();

  const isPartnerModalOpen = modalType === "partner";
  const isProgramModalOpen = modalType === "program";
  const isEditDrawerOpen = modalType === "edit-partner";

  const partnerNameOptions = useMemo(
    () =>
      dataSource.map((partner) => ({
        label: partner["partner Name"] ?? "Unknown partner",
        value: partner["partner Name"] ?? "",
      })),
    [dataSource],
  );

  const closeModal = () => {
    setModalType(null);
    setEditingPartner(null);
    setProgramVerification(true);
    form.resetFields();
  };

  const handleEditClick = (record: PartnerRow) => {
    setEditingPartner(record);
    setModalType("edit-partner");
    setTimeout(() => {
      form.setFieldsValue({
        "External id": record["External id"],
        "partner Name": record["partner Name"] ?? "",
        "parent Partner": record["parent Partner"] ?? "",
        "PM Id": record["PM Id"] ?? "",
        URL: record.URL ?? "",
        Email: record.Email ?? "",
      });
    }, 0);
  };

  const handleDeleteClick = (record: PartnerRow) => {
    setDataSource((prev) => prev.filter((p) => p.Id !== record.Id));
  };

  const handlePartnerSubmit = (values: PartnerFormValues) => {
    console.log("Partner form submit", values);
    closeModal();
  };

  const handleEditPartnerSubmit = (values: PartnerFormValues) => {
    if (!editingPartner) return;
    setDataSource((prev) =>
      prev.map((p) => (p.Id === editingPartner.Id ? { ...p, ...values } : p)),
    );
    closeModal();
  };

  const handleProgramSubmit = (values: ProgramFormValues) => {
    console.log("Program form submit", values);
    closeModal();
  };

  const partnerColumns = [
    { title: "ID", dataIndex: "Id", key: "Id", width: 90 },
    {
      title: "External ID",
      dataIndex: "External id",
      key: "External id",
      width: 150,
      render: (value: number | null) => value ?? "-",
    },
    {
      title: "Partner Name",
      dataIndex: "partner Name",
      key: "partner Name",
      width: 170,
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "Parent Partner",
      dataIndex: "parent Partner",
      key: "parent Partner",
      width: 180,
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "PM ID",
      dataIndex: "PM Id",
      key: "PM Id",
      width: 150,
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "URL",
      dataIndex: "URL",
      key: "URL",
      width: 170,
      render: (value: string | null) =>
        value ? (
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
            Open
          </a>
        ) : "-",
    },
    {
      title: "Email",
      dataIndex: "Email",
      key: "Email",
      width: 210,
      render: (value: string | null) => value ?? "-",
    },
    {
      title: "Actions",
      key: "actions",
      width: 120,
      render: (_: unknown, record: PartnerRow) => (
        <div className="flex items-center gap-2">
          <Button variant="soft" aria-label="Edit partner" onClick={() => handleEditClick(record)}>
            <LuPencil size={16} />
          </Button>
          <Button variant="soft" aria-label="Delete partner" onClick={() => handleDeleteClick(record)}>
            <LuTrash2 size={16} className="text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  const columns = [Table.EXPAND_COLUMN, ...partnerColumns];

  return (
    <div className="w-full space-y-6 px-2 sm:px-4 lg:px-6">
      <section>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-slate-900">Partner Management</h1>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-6">
            {partnerStats.map((stat, i) => (
              <Fragment key={stat.label}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bg}`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="m-0 text-2xl font-semibold text-slate-900">{stat.value}</p>
                    <p className="m-0 text-sm text-slate-500">{stat.label}</p>
                  </div>
                </div>
                {i < partnerStats.length - 1 && (
                  <div className="hidden h-12 w-px bg-slate-200 lg:block" />
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-semibold text-slate-900">All Partners</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={() => setModalType("partner")}>
              Add Partner
            </Button>
            <Button variant="secondary" onClick={() => { setProgramVerification(true); setModalType("program"); }}>
              Add Partner Program
            </Button>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="w-full overflow-x-auto">
            <Table<PartnerRow>
              columns={columns}
              dataSource={dataSource}
              rowKey="Id"
              loading={false}
              pagination={{ pageSize: 5, showSizeChanger: true, size: "small" }}
              scroll={{ x: 1200 }}
              size="small"
              expandable={{
                expandIcon: ({ expanded, onExpand, record }) => (
                  <Button
                    variant="soft"
                    shape="circle"
                    htmlType="button"
                    onClick={(event) => onExpand(record, event)}
                    aria-label={expanded ? "Collapse row" : "Expand row"}
                  >
                    {expanded ? "−" : "+"}
                  </Button>
                ),
                expandedRowRender: (record) => (
                  <div className="bg-[#f8fbff] px-4 py-4 sm:px-5">
                    <Table<PartnerProgramRow>
                      variant="compact"
                      columns={childColumns}
                      dataSource={expandedDataSource[record.Id] ?? []}
                      rowKey="Id"
                      loading={false}
                      pagination={false}
                      size="small"
                      scroll={{ x: 1100 }}
                    />
                  </div>
                ),
              }}
            />
          </div>
        </div>
      </section>

      <Modal
        open={isPartnerModalOpen || isProgramModalOpen}
        onCancel={closeModal}
        title={
          <span className="text-base font-semibold text-slate-900">
            {isPartnerModalOpen ? "Add Partner" : "Add Partner Program"}
          </span>
        }
        variant="compact"
        width={isProgramModalOpen ? "min(920px, 96vw)" : "min(760px, 96vw)"}
        destroyOnHidden
        footer={null}
      >
        {isPartnerModalOpen && (
          <Form<PartnerFormValues>
            layout="vertical"
            onFinish={handlePartnerSubmit}
            initialValues={{ "External id": null, "partner Name": "", "parent Partner": "", "PM Id": "", URL: "", Email: "" }}
            className="mt-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Form.Item label="External ID" name="External id">
                <Input placeholder="Enter external id" />
              </Form.Item>
              <Form.Item label="Partner Name" name="partner Name" rules={[{ required: true, message: "Partner name is required" }]}>
                <Input placeholder="Enter partner name" />
              </Form.Item>
              <Form.Item label="Parent Partner" name="parent Partner">
                <Input placeholder="Enter parent partner" />
              </Form.Item>
              <Form.Item label="PM ID" name="PM Id">
                <Input placeholder="Enter PM ID" />
              </Form.Item>
              <Form.Item label="URL" name="URL">
                <Input placeholder="https://example.com" />
              </Form.Item>
              <Form.Item label="Email" name="Email">
                <Input placeholder="partner@example.com" />
              </Form.Item>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <Button variant="secondary" htmlType="button" onClick={closeModal}>Cancel</Button>
              <Button variant="primary" htmlType="submit">Save Partner</Button>
            </div>
          </Form>
        )}

        {isProgramModalOpen && (
          <div className="rounded-3xl bg-[#f7fbff] p-1">
            <div className="rounded-[22px] border border-[#dbe6f3] bg-white p-5 shadow-[0_12px_32px_rgba(15,23,42,0.04)] sm:p-6">
              <div className="mb-5 border-b border-slate-200 pb-4">
                <h3 className="mt-1 text-xl font-semibold text-slate-900">Program Details</h3>
              </div>
              <Form<ProgramFormValues>
                layout="vertical"
                onFinish={(values) => handleProgramSubmit({ ...values, "Verification Step": programVerification })}
                initialValues={{ "Partner Program Name": "", Description: "", Template: "", "Login Template": "", "Login Script": "" }}
                className="space-y-5"
              >
                <div className="flex flex-col gap-4 sm:grid-cols-2">
                  <Form.Item label="Partner Name" name="Partner Name" rules={[{ required: true, message: "Program name is required" }]}>
                    <Select variant="panel" placeholder="Select partner name" options={partnerNameOptions} showSearch optionFilterProp="label" />
                  </Form.Item>
                  <Form.Item label="Program Name" name="Program Name">
                    <Input appearance="soft" placeholder="Enter program name" />
                  </Form.Item>
                  <Form.Item label="Description" name="Description">
                    <Input.TextArea appearance="soft" placeholder="Enter description" rows={3} />
                  </Form.Item>
                </div>
                <div className="flex justify-end gap-3 pt-1">
                  <Button variant="secondary" htmlType="button" onClick={closeModal}>Cancel</Button>
                  <Button variant="primary" htmlType="submit">Save Program</Button>
                </div>
              </Form>
            </div>
          </div>
        )}
      </Modal>

      <Drawer
        variant="sidebar"
        title={<span className="text-base font-semibold text-slate-900">Edit Partner</span>}
        placement="right"
        size={500}
        open={isEditDrawerOpen}
        onClose={closeModal}
        destroyOnHidden
      >
        <Form<PartnerFormValues>
          form={form}
          layout="vertical"
          onFinish={handleEditPartnerSubmit}
          className="mt-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item label="External ID" name="External id">
              <Input placeholder="Enter external id" />
            </Form.Item>
            <Form.Item label="Partner Name" name="partner Name" rules={[{ required: true, message: "Partner name is required" }]}>
              <Input placeholder="Enter partner name" />
            </Form.Item>
            <Form.Item label="Parent Partner" name="parent Partner">
              <Input placeholder="Enter parent partner" />
            </Form.Item>
            <Form.Item label="PM ID" name="PM Id">
              <Input placeholder="Enter PM ID" />
            </Form.Item>
            <Form.Item label="URL" name="URL">
              <Input placeholder="https://example.com" />
            </Form.Item>
            <Form.Item label="Email" name="Email">
              <Input placeholder="partner@example.com" />
            </Form.Item>
          </div>
          <div className="mt-6 flex justify-end gap-3">
            <Button variant="secondary" htmlType="button" onClick={closeModal}>Cancel</Button>
            <Button variant="primary" htmlType="submit">Update Partner</Button>
          </div>
        </Form>
      </Drawer>
    </div>
  );
}