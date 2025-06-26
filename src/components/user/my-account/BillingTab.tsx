"use client";

import { CreditCardIcon } from "@heroicons/react/24/outline";
import { Button } from "@/components/ui/button";

export default function BillingTab() {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="text-center py-8">
        <CreditCardIcon className="h-16 w-16 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Billing & Subscriptions</h3>
        <p className="text-gray-600 mb-6">
          Manage your billing information and subscriptions
        </p>
        <Button>View Billing Portal</Button>
      </div>
    </div>
  );
}
