import { UserRound } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { authConfig } from "@/lib/auth";

export function UserAccount() {
  const { username } = authConfig();

  return (
    <div className="flex items-center gap-3 rounded-md border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-zinc-300">
      <span className="inline-flex items-center gap-2">
        <UserRound size={16} className="text-amber-300" />
        <span className="text-zinc-500">当前用户</span>
        <span className="font-medium text-zinc-100">{username}</span>
      </span>
      <LogoutButton />
    </div>
  );
}
