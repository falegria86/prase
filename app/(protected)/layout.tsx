import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "PRASE",
  description: "Sistema administrador de seguros",
};

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Sidebar />
      <main className="p-8 ml-64 bg-gray-100 min-h-screen">
        {children}
      </main>
    </div>
  );
}
