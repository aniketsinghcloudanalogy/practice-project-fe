"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";

import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Form from "@/components/common/Form";
import { LockOutlined } from "@/components/common/antd/icons";
import api from "@/lib/axios/axios";
import { signup } from "@/lib/api/auth.api";

type SignupValues = {
  name: string;
  email: string;
  password: string;
};

const SignupForm = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthSignIn = (provider: "google" | "azure-ad") => {
    signIn(provider, { callbackUrl: "/dashboard" });
  };

  const handleSubmit = async (values: SignupValues) => {
    setLoading(true);
    setError(null);

    try {
      const res = await signup( {
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (res.status >= 200 && res.status < 300) {
        console.log("success");
      }

      await signIn("credentials", {
        redirect: true,
        email: values.email,
        password: values.password,
        callbackUrl: "/dashboard",
      });

        
    } catch (err: any) {
      const message =
        err?.response?.data?.message || "Signup failed. Please try again.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 text-slate-900 lg:min-h-[calc(100dvh-6rem)] lg:justify-center lg:gap-6 lg:py-8">
      {/* Header */}
      <div className="flex flex-col items-center gap-2 text-center">
        <LockOutlined className="text-violet-600" />
        <div>
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign up with Google, Microsoft, or your email to get started
            quickly.
          </p>
        </div>
      </div>

      {/* OAuth buttons */}
      <div className="flex flex-col gap-3">
        <Button
          variant="auth"
          className="w-full justify-center"
          icon={
            <img src="/googlelogo.svg" alt="Google" width={18} height={18} />
          }
          onClick={() => handleOAuthSignIn("google")}
        >
          Continue with Google
        </Button>
        <Button
          variant="auth"
          className="w-full justify-center"
          icon={
            <img src="/mslogo.svg" alt="Microsoft" width={18} height={18} />
          }
          onClick={() => handleOAuthSignIn("azure-ad")}
        >
          Continue with Microsoft
        </Button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span>Or continue with email</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Error message */}
      {error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Signup form */}
      <Form
        className="space-y-3"
        onFinish={handleSubmit}
        layout="vertical"
        autoComplete="off"
      >
        <Form.Item
          label="Email Address"
          name="email"
          rules={[
            { required: true, message: "Please enter your email" },
            { type: "email", message: "Please enter a valid email" },
          ]}
        >
          <Input type="email" placeholder="Enter email address" />
        </Form.Item>

        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: "Please enter your full name" }]}
        >
          <Input placeholder="Enter your full name" />
        </Form.Item>

        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: true, message: "Please enter your password" }]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>

        <Button
          variant="signin"
          className="w-full"
          htmlType="submit"
          loading={loading}
        >
          {loading ? "Creating account..." : "Sign Up"}
        </Button>
      </Form>

      {/* Login link */}
      <div className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link className="font-semibold text-violet-600 underline" href="/login">
          Login
        </Link>
      </div>

      {/* Provider logos */}
      <div className="flex items-center justify-center gap-4 text-slate-400">
        <Image
          src="/googlelogo.svg"
          alt="google"
          width={20}
          height={20}
          style={{ height: "auto" }}
        />
        <Image
          src="/mslogo.svg"
          alt="microsoft"
          width={20}
          height={20}
          style={{ height: "auto" }}
        />
        <Image
          src="/githublogo.svg"
          alt="github"
          width={20}
          height={20}
          style={{ height: "auto" }}
        />
      </div>
    </div>
  );
};

export default SignupForm;
