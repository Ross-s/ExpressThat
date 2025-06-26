"use client";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { forwardRef, useImperativeHandle, useRef } from "react";

export interface TurnstileRef {
  reset: () => void;
}

export const TurnstileWidget = forwardRef<
  TurnstileRef,
  {
    setToken: (token: string) => void;
  }
>(({ setToken }, ref) => {
  const turnstileRef = useRef<TurnstileInstance>(null);

  useImperativeHandle(ref, () => ({
    reset: () => {
      turnstileRef.current?.reset();
    },
  }));

  return (
    <Turnstile
      ref={turnstileRef}
      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
      onSuccess={setToken}
      options={{
        size: "flexible",
      }}
    />
  );
});

TurnstileWidget.displayName = "TurnstileWidget";
