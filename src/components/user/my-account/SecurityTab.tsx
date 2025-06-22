"use client";

import { useEffect, useState, useRef } from "react";
import { KeyIcon } from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";
import { TwoFactorAuth } from "./2FA";
import {
  TurnstileWidget,
  TurnstileRef,
} from "@/lib/cloudflare/TurnstileWidget";
import PasswordInput, {
  getPasswordStrength,
} from "@/components/ui/PasswordInput";

interface SecurityTabProps {
  session: {
    user?: {
      id: string;
      email: string;
      name?: string;
      twoFactorEnabled?: boolean | null;
    };
  } | null;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export default function SecurityTab({
  session,
  onError,
  onSuccess,
}: SecurityTabProps) {
  const [loading, setLoading] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);
  const turnstileRef = useRef<TurnstileRef>(null);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    (async () => {
      // Check if user has a password
      const accounts = await authClient.listAccounts();
      if (accounts.data?.some((account) => account.provider === "credential")) {
        setHasPassword(true);
      }
    })();
  }, []);

  const handlePasswordReset = async () => {
    if (!turnstileToken) {
      onError("Please complete the captcha verification");
      return;
    }

    if (!session?.user?.email) {
      onError("User email not found");
      return;
    }

    setLoading(true);
    onError("");
    onSuccess("");

    try {
      await authClient.requestPasswordReset({
        email: session.user.email,
        redirectTo: `/reset-password`,
        fetchOptions: {
          headers: {
            "x-captcha-response": turnstileToken,
          },
        },
      });

      setEmailSent(true);
    } catch (error) {
      console.error("Request password reset error:", error);
      onError("Failed to send reset email. Please try again.");
      // Reset turnstile on error
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onError("");
    onSuccess("");
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      onError("New passwords do not match");
      setLoading(false);
      return;
    }

    const passwordStrength = getPasswordStrength(passwordData.newPassword);
    if (passwordStrength.score < 4) {
      onError("Please create a strong password that meets all requirements");
      setLoading(false);
      return;
    }

    try {
      const result = await authClient.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (result.error) {
        onError(result.error.message || "Failed to change password");
      } else {
        onSuccess("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordChange(false);
      }
    } catch {
      onError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 space-y-6">
      {/* Change/Set Password */}
      <div className="bg-base-200 rounded-lg p-4">
        <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
          <h3 className="font-semibold flex items-center justify-center">
            <KeyIcon className="h-5 w-5 mr-2" />
            {hasPassword ? "Change Password" : "Set Password"}
          </h3>
          <button
            onClick={() => {
              if (hasPassword) {
                setShowPasswordChange(!showPasswordChange);
                setPasswordData({
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                });
              } else {
                handlePasswordReset();
              }
            }}
            className="btn btn-sm btn-primary"
            disabled={
              loading ||
              (!hasPassword && !turnstileToken) ||
              (!hasPassword && emailSent)
            }
          >
            {loading && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
            {hasPassword ? "Change" : "Send Reset Email"}
          </button>
        </div>

        {/* Show Turnstile for users without password */}
        {!hasPassword && !emailSent && (
          <div className="mt-4 p-3 bg-base-100 rounded-lg">
            <p className="text-sm text-base-content/70 mb-3">
              You don&apos;t have a password set. Complete the verification
              below and we&apos;ll send you an email to set up your password.
            </p>
            <TurnstileWidget ref={turnstileRef} setToken={setTurnstileToken} />
          </div>
        )}

        {/* Show success message for password reset */}
        {!hasPassword && emailSent && (
          <div className="mt-4 p-3 bg-success/10 rounded-lg border border-success/20">
            <p className="text-sm text-success">
              Password reset email sent! Check your email and follow the
              instructions to set up your password.
            </p>
          </div>
        )}

        {/* Show password change form for users with existing password */}
        {hasPassword && showPasswordChange && (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <PasswordInput
              label="Current Password"
              placeholder="Enter current password"
              value={passwordData.currentPassword}
              onChange={(value) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: value,
                })
              }
              required
            />
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              value={passwordData.newPassword}
              onChange={(value) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: value,
                })
              }
              showStrengthIndicator
              required
            />
            <PasswordInput
              label="Confirm New Password"
              placeholder="Confirm new password"
              value={passwordData.confirmPassword}
              onChange={(value) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: value,
                })
              }
              required
            />
            <div className="flex gap-3">
              <button
                type="button"
                className="btn btn-outline flex-1"
                onClick={() => setShowPasswordChange(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary flex-1"
                disabled={loading}
              >
                {loading && (
                  <span className="loading loading-spinner loading-sm"></span>
                )}
                Change Password
              </button>
            </div>
          </form>
        )}
      </div>
      <TwoFactorAuth session={session} hasPassword={hasPassword} />
    </div>
  );
}
