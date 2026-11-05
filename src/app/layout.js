import { Anton, Inter } from "next/font/google";
import "./globals.css";
import ChatWidget from "@/components/ChatWidget";
import Preloader from "@/components/Preloader";
import AnimatedCopy from "@/components/AnimatedCopy";
import CustomCursor from "@/components/CustomCursor";

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "Viza Click | Presença digital para pequenas empresas",
  description:
    "Cartão Viza Click, atendimento com IA no seu site, cartão de avaliação no Google, sites e landing pages, automações e sistemas sob medida. A parte digital do seu negócio rodando sozinha.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${inter.variable}`}>
      <body>
        <Preloader />
        {children}
        <ChatWidget />
        <AnimatedCopy />
        <CustomCursor />
      </body>
    </html>
  );
}
