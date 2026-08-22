import { Anton, Inter } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import ChatWidget from "@/components/ChatWidget";

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
  title: "Viza Click — Agência de Inteligência Artificial",
  description:
    "Chatbots, automações e presença digital construídos com IA para profissionais liberais e pequenas empresas venderem todos os dias.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" className={`${anton.variable} ${inter.variable}`}>
      <body>
        <SmoothScroll />
        {children}
        <ChatWidget />
      </body>
    </html>
  );
}
