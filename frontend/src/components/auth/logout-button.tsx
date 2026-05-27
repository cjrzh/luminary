'use client';

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return <Button variant="ghost" className="h-8 px-2 text-xs" onClick={logout}><LogOut size={15} />退出</Button>;
}
