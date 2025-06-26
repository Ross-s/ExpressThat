"use client";

import { useState, forwardRef } from "react";
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

interface PasswordInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  disabled?: boolean;
  showStrengthIndicator?: boolean;
  name?: string;
  className?: string;
  error?: string;
  id?: string;
}

// Password strength calculation function
const getPasswordStrength = (password: string): PasswordStrength => {
  if (!password) return { score: 0, label: "", color: "" };

  let score = 0;
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    numbers: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  score = Object.values(checks).filter(Boolean).length;

  if (score === 0) return { score: 0, label: "", color: "" };
  if (score <= 2) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score <= 3) return { score: 2, label: "Fair", color: "bg-yellow-500" };
  if (score <= 4) return { score: 3, label: "Good", color: "bg-blue-500" };
  return { score: 4, label: "Strong", color: "bg-green-500" };
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      placeholder = "Enter password",
      value,
      onChange,
      onBlur,
      required = false,
      disabled = false,
      showStrengthIndicator = false,
      name,
      className = "",
      error,
      id,
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const passwordStrength = getPasswordStrength(value);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(e.target.value);
    };

    const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
    };

    return (
      <div className={`space-y-2 ${className}`}>
        {label && <Label htmlFor={id}>{label}</Label>}
        <div className="relative">
          <Input
            ref={ref}
            id={id}
            type={showPassword ? "text" : "password"}
            name={name}
            placeholder={placeholder}
            className={`pl-10 pr-12 min-h-[48px] ${
              error ? "border-red-500 focus-visible:ring-red-500" : ""
            }`}
            value={value}
            onChange={handleInputChange}
            onBlur={onBlur}
            required={required}
            disabled={disabled}
          />
          <LockClosedIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
          <button
            type="button"
            className="absolute right-3 top-3 w-6 h-6 flex items-center justify-center z-10 hover:bg-gray-100 rounded"
            onClick={togglePasswordVisibility}
            aria-label={showPassword ? "Hide password" : "Show password"}
            disabled={disabled}
          >
            {showPassword ? (
              <EyeSlashIcon className="h-5 w-5 text-gray-600 hover:text-gray-900" />
            ) : (
              <EyeIcon className="h-5 w-5 text-gray-600 hover:text-gray-900" />
            )}
          </button>
        </div>

        {/* Error Message */}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {/* Password Strength Indicator */}
        {showStrengthIndicator && value && (
          <div className="mt-2 space-y-2">
            {/* Strength Bar */}
            <div className="flex gap-1">
              {[1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={`h-2 flex-1 rounded-full transition-all duration-300 ${
                    level <= passwordStrength.score
                      ? passwordStrength.color
                      : "bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Strength Label */}
            {passwordStrength.label && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-500">Password strength:</span>
                <span
                  className={`font-medium ${
                    passwordStrength.score === 1
                      ? "text-red-600"
                      : passwordStrength.score === 2
                        ? "text-yellow-600"
                        : passwordStrength.score === 3
                          ? "text-blue-600"
                          : "text-green-600"
                  }`}
                >
                  {passwordStrength.label}
                </span>
              </div>
            )}

            {/* Password Requirements */}
            {showStrengthIndicator && passwordStrength.score < 4 && (
              <div className="text-xs text-gray-500 space-y-1">
                <p>Password must contain:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li className={value.length >= 8 ? "text-green-600" : ""}>
                    At least 8 characters
                  </li>
                  <li className={/[A-Z]/.test(value) ? "text-green-600" : ""}>
                    One uppercase letter
                  </li>
                  <li className={/[a-z]/.test(value) ? "text-green-600" : ""}>
                    One lowercase letter
                  </li>
                  <li className={/\d/.test(value) ? "text-green-600" : ""}>
                    One number
                  </li>
                  <li
                    className={
                      /[!@#$%^&*(),.?":{}|<>]/.test(value)
                        ? "text-green-600"
                        : ""
                    }
                  >
                    One special character
                  </li>
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    );
  },
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
export { getPasswordStrength };
export type { PasswordStrength };
