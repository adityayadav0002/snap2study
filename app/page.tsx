import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { Analytics } from "@vercel/analytics/next"

export default function Home() {
  return (
    <main className="min-h-screen bg-(--cream)">
      <Navbar />
      <Hero />
      <Analytics/>
    </main>
  );
}