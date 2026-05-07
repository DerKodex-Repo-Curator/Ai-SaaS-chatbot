import { Users } from "lucide-react";
import { cookies } from "next/headers";

import { Heading } from "@/components/heading";
import { RegisteredUsers } from "@/components/registered-users";
import { getCookieIsAdmin } from "@/lib/auth/admin";
import { SESSION_COOKIE_NAME } from "@/lib/session/store";

export default async function UsersPage() {
  const cookieStore = await cookies();
  const isAdmin = getCookieIsAdmin(
    cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null,
  );

  if (!isAdmin) {
    return (
      <div className="px-4 lg:px-8">
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/10 p-6 text-rose-200">
          Access Denied
        </div>
      </div>
    );
  }

  return (
    <div>
      <Heading
        title="Registered Users"
        description="Users saved from MongoDB signup and login."
        icon={Users}
        iconColor="text-cyan-500"
        bgcolor="bg-cyan-500/10"
      />
      <div className="px-4 lg:px-8">
        <RegisteredUsers />
      </div>
    </div>
  );
}
