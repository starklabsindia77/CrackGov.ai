import { requireAuth } from "@/lib/auth";
import { AppLayout as AppLayoutComponent } from "@/components/layout/app-layout";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAuth();
  return <AppLayoutComponent>{children}</AppLayoutComponent>;
}

