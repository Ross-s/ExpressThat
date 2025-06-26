"use client";

import { useState, useEffect } from "react";
import {
  UserIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import ProfileTab from "./ProfileTab";
import SecurityTab from "./SecurityTab";
import BillingTab from "./BillingTab";
import DangerTab from "./DangerTab";

interface MyAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MyAccount({ isOpen, onClose }: MyAccountProps) {
  const [activeTab, setActiveTab] = useState<
    "profile" | "security" | "billing" | "danger"
  >("profile");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [session, setSession] = useState<{
    user?: {
      id: string;
      email: string;
      name?: string;
      twoFactorEnabled?: boolean | null;
    };
  } | null>(null);

  // Get user session on component mount
  useEffect(() => {
    const getUser = async () => {
      const session = await authClient.getSession();
      setSession(session.data || null);
    };

    if (isOpen) {
      getUser();
    }
  }, [isOpen]);

  const handleTabChange = (
    tab: "profile" | "security" | "billing" | "danger",
  ) => {
    setActiveTab(tab);
    setError(null);
    setSuccess(null);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setSuccess(null);
  };

  const handleSuccess = (successMessage: string) => {
    setSuccess(successMessage);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-2xl font-bold">
            Account Settings
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="px-6">
          <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
            <Button
              variant={activeTab === "profile" ? "default" : "ghost"}
              className={`flex-1 py-2 px-4 text-sm ${
                activeTab === "profile"
                  ? "shadow-md"
                  : "shadow-none hover:bg-gray-200"
              }`}
              onClick={() => handleTabChange("profile")}
            >
              <UserIcon className="h-4 w-4 mr-1" />
              Profile
            </Button>
            <Button
              variant={activeTab === "security" ? "default" : "ghost"}
              className={`flex-1 py-2 px-4 text-sm ${
                activeTab === "security"
                  ? "shadow-md"
                  : "shadow-none hover:bg-gray-200"
              }`}
              onClick={() => handleTabChange("security")}
            >
              <ShieldCheckIcon className="h-4 w-4 mr-1" />
              Security
            </Button>
            <Button
              variant={activeTab === "billing" ? "default" : "ghost"}
              className={`flex-1 py-2 px-4 text-sm ${
                activeTab === "billing"
                  ? "shadow-md"
                  : "shadow-none hover:bg-gray-200"
              }`}
              onClick={() => handleTabChange("billing")}
            >
              <CreditCardIcon className="h-4 w-4 mr-1" />
              Billing
            </Button>
            <Button
              variant={activeTab === "danger" ? "default" : "ghost"}
              className={`flex-1 py-2 px-4 text-sm ${
                activeTab === "danger"
                  ? "shadow-md"
                  : "shadow-none hover:bg-gray-200"
              }`}
              onClick={() => handleTabChange("danger")}
            >
              <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
              Danger
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto">
          {/* Error/Success Messages */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert className="mb-4 border-green-200 bg-green-50 text-green-800">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          {/* Tab Content */}
          {activeTab === "profile" && (
            <ProfileTab
              session={session}
              onError={handleError}
              onSuccess={handleSuccess}
            />
          )}

          {activeTab === "security" && (
            <SecurityTab
              session={session}
              onError={handleError}
              onSuccess={handleSuccess}
            />
          )}

          {activeTab === "billing" && <BillingTab />}

          {activeTab === "danger" && (
            <DangerTab onError={handleError} onClose={onClose} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
