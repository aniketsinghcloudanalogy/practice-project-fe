"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Tag, Switch, Tooltip } from "antd";
import type { ColumnsType } from "antd/es/table";
import Table from "@/components/common/Table";
import { getUsers, toggleUserActive, type UserRow } from "@/lib/api/auth.api";

const roleColors: Record<string, string> = {
  USER: "blue",
  ADMIN: "purple",
  SUPER_ADMIN: "gold",
};

export default function AdminPage() {
  const { data: session } = useSession();
  const accessToken = (session as any)?.accessToken as string | undefined;
  const currentUserId = session?.user?.id;

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<string | null>(null);

  useEffect(() => {
    if (!accessToken) return;
    getUsers(accessToken)
      .then(setUsers)
      .finally(() => setLoading(false));
  }, [accessToken]);

  const handleToggle = async (user: UserRow, checked: boolean) => {
    if (!accessToken) return;
    setToggling(user.id);
    try {
      const updated = await toggleUserActive(user.id, checked, accessToken);
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
    } finally {
      setToggling(null);
    }
  };

  const columns: ColumnsType<UserRow> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (v) => v ?? <span className="text-slate-400 italic">—</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      filters: [
        { text: "User", value: "USER" },
        { text: "Admin", value: "ADMIN" },
        { text: "Super Admin", value: "SUPER_ADMIN" },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => <Tag color={roleColors[role] ?? "default"}>{role}</Tag>,
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive, record) => (
        <Tag color={isActive ? "success" : "error"}>{isActive ? "Active" : "Inactive"}</Tag>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (v) => new Date(v).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Edit",
      key: "action",
      render: (_, record) => {
        const isSelf = record.id === currentUserId;
        return (
          <Tooltip title={isSelf ? "Cannot deactivate yourself" : record.isActive ? "Deactivate" : "Activate"}>
            <Switch
              checked={record.isActive}
              loading={toggling === record.id}
              disabled={isSelf}
              onChange={(checked) => handleToggle(record, checked)}
              checkedChildren="ON"
              unCheckedChildren="OFF"
            />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <section>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-slate-900">User Management</h1>
        <p className="mt-1 text-sm text-slate-500">Activate or deactivate users from this panel.</p>
      </div>

      <Table<UserRow>
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10, showSizeChanger: true }}
        rowClassName={(record) => (!record.isActive ? "opacity-60" : "")}
      />
    </section>
  );
}
