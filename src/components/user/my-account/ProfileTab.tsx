"use client";

import { useState, useEffect } from "react";
import { UserIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";

interface ProfileTabProps {
  session: {
    user?: {
      id: string;
      email: string;
      name?: string;
    };
  } | null;
  onError: (error: string) => void;
  onSuccess: (message: string) => void;
}

export default function ProfileTab({
  session,
  onError,
  onSuccess,
}: ProfileTabProps) {
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: session?.user?.name || "",
    email: session?.user?.email || "",
  });

  // Update local state when session changes
  useEffect(() => {
    if (session?.user) {
      setProfileData({
        name: session.user.name || "",
        email: session.user.email || "",
      });
    }
  }, [session]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    onError("");
    onSuccess("");

    try {
      // Update user profile
      const result = await authClient.updateUser({
        name: profileData.name,
      });

      if (result.error) {
        onError(result.error.message || "Failed to update profile");
      } else {
        onSuccess("Profile updated successfully");
      }
    } catch {
      onError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <form onSubmit={handleProfileUpdate} className="space-y-4">
        <div className="form-control">
          <label className="label">
            <span className="label-text">Full Name</span>
          </label>
          <div className="relative">
            <input
              type="text"
              placeholder="Enter your full name"
              className="input input-bordered w-full pl-10 min-h-[48px]"
              value={profileData.name}
              onChange={(e) =>
                setProfileData({ ...profileData, name: e.target.value })
              }
              required
            />
            <UserIcon className="h-5 w-5 absolute left-3 top-3 text-base-content/40" />
          </div>
        </div>

        <div className="form-control">
          <label className="label">
            <span className="label-text">Email Address</span>
          </label>
          <div className="relative">
            <input
              type="email"
              className="input input-bordered w-full pl-10 min-h-[48px] bg-base-200"
              value={profileData.email}
              disabled
            />
            <EnvelopeIcon className="h-5 w-5 absolute left-3 top-3 text-base-content/40" />
          </div>
          <label className="label">
            <span className="label-text-alt text-base-content/60">
              Email cannot be changed. Contact support if needed.
            </span>
          </label>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={loading}
          >
            {loading && (
              <span className="loading loading-spinner loading-sm"></span>
            )}
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
}
