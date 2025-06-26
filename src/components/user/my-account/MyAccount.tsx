"use client";

import { useState, useEffect } from "react";
import {
  XMarkIcon,
  UserIcon,
  ShieldCheckIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
      <div className="card w-full max-w-2xl bg-base-100 shadow-2xl animate-in slide-in-from-bottom-8 duration-500 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="card-body pb-0">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-base-content">
              Account Settings
            </h1>
            <button
              onClick={onClose}
              className="btn btn-ghost btn-sm btn-circle hover:bg-base-200"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex bg-base-200 p-1 rounded-lg mb-6">
            <button
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 transform text-sm ${
                activeTab === "profile"
                  ? "bg-base-100 text-base-content shadow-md translate-y-0 scale-[1.02]"
                  : "bg-transparent text-base-content/70 shadow-inner translate-y-0.5 hover:translate-y-0 hover:text-base-content/90"
              }`}
              onClick={() => handleTabChange("profile")}
            >
              <UserIcon className="h-4 w-4 inline mr-1" />
              Profile
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 transform text-sm ${
                activeTab === "security"
                  ? "bg-base-100 text-base-content shadow-md translate-y-0 scale-[1.02]"
                  : "bg-transparent text-base-content/70 shadow-inner translate-y-0.5 hover:translate-y-0 hover:text-base-content/90"
              }`}
              onClick={() => handleTabChange("security")}
            >
              <ShieldCheckIcon className="h-4 w-4 inline mr-1" />
              Security
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 transform text-sm ${
                activeTab === "billing"
                  ? "bg-base-100 text-base-content shadow-md translate-y-0 scale-[1.02]"
                  : "bg-transparent text-base-content/70 shadow-inner translate-y-0.5 hover:translate-y-0 hover:text-base-content/90"
              }`}
              onClick={() => handleTabChange("billing")}
            >
              <CreditCardIcon className="h-4 w-4 inline mr-1" />
              Billing
            </button>
            <button
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 transform text-sm ${
                activeTab === "danger"
                  ? "bg-base-100 text-base-content shadow-md translate-y-0 scale-[1.02]"
                  : "bg-transparent text-base-content/70 shadow-inner translate-y-0.5 hover:translate-y-0 hover:text-base-content/90"
              }`}
              onClick={() => handleTabChange("danger")}
            >
              <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
              Danger
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="card-body pt-0 overflow-y-auto">
          {/* Error/Success Messages */}
          {error && (
            <div className="alert alert-error mb-4 animate-in slide-in-from-top-2 duration-300">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="alert alert-success mb-4 animate-in slide-in-from-top-2 duration-300">
              <svg
                className="w-5 h-5"
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
              <span>{success}</span>
            </div>
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
      </div>
    </div>
  );
}
