/**
 * BeforeLoginHeader component renders the header for users who are not logged in.
 * - Displays a search bar (SearchBarClub) on all routes except the home route.
 * - Provides 'Sign In' and 'Sign Up' buttons that trigger dialog modals for login and signup respectively.
 * - Uses Redux hooks to dispatch actions to open the login or signup dialog.
 * - Conditionally renders the search bar based on the current route (`/` or `/kofuku-social`).
 * - Utilizes the `Button` component for consistent styling and functionality of buttons.
 */

import { useRouter } from 'next/router';

import Button from '@/components/Utility/Button';
import SearchBarClub from '@/components/Utility/SearchBarComponents/SearchBarClub';
import { useAppDispatch } from '@/Hooks/useRedux';
import { toggleLoginDialog, toggleSignupDialog } from '@/state/Slices/dialog';

function BeforeLoginHeader() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const { pathname } = router;
  const isHomeRoute = pathname === '/' || pathname === '/kofuku-social';

  return (
    <div className="flex items-center justify-center gap-2 lg:gap-3">
      {isHomeRoute ? null : <SearchBarClub />}

      <Button
        width="w-max"
        type="secondary"
        size="lg"
        onClick={() => dispatch(toggleLoginDialog(true))}
      >
        <div>Sign In</div>
      </Button>
      <Button
        width="w-max"
        size="lg"
        onClick={() => dispatch(toggleSignupDialog(true))}
      >
        <div>Sign Up</div>
      </Button>
    </div>
  );
}

export default BeforeLoginHeader;
