import MobileNav from "@/components/shared/MobileNav";
import NavbarBrand from "@/components/shared/NavbarBrand";
import NavbarDesktopActions from "@/components/shared/NavbarDesktopActions";
import NavbarShell from "@/components/shared/NavbarShell";
import { getCurrentUser } from "@/lib/auth";

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <NavbarShell>
      <div className="container flex h-14 items-center justify-between gap-3 md:h-16 md:gap-4">
        <NavbarBrand />

        <NavbarDesktopActions isLoggedIn={Boolean(user)} userEmail={user?.email} />

        <MobileNav isLoggedIn={Boolean(user)} userEmail={user?.email} />
      </div>
    </NavbarShell>
  );
}
