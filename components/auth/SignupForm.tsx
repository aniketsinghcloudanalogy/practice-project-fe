"use client";

import { useState } from "react";
import { signIn, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

import Button from "@/components/common/Button";
import Divider from "@/components/common/Divider";
import Form from "@/components/common/Form";
import Input from "@/components/common/Input";
import Typography from "@/components/common/Typography";
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  MailOutlined,
  UserOutlined,
} from "@/components/common/antd/icons";
import { signup } from "@/lib/api/auth.api";

type SignupValues = {
  name: string;
  email: string;
  password: string;
};

const SignupForm = () => {
  const [form] = Form.useForm<SignupValues>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const handleOAuthSignIn = (provider: "google" | "azure-ad") => {
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  const handleSubmit = async (values: SignupValues) => {
    setLoading(true);
    setError(null);

    try {
      const res = await signup({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (!res) throw new Error('Signup failed.');

      // Admin accounts (maildrop.cc) are inactive by default — no session created
      if (!res.data) {
        setPending(true);
        return;
      }

      await signOut({ redirect: false });
      await signIn("credentials", {
        redirect: true,
        email: values.email,
        password: values.password,
        callbackUrl: "/dashboard",
      });
    } catch (err) {
      const message =
        err &&
        typeof err === "object" &&
        "response" in err &&
        typeof err.response === "object" &&
        err.response &&
        "data" in err.response &&
        typeof err.response.data === "object" &&
        err.response.data &&
        "message" in err.response.data &&
        typeof err.response.data.message === "string"
          ? err.response.data.message
          : "Signup failed. Please try again.";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (pending) {
    return (
      <div className="flex h-full min-h-0 w-full flex-col items-center justify-center gap-4 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#d946ef)] text-white shadow-[0_10px_24px_rgba(124,58,237,0.28)]">
          <LockOutlined className="text-base" />
        </div>
        <Typography.Title level={3} className="mb-0! font-semibold! text-slate-900!">Account Pending Activation</Typography.Title>
        <Typography.Text className="text-[13px] text-slate-500">
          Your admin account has been created and is pending activation by a Super Admin.
        </Typography.Text>
        <Link href="/login" className="text-[13px] font-semibold text-violet-600 hover:text-violet-500">Back to Login</Link>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-2 text-slate-900 lg:justify-center lg:gap-3 lg:py-4">
      <div className="space-y-1 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#7c3aed,#d946ef)] text-white shadow-[0_10px_24px_rgba(124,58,237,0.28)]">
          <LockOutlined className="text-base" />
        </div>

        <div className="space-y-1">
          <Typography.Title level={2} className="mb-0! text-[1.65rem]! font-semibold! text-slate-900! sm:text-[1.8rem]!">
            Create an account
          </Typography.Title>
          <Typography.Text className="block text-[13px] leading-5 text-slate-500 sm:text-[14px]">
            Sign up to continue to your secure workspace.
          </Typography.Text>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <Button
          variant="auth"
          className="h-10 w-full px-4 text-[13px] font-medium"
          size="large"
          onClick={() => handleOAuthSignIn("google")}
        >
          <span className="inline-flex items-center justify-center gap-3">
            <Image src="/googlelogo.svg" alt="Google" width={18} height={18} priority />
            <span>Continue with Google</span>
          </span>
        </Button>
        <Button
          variant="auth"
          className="h-10 w-full px-4 text-[13px] font-medium"
          size="large"
          onClick={() => handleOAuthSignIn("azure-ad")}
        >
          <span className="inline-flex items-center justify-center gap-3">
            <Image src="/mslogo.svg" alt="Microsoft" width={18} height={18} priority />
            <span>Continue with Microsoft</span>
          </span>
        </Button>
      </div>

      <Divider className="font-normal! text-slate-500">OR</Divider>

      <div className="flex flex-col gap-4 lg:gap-6">
        <Form<SignupValues>
          form={form}
          className="w-full"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
          autoComplete="on"
        >
          <div className="space-y-2">
            <Form.Item
              label={<span className="text-[13px] font-medium text-slate-700">Email address</span>}
              name="email"
              rules={[
                { required: true, message: "Please enter your email address." },
                { type: "email", message: "Enter a valid email address." },
              ]}
              validateTrigger="onBlur"
              className="mb-0!"
            >
              <Input
                type="email"
                appearance="soft"
                prefix={<MailOutlined className="text-slate-400" />}
                placeholder="Enter your email address"
                size="large"
                autoComplete="email"
                className="h-10 rounded-xl px-4 text-[13px] transition-all duration-300"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-[13px] font-medium text-slate-700">Name</span>}
              name="name"
              rules={[{ required: true, message: "Please enter your full name." }]}
              validateTrigger="onBlur"
              className="mb-0!"
            >
              <Input
                appearance="soft"
                prefix={<UserOutlined className="text-slate-400" />}
                placeholder="Enter your full name"
                size="large"
                autoComplete="name"
                className="h-10 rounded-xl px-4 text-[13px] transition-all duration-300"
              />
            </Form.Item>

            <Form.Item
              label={<span className="text-[13px] font-medium text-slate-700">Password</span>}
              name="password"
              rules={[
                { required: true, message: "Please enter your password." },
                { min: 8, message: "Password must be at least 8 characters long." },
              ]}
              validateTrigger="onBlur"
              className="mb-0!"
              help={error ? error : undefined}
              validateStatus={error ? "error" : undefined}
            >
              <Input.Password
                appearance="soft"
                prefix={<LockOutlined className="text-slate-400" />}
                placeholder="Enter your password"
                size="large"
                autoComplete="new-password"
                iconRender={(visible) =>
                  visible ? (
                    <EyeOutlined className="text-slate-400" />
                  ) : (
                    <EyeInvisibleOutlined className="text-slate-400" />
                  )
                }
                className="h-10 rounded-xl px-4 text-[13px] transition-all duration-300"
              />
            </Form.Item>

            <Button
              variant="signin"
              type="primary"
              className="mt-3 h-10 w-full text-[13px] font-semibold transition-all duration-300 hover:-translate-y-0.5"
              htmlType="submit"
              loading={loading}
              disabled={loading}
            >
              {loading ? "Creating account..." : "Sign up"}
            </Button>
          </div>
        </Form>

        <div className="text-center">
          <Typography.Text className="text-[13px] text-slate-500">
            Already have an account?{" "}
            <Link className="font-semibold text-violet-600 transition-colors hover:text-violet-500" href="/login">
              Login
            </Link>
          </Typography.Text>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
