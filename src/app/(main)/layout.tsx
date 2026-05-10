import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { FavoritProvider } from "@/context/FavoritContext";
import { getCurrentUser } from "@/lib/auth";
import "leaflet/dist/leaflet.css";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const isAuthenticated = !!user;

  return (
    <FavoritProvider isAuthenticated={isAuthenticated}>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </FavoritProvider>
  );
}
