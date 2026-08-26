import FluidBackground from "@/components/FluidBackground";
import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Manifesto from "@/components/Manifesto";
import Servicos from "@/components/Servicos";
import ComoFunciona from "@/components/ComoFunciona";
import Projetos from "@/components/Projetos";
import Fundador from "@/components/Fundador";
import CtaFinal from "@/components/CtaFinal";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <FluidBackground />
      <Header />
      <main>
        <Hero />
        <Manifesto />
        <Servicos />
        <ComoFunciona />
        <Projetos />
        <Fundador />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
