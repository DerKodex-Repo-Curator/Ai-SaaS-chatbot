"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

type RegisteredUser = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  lastLogin: string | null;
};

export function RegisteredUsers() {
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/auth/users");
      const data = (await response.json()) as { users?: RegisteredUser[] };

      if (!response.ok) {
        setError("Could not load users from MongoDB Atlas.");
        return;
      }

      setUsers(data.users ?? []);
    } catch {
      setError("Could not reach the users API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-950/40 shadow-[0_20px_60px_rgba(2,6,23,0.18)]">
      <div className="flex flex-col gap-3 border-b border-slate-700 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
            <Users className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <p className="font-semibold">MongoDB Atlas Users</p>
            <p className="text-sm text-slate-400">
              {users.length} saved user{users.length === 1 ? "" : "s"}
            </p>
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={loadUsers}
          className="border-slate-600 bg-slate-900/70 text-slate-100"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {error ? (
        <div className="px-4 py-5 text-sm text-rose-300">{error}</div>
      ) : null}

      {isLoading ? (
        <div className="px-4 py-5 text-sm text-slate-400">
          Loading users from MongoDB Atlas...
        </div>
      ) : null}

      {!isLoading && !error && users.length === 0 ? (
        <div className="px-4 py-5 text-sm text-slate-400">
          No registered users yet.
        </div>
      ) : null}

      {!isLoading && !error && users.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-700 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Created</th>
                <th className="px-4 py-3 font-medium">Last Login</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="text-slate-200">
                  <td className="px-4 py-4 font-medium">{user.name}</td>
                  <td className="px-4 py-4 text-slate-300">{user.email}</td>
                  <td className="px-4 py-4 text-slate-400">
                    {new Date(user.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-4 text-slate-400">
                    {user.lastLogin
                      ? new Date(user.lastLogin).toLocaleString()
                      : "Never"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
