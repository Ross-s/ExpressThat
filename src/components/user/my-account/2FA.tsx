"use client";

import PasswordInput from "@/components/ui/PasswordInput";
import { useState } from "react";
import QRCode from "react-qr-code";
import { authClient } from "@/lib/auth-client";

interface TwoFactorAuthProps {
  session: {
    user?: {
      id: string;
      email: string;
      name?: string;
      twoFactorEnabled?: boolean | null;
    };
  } | null;
  hasPassword: boolean;
}

export function TwoFactorAuth({ session, hasPassword }: TwoFactorAuthProps) {
  const [showTOTPSetup, setShowTOTPSetup] = useState(false);
  const [hasEnteredPassword, setHasEnteredPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState("");
  const [showRegenerateBackupCodes, setShowRegenerateBackupCodes] =
    useState(false);
  const [regeneratePassword, setRegeneratePassword] = useState("");
  const [regenerateLoading, setRegenerateLoading] = useState(false);
  const [regenerateError, setRegenerateError] = useState("");
  const [is2FAEnabled, setIs2FAEnabled] = useState(
    session?.user?.twoFactorEnabled || false,
  );
  const [showDisable2FA, setShowDisable2FA] = useState(false);
  const [removePassword, setRemovePassword] = useState("");
  const [removeLoading, setRemoveLoading] = useState(false);
  const [removeError, setRemoveError] = useState("");

  const handlePasswordSubmit = async () => {
    if (!password) {
      setError("Password is required");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error } = await authClient.twoFactor.enable({
        password: password,
      });

      if (error) {
        throw new Error(error.message || "Failed to enable 2FA");
      }

      if (data) {
        setTotpUri(data.totpURI);
        setBackupCodes(data.backupCodes || []);
        setHasEnteredPassword(true);
      }

      // 2FA will be enabled after verification, so we'll update this after successful verification
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to enable 2FA. Please check your password.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setShowTOTPSetup(false);
    setHasEnteredPassword(false);
    setPassword("");
    setError("");
    setTotpUri("");
    setBackupCodes([]);
    setVerificationCode("");
  };

  const handleRegenerateBackupCodes = async () => {
    if (!regeneratePassword) {
      setRegenerateError("Password is required");
      return;
    }

    setRegenerateLoading(true);
    setRegenerateError("");

    try {
      const { data, error } = await authClient.twoFactor.generateBackupCodes({
        password: regeneratePassword,
      });

      if (error) {
        throw new Error(error.message || "Failed to regenerate backup codes");
      }

      if (data) {
        setBackupCodes(data.backupCodes || []);
        // Backup codes regenerated successfully, 2FA remains enabled
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to regenerate backup codes. Please check your password.";
      setRegenerateError(errorMessage);
    } finally {
      setRegenerateLoading(false);
    }
  };

  const handleCancelRegenerate = () => {
    setShowRegenerateBackupCodes(false);
    setRegeneratePassword("");
    setRegenerateError("");
    setBackupCodes([]);
  };

  const downloadBackupCodes = () => {
    if (backupCodes.length === 0) return;

    const content = `ExpressThat - Two-Factor Authentication Backup Codes
Generated on: ${new Date().toLocaleString()}

Keep these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join("\n")}

Important Notes:
- Each backup code can only be used once
- These codes are equivalent to your authenticator app codes
- Store them securely and don't share them with anyone
- If you regenerate backup codes, these codes will no longer work`;

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ExpressThat-Backup-Codes.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRemove2FA = async () => {
    if (!removePassword) {
      setRemoveError("Password is required");
      return;
    }

    setRemoveLoading(true);
    setRemoveError("");

    try {
      const { error } = await authClient.twoFactor.disable({
        password: removePassword,
      });

      if (error) {
        throw new Error(error.message || "Failed to disable 2FA");
      }

      // Successfully disabled 2FA
      setIs2FAEnabled(false);
      handleCancelRemove2FA();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to disable 2FA. Please check your password.";
      setRemoveError(errorMessage);
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleCancelRemove2FA = () => {
    setShowDisable2FA(false);
    setRemovePassword("");
    setRemoveError("");
  };

  return (
    <div className="bg-base-200 rounded-lg p-4">
      <h3 className="font-semibold mb-4 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          aria-hidden="true"
          data-slot="icon"
          className="h-5 w-5 mr-2"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z"
          ></path>
        </svg>
        Two-Factor Authentication
      </h3>
      <div className="space-y-4">
        {/* TOTP Authenticator App Section */}
        <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
          <div>
            <p className="font-medium">Authenticator App (TOTP)</p>
            <p className="text-sm text-base-content/60">
              {hasPassword
                ? "Use an authenticator app like Google Authenticator or Authy."
                : "You must set a password before enabling two-factor authentication."}
            </p>
          </div>
          <button
            onClick={() => {
              if (is2FAEnabled) {
                setShowDisable2FA(true);
              } else {
                setShowTOTPSetup(true);
              }
            }}
            className={`btn ${is2FAEnabled ? "btn-secondary" : "btn-primary"}`}
            disabled={!hasPassword && !is2FAEnabled}
          >
            {is2FAEnabled ? "Disable" : "Enable"}
          </button>
        </div>
        {!hasPassword && !is2FAEnabled && (
          <div className="p-3 bg-warning/10 rounded-lg border border-warning/20">
            <p className="text-sm text">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-4 h-4 inline mr-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                />
              </svg>
              Please set a password first before enabling two-factor
              authentication. This ensures your account remains secure even if
              you lose access to your authenticator device.
            </p>
          </div>
        )}
        {showTOTPSetup && !hasEnteredPassword && (
          <div className="bg-base-100 rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Enter Password to Continue</h4>
            {error && (
              <div className="alert alert-error">
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
                <span>{error}</span>
              </div>
            )}
            <PasswordInput
              label="Current Password"
              placeholder="Enter your password"
              value={password}
              onChange={(value) => {
                setPassword(value);
                if (error) setError("");
              }}
              required
              showStrengthIndicator={false}
            />
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                type="button"
                className="btn btn-outline flex-1"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handlePasswordSubmit}
                type="button"
                className="btn btn-primary flex-1"
                disabled={!password || loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Continue
                  </>
                ) : (
                  "Continue"
                )}
              </button>
            </div>
          </div>
        )}
        {/* Enabled TOTP Section */}
        {showTOTPSetup && hasEnteredPassword && (
          <div className="bg-base-100 rounded-lg p-4 space-y-4">
            <h4 className="font-medium flex items-center">
              Setup Authenticator App
            </h4>
            <div className="flex flex-col items-center space-y-4">
              <div className="w-48 h-48 bg-white border-2 border-base-300 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  {totpUri ? (
                    <QRCode value={totpUri} className="w-44" />
                  ) : (
                    <div className="text-center text-base-content/60">
                      <div className="loading loading-spinner loading-lg"></div>
                      <p className="mt-2">Loading QR Code...</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-center max-w-md">
                <p className="text-sm text-base-content/60 mb-2">
                  Scan this QR code with your authenticator app (Google
                  Authenticator, Authy, etc.)
                </p>
                {totpUri && (
                  <p className="text-xs text-base-content/40">
                    Can&apos;t scan? Manual entry key:{" "}
                    <code className="bg-base-200 px-1 rounded">
                      {totpUri.split("secret=")[1]?.split("&")[0] || ""}
                    </code>
                  </p>
                )}
              </div>
            </div>

            {/* Backup Codes */}
            {backupCodes.length > 0 && (
              <div className="bg-base-200 rounded-lg p-4">
                <h5 className="font-medium mb-2 text-warning">
                  ⚠️ Save Your Backup Codes
                </h5>
                <p className="text-sm text-base-content/60 mb-3">
                  Store these backup codes in a safe place. You can use them to
                  access your account if you lose your authenticator device.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {backupCodes.map((code, index) => (
                    <code
                      key={index}
                      className="bg-base-100 p-2 rounded text-center text-sm"
                    >
                      {code}
                    </code>
                  ))}
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={downloadBackupCodes}
                    className="btn btn-outline btn-sm mt-3"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="w-4 h-4"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                      />
                    </svg>
                    Download as .txt file
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              {error && (
                <div className="alert alert-error">
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
                  <span>{error}</span>
                </div>
              )}
              <div className="form-control">
                <label className="label">
                  <span className="label-text">Verification Code</span>
                </label>
                <input
                  placeholder="Enter 6-digit code"
                  className="input input-bordered w-full text-center text-lg tracking-widest"
                  maxLength={6}
                  required
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    setVerificationCode(e.target.value);
                    if (error) setError("");
                  }}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCancel}
                  type="button"
                  className="btn btn-outline flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary flex-1"
                  disabled={verificationCode.length !== 6}
                  onClick={async () => {
                    setLoading(true);
                    setError("");
                    try {
                      const { error } = await authClient.twoFactor.verifyTotp({
                        code: verificationCode,
                      });

                      if (error) {
                        throw new Error(error.message || "Verification failed");
                      }

                      setIs2FAEnabled(true);

                      // Successfully enabled 2FA
                      handleCancel();
                    } catch (err: unknown) {
                      const errorMessage =
                        err instanceof Error
                          ? err.message
                          : "Failed to verify 2FA code.";
                      setError(errorMessage);
                    } finally {
                      setLoading(false);
                    }
                  }}
                >
                  Verify &amp; Enable
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Regenerate Backup Codes Section */}
        {is2FAEnabled && hasPassword && (
          <div className="flex items-center justify-between p-3 bg-base-100 rounded-lg">
            <div>
              <p className="font-medium">Regenerate Backup Codes</p>
              <p className="text-sm text-base-content/60">
                Generate new backup codes if you have lost access to your
                current ones.
              </p>
            </div>
            <button
              onClick={() => setShowRegenerateBackupCodes(true)}
              className="btn btn-sm btn-secondary"
            >
              Regenerate
            </button>
          </div>
        )}

        {showRegenerateBackupCodes && (
          <div className="bg-base-100 rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Regenerate Backup Codes</h4>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 dark:bg-orange-900/20 dark:border-orange-700">
              <p className="text-sm text-red-800 dark:text-orange-200">
                ⚠️ <strong>Warning:</strong> Regenerating backup codes will
                invalidate your current backup codes. Make sure to save the new
                codes securely.
              </p>
            </div>
            <p className="text-sm text-base-content/60">
              You can regenerate your backup codes if you have lost access to
              current codes. Enter your password to generate new backup codes.
            </p>

            {/* Show password form only if codes haven't been generated */}
            {backupCodes.length === 0 && (
              <>
                {regenerateError && (
                  <div className="alert alert-error">
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
                    <span>{regenerateError}</span>
                  </div>
                )}

                <PasswordInput
                  label="Current Password"
                  placeholder="Enter your password"
                  value={regeneratePassword}
                  onChange={(value) => {
                    setRegeneratePassword(value);
                    if (regenerateError) setRegenerateError("");
                  }}
                  required
                  showStrengthIndicator={false}
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleCancelRegenerate}
                    type="button"
                    className="btn btn-outline flex-1"
                    disabled={regenerateLoading}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRegenerateBackupCodes}
                    type="button"
                    className="btn btn-secondary flex-1"
                    disabled={!regeneratePassword || regenerateLoading}
                  >
                    {regenerateLoading ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Regenerating...
                      </>
                    ) : (
                      "Regenerate Codes"
                    )}
                  </button>
                </div>
              </>
            )}

            {/* Show success dialog when codes are generated */}
            {backupCodes.length > 0 && (
              <div className="bg-success/10 border border-success/20 rounded-lg p-4">
                <div className="text-center mb-4">
                  <div className="text-success text-4xl mb-2">✅</div>
                  <h5 className="font-semibold text-lg text-success">
                    New Backup Codes Generated Successfully!
                  </h5>
                  <p className="text-sm text-base-content/60 mt-2">
                    Save these new backup codes in a safe place. Your old backup
                    codes are no longer valid.
                  </p>
                </div>

                <div className="bg-base-200 rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <code
                        key={index}
                        className="bg-base-100 p-2 rounded text-center text-sm"
                      >
                        {code}
                      </code>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex justify-center">
                    <button
                      onClick={downloadBackupCodes}
                      className="btn btn-outline btn-sm"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
                        />
                      </svg>
                      Download as .txt file
                    </button>
                  </div>

                  <button
                    onClick={handleCancelRegenerate}
                    type="button"
                    className="btn btn-primary"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Disable 2FA Dialog */}
        {showDisable2FA && (
          <div className="bg-base-100 rounded-lg p-4 space-y-4">
            <h4 className="font-medium text-error">
              Disable Two-Factor Authentication
            </h4>
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 dark:bg-red-900/20 dark:border-red-700">
              <p className="text-sm text-red-800 dark:text-red-200">
                ⚠️ <strong>Security Warning:</strong> Disabling two-factor
                authentication will significantly reduce your account security.
                Your account will only be protected by your password, making it
                more vulnerable to unauthorized access.
              </p>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 dark:bg-yellow-900/20 dark:border-yellow-700">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Before you continue:</strong>
              </p>
              <ul className="text-sm text-yellow-800 dark:text-yellow-200 mt-2 ml-4 list-disc">
                <li>
                  Make sure you have access to your account recovery options
                </li>
                <li>Consider if this action is really necessary</li>
                <li>You can always re-enable 2FA later for better security</li>
              </ul>
            </div>
            <p className="text-sm text-base-content/60">
              Enter your current password to confirm disabling two-factor
              authentication.
            </p>

            {removeError && (
              <div className="alert alert-error">
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
                <span>{removeError}</span>
              </div>
            )}

            <PasswordInput
              label="Current Password"
              placeholder="Enter your password to confirm"
              value={removePassword}
              onChange={(value) => {
                setRemovePassword(value);
                if (removeError) setRemoveError("");
              }}
              required
              showStrengthIndicator={false}
            />

            <div className="flex gap-3">
              <button
                onClick={handleCancelRemove2FA}
                type="button"
                className="btn btn-outline flex-1"
                disabled={removeLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleRemove2FA}
                type="button"
                className="btn btn-error flex-1"
                disabled={!removePassword || removeLoading}
              >
                {removeLoading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Disabling...
                  </>
                ) : (
                  "Disable 2FA"
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
