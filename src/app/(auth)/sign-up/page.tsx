"use client";

import { useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { EnvelopeIcon, UserIcon } from "@heroicons/react/24/outline";
import { authClient } from "@/lib/auth-client";
import {
  TurnstileWidget,
  TurnstileRef,
} from "@/lib/cloudflare/TurnstileWidget";
import Link from "next/link";
import PasswordInput, {
  getPasswordStrength,
} from "@/components/ui/PasswordInput";

export default function AuthPage({ isSignIn }: { isSignIn?: boolean }) {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const turnstileRef = useRef<TurnstileRef>(null);

  const [isSignUp, setIsSignUp] = useState(isSignIn !== true);
  const [authMethod, setAuthMethod] = useState<"password" | "magic">(
    "password",
  );
  const [emailSent, setEmailSent] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    confirmPassword: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Clear any previous errors
    setError(null); // Require strong password for password authentication during sign up only
    if (authMethod === "password" && isSignUp) {
      const passwordStrength = getPasswordStrength(formData.password);
      if (passwordStrength.score < 4) {
        setError(
          "Please create a strong password that meets all requirements.",
        );
        return; // Prevent form submission
      }
    }

    if (authMethod === "magic") {
      const result = await authClient.signIn.magicLink({
        email: formData.email,
        callbackURL: redirectUrl,
        fetchOptions: {
          headers: {
            "x-captcha-response": turnstileToken!,
          },
        },
      });

      if (result.error) {
        setError(
          result.error.message ||
            "Failed to send magic link. Please try again.",
        );
        // Reset turnstile on error
        turnstileRef.current?.reset();
        setTurnstileToken(null);
        return;
      }

      setEmailSent(true);
      return;
    }

    if (authMethod === "password") {
      if (isSignUp) {
        const result = await authClient.signUp.email({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          callbackURL: redirectUrl,
          fetchOptions: {
            headers: {
              "x-captcha-response": turnstileToken!,
            },
          },
        });
        if (result.error) {
          setError(
            result.error.message ||
              "Failed to create account. Please try again.",
          );
          // Reset turnstile on error
          turnstileRef.current?.reset();
          setTurnstileToken(null);
          return;
        }

        // Show email verification dialog for successful signup
        setEmailVerificationSent(true);
        return;
      } else {
        const result = await authClient.signIn.email({
          email: formData.email,
          password: formData.password,
          callbackURL: redirectUrl,
          fetchOptions: {
            headers: {
              "x-captcha-response": turnstileToken!,
            },
          },
        });

        if (result.error) {
          setError(
            result.error.message || "Failed to sign in. Please try again.",
          );
          // Reset turnstile on error
          turnstileRef.current?.reset();
          setTurnstileToken(null);
          return;
        }
      }
    }

    // Frontend only - no backend implementation
    console.log("Form submitted:", { isSignUp, authMethod, formData });
  };
  const handleSocialLogin = async (
    provider:
      | "github"
      | "apple"
      | "discord"
      | "facebook"
      | "microsoft"
      | "google"
      | "spotify"
      | "twitch"
      | "twitter"
      | "dropbox"
      | "kick"
      | "linkedin"
      | "gitlab"
      | "tiktok"
      | "reddit"
      | "roblox"
      | "vk"
      | "zoom"
      | (string & {}),
  ) => {
    // Clear any previous errors
    setError(null);

    const data = await authClient.signIn.social({
      provider,
      callbackURL: redirectUrl,
    });

    // Frontend only - no backend implementation
    console.log(`${provider} login clicked with data:`, data);

    // Example of how to set an error for social login failures
    // setError(`${provider} login is not available at the moment. Please try again later.`);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 flex items-center justify-center p-4 animate-in fade-in duration-700">
      <div className="card w-full max-w-md bg-base-100 shadow-2xl animate-in slide-in-from-bottom-8 duration-500 delay-200">
        {" "}
        <div className="card-body">
          {emailVerificationSent ? (
            /* Email Verification Dialog */
            <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* Success Icon */}
              <div className="mx-auto w-16 h-16 bg-info/10 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-8 h-8 text-info"
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
                Verify Your Email
              </h1>
              {/* Message */}
              <p className="text-base-content/70 mb-6">
                Account created successfully! <br />
                Please check your email at <br />
                <span className="font-medium text-primary">
                  {formData.email}
                </span>
              </p>

              {/* Instructions */}
              <div className="bg-base-200 rounded-lg p-4 mb-6 text-sm text-base-content/80">
                <p className="mb-2">
                  Click the verification link in your email to activate your
                  account.
                </p>
                <p>The link will expire in 1 hour.</p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setEmailVerificationSent(false);
                    setIsSignUp(false); // Switch to sign in mode
                  }}
                  className="btn btn-primary w-full"
                >
                  Go to Sign In
                </button>

                <button
                  onClick={() => {
                    setFormData({ ...formData, email: "" });
                    setEmailVerificationSent(false);
                  }}
                  className="btn btn-outline w-full"
                >
                  Use Different Email
                </button>
              </div>
            </div>
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
                We&apos;ve sent a magic link to <br />
                <span className="font-medium text-primary">
                  {formData.email}
                </span>
              </p>

              {/* Instructions */}
              <div className="bg-base-200 rounded-lg p-4 mb-6 text-sm text-base-content/80">
                <p className="mb-2">Click the link in the email to sign in.</p>
                <p>The link will expire in 5 minutes.</p>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => setEmailSent(false)}
                  className="btn btn-outline w-full"
                >
                  Back to Sign In
                </button>

                <button
                  onClick={() => {
                    setFormData({ ...formData, email: "" });
                    setEmailSent(false);
                  }}
                  className="btn btn-ghost w-full text-sm"
                >
                  Use Different Email
                </button>
              </div>
            </div>
          ) : (
            /* Main Auth Form */
            <>
              {/* Header */}
              <div className="text-center mb-6 animate-in fade-in slide-in-from-top-4 duration-500 delay-300">
                <h1 className="text-3xl font-bold text-base-content mb-2 transition-all duration-300">
                  {isSignUp ? "Create Account" : "Welcome Back"}
                </h1>
                <p className="text-base-content/70 transition-all duration-300">
                  {isSignUp
                    ? "Join us and start your journey"
                    : "Sign in to continue to your account"}
                </p>{" "}
              </div>
              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6 animate-in fade-in slide-in-from-left-4 duration-500 delay-400">
                <button
                  onClick={() => handleSocialLogin("github")}
                  className="btn btn-outline w-full transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                >
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Continue with GitHub
                </button>{" "}
              </div>{" "}
              {/* Divider */}
              <div className="divider animate-in fade-in duration-500 delay-500">
                OR
              </div>{" "}
              {/* Auth Method Toggle */}
              <div className="flex bg-base-200 p-1 rounded-lg mb-6 animate-in fade-in slide-in-from-right-4 duration-500 delay-600">
                <button
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 transform ${
                    authMethod === "password"
                      ? "bg-base-100 text-base-content shadow-md translate-y-0 scale-[1.02]"
                      : "bg-transparent text-base-content/70 shadow-inner translate-y-0.5 hover:translate-y-0 hover:text-base-content/90"
                  }`}
                  onClick={() => {
                    setAuthMethod("password");
                    setError(null);
                  }}
                >
                  Password
                </button>
                <button
                  className={`flex-1 py-2 px-4 rounded-md font-medium transition-all duration-300 transform ${
                    authMethod === "magic"
                      ? "bg-base-100 text-base-content shadow-md translate-y-0 scale-[1.02]"
                      : "bg-transparent text-base-content/70 shadow-inner translate-y-0.5 hover:translate-y-0 hover:text-base-content/90"
                  }`}
                  onClick={() => {
                    setAuthMethod("magic");
                    setError(null);
                  }}
                >
                  Magic Link
                </button>
              </div>{" "}
              {/* Auth Form */}
              <form
                onSubmit={handleSubmit}
                className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-700"
              >
                {authMethod === "magic" /* Magic Link Form */ ? (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Email address</span>
                    </label>{" "}
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
                  </div>
                ) : (
                  /* Password Form */
                  <>
                    {isSignUp && (
                      <div className="form-control">
                        <label className="label">
                          <span className="label-text">Full name</span>
                        </label>{" "}
                        <div className="relative">
                          <input
                            type="text"
                            name="name"
                            placeholder="Enter your full name"
                            className="input input-bordered w-full pl-10 min-h-[48px]"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                          />
                          <UserIcon className="h-5 w-5 absolute left-3 top-3 text-base-content/40" />
                        </div>
                      </div>
                    )}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Email address</span>
                      </label>{" "}
                      <div className="relative">
                        <input
                          type="email"
                          name="email"
                          placeholder="Enter your email"
                          className="input input-bordered w-full pl-10 min-h-[48px]"
                          value={formData.email}
                          onChange={handleInputChange}
                          required
                        />
                        <EnvelopeIcon className="h-5 w-5 absolute left-3 top-3 text-base-content/40" />
                      </div>
                    </div>{" "}
                    <PasswordInput
                      label="Password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(value) =>
                        setFormData({ ...formData, password: value })
                      }
                      showStrengthIndicator={
                        authMethod === "password" && isSignUp
                      }
                      required
                    />
                    {isSignUp && (
                      <PasswordInput
                        label="Confirm password"
                        placeholder="Confirm your password"
                        value={formData.confirmPassword}
                        onChange={(value) =>
                          setFormData({ ...formData, confirmPassword: value })
                        }
                        required
                      />
                    )}
                    {!isSignUp && (
                      <div className="text-right">
                        <Link
                          href="/reset-password"
                          type="button"
                          className="text-[#88AFFC] hover:text-[#DEE7FC] underline text-sm font-medium"
                        >
                          Forgot password?
                        </Link>
                      </div>
                    )}
                  </>
                )}{" "}
                {/* Submit Button */}{" "}
                <TurnstileWidget
                  ref={turnstileRef}
                  setToken={setTurnstileToken}
                />{" "}
                <button
                  type="submit"
                  className="btn btn-primary w-full transform transition-all duration-200 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                >
                  {authMethod === "magic"
                    ? "Send Magic Link"
                    : isSignUp
                      ? "Create Account"
                      : "Sign In"}
                </button>{" "}
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
              </form>{" "}
              {/* Toggle Sign Up / Sign In */}
              <div className="text-center mt-6 animate-in fade-in duration-500 delay-800">
                <p className="text-base-content/70 transition-all duration-300">
                  {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    className="text-[#88AFFC] hover:text-[#DEE7FC] underline ml-1 transition-all duration-200 hover:scale-105 font-medium text-base"
                    onClick={() => {
                      setIsSignUp(!isSignUp);
                      setError(null);
                    }}
                  >
                    {isSignUp ? "Sign in" : "Sign up"}
                  </button>
                </p>
              </div>{" "}
              {/* Terms and Privacy */}
              {isSignUp && (
                <div className="text-center mt-4 animate-in fade-in duration-500 delay-900">
                  <p className="text-xs text-base-content/60">
                    By creating an account, you agree to our{" "}
                    <button
                      type="button"
                      className="text-[#88AFFC] hover:text-[#DEE7FC] underline transition-all duration-200 hover:scale-105 font-medium text-base"
                    >
                      Terms of Service
                    </button>{" "}
                    and{" "}
                    <button
                      type="button"
                      className="text-[#88AFFC] hover:text-[#DEE7FC] underline transition-all duration-200 hover:scale-105 font-medium text-base"
                    >
                      {" "}
                      Privacy Policy
                    </button>
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
