import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { LandingPage } from "@/components/landing-page";

export default async function Home() {
  const session = await getServerSession(authOptions);
  
  if (session) {
    // Redirect admin users to admin dashboard
    if (session.user.role === "admin") {
      redirect("/admin/dashboard");
    } else {
      redirect("/app/dashboard");
    }
  }
  
  return <LandingPage />;
}
