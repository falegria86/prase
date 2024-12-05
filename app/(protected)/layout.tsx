// layout.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { currentUser } from "@/lib/auth";
import { ProtectedRouteWrapper } from "@/components/auth/ProtectedWrapper";

export const metadata: Metadata = {
  title: "PRASE",
  description: "Sistema administrador de seguros",
};

export default async function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const userData = await currentUser();
  
  if (!userData) {
    redirect("/login");
  }

  return (
    <div>
      <Sidebar aplicaciones={userData?.aplicaciones || []}/>
      <main className="p-8 ml-64 bg-gray-100 min-h-screen">
        <ProtectedRouteWrapper aplicaciones={userData?.aplicaciones || []}>
          {children}
        </ProtectedRouteWrapper>
      </main>
    </div>
  );
}