"use client";

import { CreditCardIcon } from "@heroicons/react/24/outline";

export default function BillingTab() {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center py-8">
        <CreditCardIcon className="h-16 w-16 mx-auto text-base-content/40 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Billing & Subscriptions</h3>
        <p className="text-base-content/70 mb-6">
          Manage your billing information and subscriptions
        </p>
        <button className="btn btn-primary">View Billing Portal</button>
      </div>
    </div>
  );
}
