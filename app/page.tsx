import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import StudyWorkspace from "@/components/StudyWorkspace";

export default function Home() {
  return (
    <main className="min-h-screen bg-(--cream)">
      <Navbar />

      <Hero />

      <StudyWorkspace />
    </main>
  );
}