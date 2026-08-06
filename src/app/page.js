import GalaxyBackground from "@/components/GalaxyBackground";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Sobre from "@/components/Sobre";
import Servicos from "@/components/Servicos";
import Projetos from "@/components/Projetos";
import CtaFinal from "@/components/CtaFinal";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <GalaxyBackground />
      <Header />
      <main>
        <Hero />
        <Sobre />
        <Servicos />
        <Projetos />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
