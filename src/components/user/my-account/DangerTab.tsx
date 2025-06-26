"use client";

import { useState } from "react";
import {
  ExclamationTriangleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";
import PasswordInput from "@/components/ui/PasswordInput";

interface DangerTabProps {
  onError: (error: string) => void;
  onClose: () => void;
}

export default function DangerTab({ onError, onClose }: DangerTabProps) {
  const [loading, setLoading] = useState(false);
  const [deleteAccountData, setDeleteAccountData] = useState({
    password: "",
    confirmText: "",
  });

  const handleDeleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();

    if (deleteAccountData.confirmText !== "DELETE") {
      onError("Please type DELETE to confirm");
      return;
    }

    setLoading(true);
    onError("");

    try {
      const result = await authClient.deleteUser({
        password: deleteAccountData.password,
      });

      if (result.error) {
        onError(result.error.message || "Failed to delete account");
      } else {
        // Account deleted successfully - close dialog and redirect
        onClose();
        window.location.href = "/";
      }
    } catch {
      onError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="bg-error/10 border border-error/20 rounded-lg p-4">
        <h3 className="font-semibold mb-4 text-error flex items-center">
          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
          Danger Zone
        </h3>
        <p className="text-base-content/70 text-sm mb-6">
          Once you delete your account, there is no going back. Please be
          certain.
        </p>{" "}
        <form onSubmit={handleDeleteAccount} className="space-y-4">
          <PasswordInput
            label="Password"
            placeholder="Enter your password"
            value={deleteAccountData.password}
            onChange={(value) =>
              setDeleteAccountData({
                ...deleteAccountData,
                password: value,
              })
            }
            required
          />

          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Type <span className="font-mono font-bold">DELETE</span> to
                confirm
              </span>
            </label>
            <input
              type="text"
              placeholder="DELETE"
              className="input input-bordered w-full min-h-[48px]"
              value={deleteAccountData.confirmText}
              onChange={(e) =>
                setDeleteAccountData({
                  ...deleteAccountData,
                  confirmText: e.target.value,
                })
              }
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-error w-full"
            disabled={loading || deleteAccountData.confirmText !== "DELETE"}
          >
            {loading && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
            <TrashIcon className="h-5 w-5 mr-2" />
            Delete Account
          </button>
        </form>
      </div>
    </div>
  );
}
