# My Account Components

This folder contains the modular account settings dialog components, split into separate files for better maintainability and reusability.

## Structure

```
my-account/
├── index.ts              # Main export file
├── MyAccount.tsx          # Main dialog component and tab orchestrator
├── ProfileTab.tsx         # Profile management tab
├── SecurityTab.tsx        # Password and security settings tab
├── BillingTab.tsx         # Billing and subscription management tab
└── DangerTab.tsx         # Account deletion and danger zone tab
```

## Components

### MyAccount.tsx

The main dialog component that:

- Manages the modal state and animations
- Handles tab navigation
- Coordinates error/success message display
- Fetches user session data
- Renders the appropriate tab component

### ProfileTab.tsx

Handles profile information:

- Full name editing
- Email display (read-only)
- Profile update functionality
- Form validation and submission

### SecurityTab.tsx

Manages security settings:

- Password change with strength indicator
- Current password verification
- Two-factor authentication setup (UI ready)
- Password visibility toggles

### BillingTab.tsx

Billing and subscription management:

- Billing portal access
- Subscription overview (ready for Stripe integration)

### DangerTab.tsx

Account deletion and critical actions:

- Password-protected account deletion
- Confirmation text requirement
- Warning messages and safety checks

## Usage

```tsx
import MyAccount from "@/components/user/my-account";

function App() {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <button onClick={() => setShowSettings(true)}>Account Settings</button>

      <MyAccount isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
}
```

## Features

- ✅ Modular and maintainable code structure
- ✅ TypeScript with proper type definitions
- ✅ Consistent design with auth pages
- ✅ Better Auth integration
- ✅ Form validation and error handling
- ✅ Responsive design
- ✅ Smooth animations and transitions
- ✅ Accessibility features

## Dependencies

- React 18+
- Better Auth
- Heroicons
- shadcn/ui
- Tailwind CSS
