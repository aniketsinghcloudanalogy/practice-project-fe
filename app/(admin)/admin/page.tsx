"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { LuSearch } from "react-icons/lu";
import type { ColumnsType } from "antd/es/table";
import Table from "@/components/common/Table";
import Input from "@/components/common/Input";
import Tag from "@/components/common/Tag";
import Switch from "@/components/common/Switch";
import Tooltip from "@/components/common/Tooltip";
import { getUsers, toggleUserActive, type UserRow } from "@/lib/api/auth.api";

const roleColors: Record<string, string> = {
  USER: "blue",
  ADMIN: "purple",
  SUPER_ADMIN: "gold",
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const accessToken = session?.accessToken ?? undefined;
  const currentUserId = session?.user?.id;
  const currentRole = session?.user?.role;

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toggling, setToggling] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (status === "loading") return;

    const timerId = window.setTimeout(() => {
      if (!accessToken) {
        setLoading(false);
        setError("No access token found. Please log in.");
        return;
      }
      setLoading(true);
      setError(null);
      getUsers(accessToken)
        .then((data) => setUsers(data))
        .catch((error: unknown) => {
          setError(error instanceof Error ? error.message : "Failed to fetch users");
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timerId);
  }, [accessToken, status]);

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
      width: 140,
      ellipsis: true,
      render: (v) => v ?? <span className="text-slate-400 italic">—</span>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      width: 200,
      ellipsis: true,
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      width: 120,
      filters: [
        { text: "User", value: "USER" },
        { text: "Admin", value: "ADMIN" },
        { text: "Super Admin", value: "SUPER_ADMIN" },
      ],
      onFilter: (value, record) => record.role === value,
      render: (role) => (
        <Tag variant="status" color={roleColors[role] ?? "default"}>
          {role}
        </Tag>
      ),
    },
    {
      title: "Active",
      dataIndex: "isActive",
      key: "isActive",
      width: 100,
      filters: [
        { text: "Active", value: true },
        { text: "Inactive", value: false },
      ],
      onFilter: (value, record) => record.isActive === value,
      render: (isActive) => (
        <Tag variant="status" color={isActive ? "success" : "error"}>
          {isActive ? "Active" : "Inactive"}
        </Tag>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 110,
      responsive: ["sm"],
      render: (v) => new Date(v).toLocaleDateString(),
      sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    },
    {
      title: "Edit",
      key: "action",
      width: 80,
      fixed: "right",
      render: (_, record) => {
        const isSelf = record.id === currentUserId;
        const isAdminTarget = record.role === "ADMIN" || record.role === "SUPER_ADMIN";
        const canToggle = !isSelf && (!isAdminTarget || currentRole === "SUPER_ADMIN");
        const tooltipMsg = isSelf
          ? "Cannot deactivate yourself"
          : isAdminTarget && currentRole !== "SUPER_ADMIN"
          ? "Only Super Admin can manage admin accounts"
          : record.isActive
          ? "Deactivate"
          : "Activate";
        return (
          <Tooltip title={tooltipMsg}>
            <Switch
              checked={record.isActive}
              loading={toggling === record.id}
              disabled={!canToggle}
              onChange={(checked) => handleToggle(record, checked)}
              checkedChildren="ON"
              unCheckedChildren="OFF"
            />
          </Tooltip>
        );
      },
    },
  ];

  const filtered = search.trim()
    ? users.filter((u) => {
        const q = search.trim().toLowerCase();
        return (
          (u.name ?? "").toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
        );
      })
    : users;

  return (
    <section className="w-full space-y-4 px-2 sm:px-4 lg:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900 sm:text-2xl">User Management</h1>
          <p className="mt-1 text-sm text-slate-500">Activate or deactivate users from this panel.</p>
        </div>
        <Input
          appearance="soft"
          placeholder="Search by name or email…"
          allowClear
          prefix={<LuSearch size={15} className="text-slate-400" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", maxWidth: 280, height: 44, borderRadius: 8 }}
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 sm:p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="w-full overflow-x-auto rounded-xl">
        <Table<UserRow>
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true, size: "small" }}
          rowClassName={(record) => (!record.isActive ? "opacity-60" : "")}
          scroll={{ x: 600 }}
          size="middle"
        />
      </div>
    </section>
  );
}
