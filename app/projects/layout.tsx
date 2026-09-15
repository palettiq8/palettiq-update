import { redirect } from "next/navigation";
import { createClient, getUser } from "@/utils/supabase/server";
import Header from "@/components/projects/Header";
import type { AuthUser } from "@/utils/types";

export default async function ProjectsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const user = await getUser();

  if (!user) {
    redirect("/auth/signin");
  }

  const { data: profile } = await supabase
    .from("users")
    .select("username, email")
    .eq("id", user.id)
    .single();

  const headerUser: AuthUser = {
    id: user.id,
    email: user.email ?? profile?.email ?? "",
    username: profile?.username ?? user.user_metadata?.username ?? null,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header user={headerUser} />
      {children}
    </div>
  );
}
