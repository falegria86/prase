// layout.tsx
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { currentUser } from "@/lib/auth";
import { ProtectedRouteWrapper } from "@/components/auth/ProtectedWrapper";
import { cn } from "@/lib/utils";

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
      <Sidebar aplicaciones={userData?.aplicaciones || []} />
      <main className={cn(
        "p-4 transition-all duration-300 ease-in-out min-h-screen",
        "xl:p-8 xl:ml-64"
      )}>
        <ProtectedRouteWrapper aplicaciones={userData?.aplicaciones || []}>
          {children}
        </ProtectedRouteWrapper>
      </main>
    </div>
  );
}