"use client";

import { SignIn } from "@clerk/nextjs";
import { useState } from "react";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
            card: "shadow-2xl",
          },
        }}
      />
    </div>
  );
}