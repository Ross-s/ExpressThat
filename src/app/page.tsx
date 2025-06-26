"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import MyAccount from "@/components/user/my-account";

export default function Home() {
  const authData = authClient.useSession();
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 flex items-center justify-center p-4">
      <div className="card w-full max-w-lg bg-base-100 shadow-2xl">
        <div className="card-body text-center">
          <h1 className="text-4xl font-bold text-base-content mb-4">
            Welcome to ExpressThat
          </h1>
          <p className="text-base-content/70 mb-8">
            A modern authentication experience with beautiful design
          </p>
          <div className="space-y-4">
            {authData?.data?.user ? (
              <>
                <button
                  onClick={() => setShowAccountSettings(true)}
                  className="btn btn-primary w-full"
                >
                  Account Settings
                </button>

                <button
                  className="btn btn-outline w-full"
                  onClick={async () => {
                    await authClient.signOut();
                  }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/sign-up" className="btn btn-primary w-full">
                  Get Started
                </Link>

                <Link href="/sign-up" className="btn btn-outline w-full">
                  View Auth Page
                </Link>
              </>
            )}
          </div>

          <div className="mt-8 text-sm text-base-content/60">
            <p>Features:</p>
            <ul className="list-none space-y-1 mt-2">
              <li>✨ Modern DaisyUI design</li>
              <li>🔐 Password & Magic Link auth</li>
              <li>🌐 Social login buttons</li>
              <li>📱 Responsive interface</li>
            </ul>
            <p> User Data</p>
            <ul className="list-none space-y-1 mt-2">
              <li>👤 Name: {authData?.data?.user.name}</li>
              <li>📧 Email: {authData?.data?.user.email}</li>
              <li>🔑 ID: {authData?.data?.user.id}</li>{" "}
            </ul>
          </div>
        </div>
      </div>

      {/* Account Settings Dialog */}
      <MyAccount
        isOpen={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />
    </div>
  );
}
