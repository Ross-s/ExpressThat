"use client";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import MyAccount from "@/components/user/my-account";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const authData = authClient.useSession();
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-gray-50 to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-2xl">
        <CardContent className="text-center p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to ExpressThat
          </h1>
          <p className="text-gray-600 mb-8">
            A modern authentication experience with beautiful design
          </p>
          <div className="space-y-4">
            {authData?.data?.user ? (
              <>
                <Button
                  onClick={() => setShowAccountSettings(true)}
                  className="w-full"
                >
                  Account Settings
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={async () => {
                    await authClient.signOut();
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button asChild className="w-full">
                  <Link href="/sign-up">Get Started</Link>
                </Button>

                <Button asChild variant="outline" className="w-full">
                  <Link href="/sign-up">View Auth Page</Link>
                </Button>
              </>
            )}
          </div>

          <div className="mt-8 text-sm text-gray-500">
            <p>Features:</p>
            <ul className="list-none space-y-1 mt-2">
              <li>✨ Modern shadcn/ui design</li>
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
        </CardContent>
      </Card>

      {/* Account Settings Dialog */}
      <MyAccount
        isOpen={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />
    </div>
  );
}
