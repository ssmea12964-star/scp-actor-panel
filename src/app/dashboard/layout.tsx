import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/sidebar";
import { Navbar } from "@/components/navbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  return (
    <div className="flex min-h-screen bg-void">
      <div className="fixed inset-0 -z-10 bg-noise-radial" />
      <Sidebar role={session.user.role} />
      <div className="flex flex-1 flex-col">
        <Navbar name={session.user.name ?? "Bilinmeyen"} image={session.user.image} role={session.user.role} />
        <main className="flex-1 p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
