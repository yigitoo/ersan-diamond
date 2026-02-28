import { Navbar } from "@/components/public/navbar";
import { Footer } from "@/components/public/footer";
import { WishlistProvider } from "@/lib/wishlist/wishlist-context";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <WishlistProvider>
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </WishlistProvider>
  );
}
