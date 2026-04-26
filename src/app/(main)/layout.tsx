import Navbar from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import { FavoritProvider } from "@/context/FavoritContext";
import "leaflet/dist/leaflet.css";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <FavoritProvider>
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </FavoritProvider>
  );
}
