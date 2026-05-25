"use client";
import Button from "@/components/common/Button";
import Input from "../common/Input";
import { LockOutlined } from "@/components/common/antd/icons";
import Link from "next/link";
import Image from "next/image";
import Form  from "../common/Form";

const signupForm = () => {
  const handleSubmit = (values: any) => {
    console.log('signup values:', values);
  };

  return (
    <div className="flex h-full w-full flex-col gap-4 text-slate-900 lg:min-h-[calc(100dvh-6rem)] lg:justify-center lg:gap-6 lg:py-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <LockOutlined  className="text-violet-600" />
        <div>
          <h1 className="text-2xl font-bold">Create an account</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign up with Google, Microsoft, or your email to get started quickly.
          </p>
        </div>
      </div>

      <div className="flex-col gap-3 sm:grid-cols-2 ">
        <Button
          variant="auth"
          className="w-full justify-center"
          icon={<img src="/googlelogo.svg" alt="Google" className="min-w-[18]" width={18} height={18} />}
        >
          Continue with Google
        </Button>
        <Button
          variant="auth"
          className="w-full justify-center "
          icon={<img src="/mslogo.svg" alt="Google" className="min-w-[18]" width={18} height={18} />}
        >
          Continue with Microsoft
        </Button>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="h-px flex-1 bg-slate-200" />
        <span>Or continue with email</span>
        <span className="h-px flex-1 bg-slate-200" />
      </div>
      Divider

      <Form  className="space-y-3" onFinish={handleSubmit} layout="vertical" autoComplete="off">
        <Form.Item  label="Email Address" name="email"
          rules={[
            { required: true, message: 'Please enter your email' },
            { type: 'email', message: 'Please enter a valid email' },
          ]}
        >
          <Input type="email" placeholder="Enter email address" />
        </Form.Item>
        <Form.Item  label="Full Name" name="fullName"
          rules={[{ required: true, message: 'Please enter your full name' }]}
        >
          <Input placeholder="Enter your full name" />
        </Form.Item>
        <Form.Item  label="Password" name="password"
          rules={[{ required: true, message: 'Please enter your password' }]}
        >
          <Input.Password placeholder="Enter your password" />
        </Form.Item>

        <Button variant="signin" className="w-full" htmlType="submit">
          Sign Up
        </Button>
      </Form>

      <div className="text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link className="font-semibold text-violet-600 underline" href="/login">
          Login
        </Link>
      </div>

      <div className="flex items-center justify-center gap-4 text-slate-400">
        <Image src="/googlelogo.svg" alt="google" width={20} height={20} style={{ height: 'auto' }} />
        <Image src="/mslogo.svg" alt="microsoft" width={20} height={20} style={{ height: 'auto' }} />
        <Image src="/githublogo.svg" alt="github" width={20} height={20} style={{ height: 'auto' }} />
      </div>
    </div>
  );
};

export default signupForm;
