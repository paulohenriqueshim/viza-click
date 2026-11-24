import Header from "@/components/Header";
import Hero from "@/components/Hero";
import ComoFunciona from "@/components/ComoFunciona";
import Servicos from "@/components/Servicos";
import Lia from "@/components/Lia";
import Projetos from "@/components/Projetos";
import Fundador from "@/components/Fundador";
import CtaFinal from "@/components/CtaFinal";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <ComoFunciona />
        <Servicos />
        <Lia />
        <Projetos />
        <Fundador />
        <CtaFinal />
      </main>
      <Footer />
    </>
  );
}
