"use client";

import { useState, useEffect, useRef } from "react";
import { EnvelopeIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  TurnstileWidget,
  TurnstileRef,
} from "@/lib/cloudflare/TurnstileWidget";
import { authClient } from "@/lib/auth-client";
import PasswordInput, {
  getPasswordStrength,
} from "@/components/ui/PasswordInput";

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const turnstileRef = useRef<TurnstileRef>(null);
  const [passwordReset, setPasswordReset] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Calculate password strength
  const passwordStrength = getPasswordStrength(formData.password);

  useEffect(() => {
    // Reset form data when token changes
    if (token) {
      setFormData({ email: "", password: "", confirmPassword: "" });
      setEmailSent(false);
      setPasswordReset(false);
      setError(null);
    } else {
      // Reset form data for email request
      setFormData({ email: "", password: "", confirmPassword: "" });
      setEmailSent(false);
      setPasswordReset(false);
      setError(null);
    }
  }, [searchParams, token]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear any previous errors
    setError(null);

    if (token) {
      // Handle new password creation with token
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match.");
        return;
      }

      const passwordStrength = getPasswordStrength(formData.password);
      if (passwordStrength.score < 4) {
        setError(
          "Please create a strong password that meets all requirements.",
        );
        return;
      }

      try {
        const result = await authClient.resetPassword({
          token: token,
          newPassword: formData.password,
        });

        if (result.error) {
          // Handle specific error cases
          if (
            result.error.message?.includes("expired") ||
            result.error.message?.includes("invalid")
          ) {
            setError(
              "This password reset link has expired or is invalid. Please request a new password reset.",
            );
          } else {
            setError(
              result.error.message ||
                "Failed to reset password. Please try again.",
            );
          }
          return;
        }

        // Success - show confirmation
        setPasswordReset(true);
      } catch (error) {
        console.error("Password reset error:", error);
        setError(
          "This password reset link has expired or is invalid. Please request a new password reset.",
        );
      }
    } else {
      // Handle reset password request
      if (!turnstileToken) {
        setError("Please complete the captcha verification");
        return;
      }

      try {
        await authClient.requestPasswordReset({
          email: formData.email,
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
        setError("Failed to send reset email. Please try again.");
        // Reset turnstile on error
        turnstileRef.current?.reset();
        setTurnstileToken(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 flex items-center justify-center p-4 animate-in fade-in duration-700">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl animate-in slide-in-from-bottom-8 duration-500 delay-200">
        {" "}
        <div className="card-body">
          {passwordReset ? (
            /* Password Reset Success Dialog */
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-success"
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
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-base-content mb-2">
                Password Reset Successful
              </h1>
              {/* Message */}
              <p className="text-base-content/70 mb-6">
                Your password has been successfully reset. <br />
                You can now sign in with your new password.
              </p>

              {/* Actions */}
              <div className="space-y-3">
                <Link href="/sign-in" className="btn btn-primary w-full">
                  Sign In
                </Link>
              </div>
            </div>
          ) : token ? (
            /* New Password Form (when token exists) */
            <>
              {/* Header */}
              <div className="text-center mb-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-300">
                <h1 className="text-3xl font-bold text-base-content mb-2 transition-all duration-300">
                  Create New Password
                </h1>
                <p className="text-base-content/70 transition-all duration-300">
                  Enter your new password below
                </p>
              </div>

              {/* New Password Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700"
              >
                <PasswordInput
                  label="New Password"
                  placeholder="Enter your new password"
                  value={formData.password}
                  onChange={(value) =>
                    setFormData({ ...formData, password: value })
                  }
                  showStrengthIndicator
                  required
                />
                <PasswordInput
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  value={formData.confirmPassword}
                  onChange={(value) =>
                    setFormData({ ...formData, confirmPassword: value })
                  }
                  required
                />
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={passwordStrength.score < 4}
                  className={`btn w-full transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] ${
                    passwordStrength.score < 4 ? "btn-disabled" : "btn-primary"
                  }`}
                >
                  Reset Password
                </button>
                {/* Password strength warning */}
                {formData.password && passwordStrength.score < 4 && (
                  <div className="text-center mt-2">
                    <p className="text-xs text-error">
                      Strong password required to continue
                    </p>
                  </div>
                )}
                {/* Error Section */}
                {error && (
                  <div className="alert alert-error mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="flex-1">
                      <h3 className="font-bold">Error</h3>
                      <div className="text-sm">{error}</div>
                      {/* Show helpful action for invalid/expired token */}
                      {token &&
                        (error.includes("expired") ||
                          error.includes("invalid")) && (
                          <div className="mt-3">
                            <Link
                              href="/reset-password"
                              className="btn btn-sm btn-outline"
                            >
                              Request New Reset Link
                            </Link>
                          </div>
                        )}
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="btn btn-sm btn-circle btn-ghost"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </form>

              {/* Back to Sign In */}
              <div className="text-center mt-6 animate-in fade-in duration-500 delay-800">
                <p className="text-base-content/70 transition-all duration-300">
                  Remember your password?{" "}
                  <Link
                    href="/sign-in"
                    className="text-[#88AFFC] hover:text-[#DEE7FC] underline ml-1 transition-all duration-200 hover:scale-105 font-medium text-base"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          ) : emailSent ? (
            /* Email Sent Dialog */
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-success"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-base-content mb-2">
                Check Your Email
              </h1>
              {/* Message */}
              <p className="text-base-content/70 mb-6">
                We&apos;ve sent a password reset link to <br />
                <span className="font-medium text-primary">
                  {formData.email}
                </span>
              </p>

              {/* Instructions */}
              <div className="bg-base-200 rounded-lg p-4 mb-6 text-sm text-base-content/80">
                <p className="mb-2">
                  Click the link in the email to reset your password.
                </p>
                <p>The link will expire in 1 hour.</p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Link href="/sign-in" className="btn btn-primary w-full">
                  Back to Sign In
                </Link>{" "}
                <button
                  onClick={() => {
                    setFormData({
                      email: "",
                      password: "",
                      confirmPassword: "",
                    });
                    setEmailSent(false);
                  }}
                  className="btn btn-outline w-full"
                >
                  Use Different Email
                </button>
              </div>
            </div>
          ) : (
            /* Main Reset Password Form */
            <>
              {/* Header */}
              <div className="text-center mb-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-300">
                <h1 className="text-3xl font-bold text-base-content mb-2 transition-all duration-300">
                  Reset Password
                </h1>
                <p className="text-base-content/70 transition-all duration-300">
                  Enter your email address and we&apos;ll send you a link to
                  reset your password
                </p>
              </div>

              {/* Reset Password Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700"
              >
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email address</span>
                  </label>
                  <div className="relative">
                    {" "}
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      className="input input-bordered w-full pl-10 min-h-[48px] transition-all duration-200 hover:shadow-sm"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                    <EnvelopeIcon className="h-5 w-5 absolute left-3 top-3 text-base-content/40 transition-colors duration-200" />
                  </div>
                </div>{" "}
                <TurnstileWidget
                  ref={turnstileRef}
                  setToken={setTurnstileToken}
                />
                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!turnstileToken}
                  className="btn btn-primary w-full transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                >
                  Send Reset Link
                </button>
                {/* Error Section */}
                {error && (
                  <div className="alert alert-error mt-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="stroke-current shrink-0 h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-bold">Error</h3>
                      <div className="text-sm">{error}</div>
                    </div>
                    <button
                      onClick={() => setError(null)}
                      className="btn btn-sm btn-circle btn-ghost"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </form>

              {/* Back to Sign In */}
              <div className="text-center mt-6 animate-in fade-in duration-500 delay-800">
                <p className="text-base-content/70 transition-all duration-300">
                  Remember your password?{" "}
                  <Link
                    href="/sign-in"
                    className="text-[#88AFFC] hover:text-[#DEE7FC] underline ml-1 transition-all duration-200 hover:scale-105 font-medium text-base"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
