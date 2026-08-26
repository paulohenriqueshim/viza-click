import { Anton, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
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
  title: "Viza Click | Automação e IA para pequenas empresas",
  description:
    "Transformamos os processos manuais da sua empresa em sistemas que atendem, organizam e executam sozinhos. Automação e agentes de IA para pequenas empresas e profissionais liberais.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${inter.variable}`}>
      <body>
        <Preloader />
        <SmoothScroll />
        {children}
        <ChatWidget />
        <AnimatedCopy />
        <CustomCursor />
      </body>
    </html>
  );
}
