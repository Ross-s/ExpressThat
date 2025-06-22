"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  ShieldCheckIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
} from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";
import {
  TurnstileWidget,
  TurnstileRef,
} from "@/lib/cloudflare/TurnstileWidget";
import Link from "next/link";

export default function TwoFactorPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const turnstileRef = useRef<TurnstileRef>(null);

  const [method, setMethod] = useState<"totp" | "email">("totp");
  const [code, setCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [showTurnstile, setShowTurnstile] = useState(false);
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [backupCode, setBackupCode] = useState("");

  const handleRequestEmailOTP = async () => {
    // Show Turnstile first if not already completed
    if (!turnstileToken) {
      setShowTurnstile(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await authClient.twoFactor.sendOtp({
        fetchOptions: {
          headers: {
            "x-captcha-response": turnstileToken,
          },
        },
      });
      setEmailSent(true);
    } catch (error) {
      console.error("Email OTP error:", error);
      setError("Failed to send email OTP. Please try again.");
      // Reset Turnstile on error
      turnstileRef.current?.reset();
      setTurnstileToken(null);
    } finally {
      setLoading(false);
    }
  };

  const handleTurnstileSuccess = (token: string) => {
    setTurnstileToken(token);
    setShowTurnstile(false);
    // Automatically proceed with sending email OTP
    setTimeout(() => {
      handleRequestEmailOTP();
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code");
      setLoading(false);
      return;
    }

    try {
      let result;

      if (method === "totp") {
        result = await authClient.twoFactor.verifyTotp({
          code,
          trustDevice,
        });
      } else {
        // For now, simulate email OTP verification
        // TODO: Implement actual email OTP verification when backend supports it
        result = await authClient.twoFactor.verifyOtp({
          code,
          trustDevice,
        });
      }

      if (result.error) {
        setError(result.error.message || "Invalid verification code");
        return;
      }

      // Success - redirect to the intended page
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("2FA verification error:", error);
      setError("Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackupCode = async () => {
    setShowBackupCode(true);
  };

  const handleBackupCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      // TODO: Implement actual backup code verification when backend supports it
      // For now, simulate backup code verification
      const result = await authClient.twoFactor.verifyBackupCode({
        code: backupCode.trim(),
        trustDevice,
      });

      if (result.error) {
        setError(result.error.message || "Invalid backup code");
        return;
      }

      // Simulate success for demonstration
      window.location.href = redirectUrl;
    } catch (error) {
      console.error("Backup code verification error:", error);
      setError("Invalid backup code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 flex items-center justify-center p-4 animate-in fade-in duration-700">
      {/* Backup Code Modal */}
      {showBackupCode && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="card w-full max-w-md bg-base-100 shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
            <div className="card-body">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center mb-4">
                  <svg
                    className="w-8 h-8 text-warning"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2H7v-2H4a1 1 0 01-1-1v-1a7 7 0 017-7 2 2 0 012 2 2 2 0 012 2zm2.5 0a.5.5 0 11-1 0 .5.5 0 011 0z"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold mb-2">Enter Backup Code</h2>
                <p className="text-base-content/70">
                  Use one of your saved backup codes to sign in
                </p>
              </div>

              <form onSubmit={handleBackupCodeSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Backup Code</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your backup code"
                    className="input input-bordered w-full text-center font-mono text-lg"
                    value={backupCode}
                    onChange={(e) => {
                      setBackupCode(
                        e.target.value.replace(/[^a-zA-Z0-9\-]/g, ""),
                      );
                      if (error) setError(null);
                    }}
                    maxLength={16}
                    required
                  />
                  <div className="label">
                    <span className="label-text-alt text-base-content/60">
                      Backup codes are typically 8-16 characters long
                    </span>
                  </div>
                </div>

                <div className="bg-info/10 rounded-lg p-4 text-sm">
                  <div className="flex items-start gap-2">
                    <svg
                      className="w-5 h-5 text-info mt-0.5 shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="font-medium text-info mb-1">Important:</p>
                      <p className="text-base-content/70">
                        Each backup code can only be used once. After using this
                        code, it will no longer be valid.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Error Section */}
                {error && (
                  <div className="alert alert-error animate-in fade-in slide-in-from-bottom-2 duration-300">
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
                      <h3 className="font-bold">Verification Failed</h3>
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

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBackupCode(false);
                      setBackupCode("");
                      setError(null);
                    }}
                    className="btn btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !backupCode.trim()}
                    className="btn btn-primary flex-1"
                  >
                    {loading && (
                      <span className="loading loading-spinner loading-sm"></span>
                    )}
                    Verify Code
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Turnstile Modal */}
      {showTurnstile && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-in fade-in duration-300">
          <div className="card w-full max-w-md bg-base-100 shadow-2xl animate-in slide-in-from-bottom-8 duration-500">
            <div className="card-body text-center">
              <h2 className="text-xl font-bold mb-4">Security Verification</h2>
              <p className="text-base-content/70 mb-6">
                Please complete the security check to send your email
                verification code.
              </p>
              <div className="flex justify-center mb-6">
                <TurnstileWidget
                  ref={turnstileRef}
                  setToken={handleTurnstileSuccess}
                />
              </div>
              <button
                onClick={() => {
                  setShowTurnstile(false);
                  setMethod("totp");
                }}
                className="btn btn-ghost btn-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="card w-full max-w-md bg-base-100 shadow-2xl animate-in slide-in-from-bottom-8 duration-500 delay-200">
        <div className="card-body">
          {emailSent && method === "email" ? (
            /* Email OTP Sent Dialog */
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
                We&apos;ve sent a 6-digit verification code to your email
                address.
              </p>

              {/* Instructions */}
              <div className="bg-base-200 rounded-lg p-4 mb-6 text-sm text-base-content/80">
                <p className="mb-2">
                  Enter the code below to complete sign in.
                </p>
                <p>The code will expire in 10 minutes.</p>
              </div>

              {/* Code Input Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Verification Code</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    className="input input-bordered w-full text-center text-lg tracking-widest"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, ""));
                      if (error) setError(null);
                    }}
                    required
                  />
                </div>

                {/* Trust Device Option */}
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">
                      Trust this device for 30 days
                    </span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={trustDevice}
                      onChange={(e) => setTrustDevice(e.target.checked)}
                    />
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="btn btn-primary w-full"
                >
                  {loading && (
                    <span className="loading loading-spinner loading-sm"></span>
                  )}
                  Verify Code
                </button>
              </form>

              {/* Actions */}
              <div className="space-y-3 mt-4">
                <button
                  onClick={() => {
                    setEmailSent(false);
                    setCode("");
                    setMethod("totp");
                    setShowTurnstile(false);
                    setTurnstileToken(null);
                    turnstileRef.current?.reset();
                  }}
                  className="btn btn-outline w-full"
                >
                  Use Authenticator App Instead
                </button>
              </div>
            </div>
          ) : (
            /* Main 2FA Form */
            <>
              {/* Header */}
              <div className="text-center mb-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-300">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <ShieldCheckIcon className="w-8 h-8 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-base-content mb-2 transition-all duration-300">
                  Two-Factor Authentication
                </h1>
                <p className="text-base-content/70 transition-all duration-300">
                  Enter your verification code to continue
                </p>
              </div>

              {/* Method Selection */}
              <div className="flex gap-2 mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
                <button
                  onClick={() => {
                    setMethod("totp");
                    setEmailSent(false);
                    setCode("");
                    setError(null);
                    setShowTurnstile(false);
                    setTurnstileToken(null);
                    turnstileRef.current?.reset();
                  }}
                  className={`btn flex-1 ${method === "totp" ? "btn-primary" : "btn-outline"}`}
                >
                  <DevicePhoneMobileIcon className="w-4 h-4 mr-2" />
                  Authenticator App
                </button>
                <button
                  onClick={() => {
                    setMethod("email");
                    setCode("");
                    setError(null);
                    setEmailSent(false);
                    setTurnstileToken(null);
                    setShowTurnstile(false);
                    // Start the email OTP process
                    handleRequestEmailOTP();
                  }}
                  className={`btn flex-1 ${method === "email" ? "btn-primary" : "btn-outline"}`}
                >
                  <EnvelopeIcon className="w-4 h-4 mr-2" />
                  Email Code
                </button>
              </div>

              {/* Verification Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700"
              >
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">
                      {method === "totp"
                        ? "Authenticator Code"
                        : "Email Verification Code"}
                    </span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter 6-digit code"
                    className="input input-bordered w-full text-center text-lg tracking-widest"
                    maxLength={6}
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value.replace(/\D/g, ""));
                      if (error) setError(null);
                    }}
                    required
                  />
                  <div className="label">
                    <span className="label-text-alt text-base-content/60">
                      {method === "totp"
                        ? "Open your authenticator app and enter the 6-digit code"
                        : emailSent
                          ? "Check your email for the verification code"
                          : "We'll send a code to your email address"}
                    </span>
                  </div>
                </div>

                {/* Trust Device Option */}
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">
                      Trust this device for 30 days
                    </span>
                    <input
                      type="checkbox"
                      className="checkbox"
                      checked={trustDevice}
                      onChange={(e) => setTrustDevice(e.target.checked)}
                    />
                  </label>
                  <div className="label">
                    <span className="label-text-alt text-base-content/60">
                      You won&apos;t need to enter a code on this device for 30
                      days
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="btn btn-primary w-full transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                >
                  {loading && (
                    <span className="loading loading-spinner loading-sm"></span>
                  )}
                  Verify & Continue
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
                      <h3 className="font-bold">Verification Failed</h3>
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

              {/* Additional Options */}
              <div className="divider mt-6">Or</div>

              <div className="space-y-3 animate-in fade-in duration-500 delay-800">
                <button
                  onClick={handleBackupCode}
                  className="btn btn-ghost w-full text-sm"
                >
                  Use Backup Code
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
