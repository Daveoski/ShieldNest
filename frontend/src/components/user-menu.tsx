"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, UserRound } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

/** "Sign in" when signed out; an avatar menu with Account and Sign out when signed in. */
export function UserMenu() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending) {
    return <span className="skeleton size-8 rounded-full" aria-hidden />;
  }

  if (!session) {
    return (
      <Link id="tour-sign-in" href="/sign-in" className={buttonVariants({ variant: "ghost", size: "lg" })}>
        <LogIn />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    );
  }

  const { user } = session;
  const initial = (user.name || user.email).charAt(0).toUpperCase();

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="dropdown dropdown-end">
      <div
        tabIndex={0}
        role="button"
        aria-label="Account menu"
        className="grid size-9 place-items-center overflow-hidden rounded-full bg-primary/15 font-semibold text-primary ring-1 ring-primary/30"
      >
        {user.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.image} alt="" className="size-full object-cover" referrerPolicy="no-referrer" />
        ) : (
          initial
        )}
      </div>
      <ul tabIndex={0} className="dropdown-content menu z-50 mt-3 w-60 rounded-box border border-border bg-popover p-2 shadow-xl">
        <li className="menu-title truncate">
          <span className="truncate text-foreground">{user.name}</span>
          <span className="truncate text-xs font-normal">{user.email}</span>
        </li>
        <li>
          <Link href="/account">
            <UserRound className="size-4" /> Account
          </Link>
        </li>
        <li>
          <button type="button" onClick={signOut}>
            <LogOut className="size-4" /> Sign out
          </button>
        </li>
      </ul>
    </div>
  );
}
