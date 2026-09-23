"use client";
import { useState, useTransition } from "react";
import type { EventTeamMember } from "@/lib/types";
import { TEAM_ROLES } from "@/lib/types";
import { inviteTeamMember, removeTeamMember } from "@/app/dashboard/actions";

export function TeamClient({ inviteId, isOwner, members }: { inviteId: string; isOwner: boolean; members: EventTeamMember[] }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<EventTeamMember["role"]>("planner");
  const [msg, setMsg] = useState("");
  const [pending, start] = useTransition();

  function add(e: React.FormEvent) {
    e.preventDefault();
    start(async () => {
      const r = await inviteTeamMember(inviteId, email, role);
      if (r?.error) setMsg(r.error);
      else {
        setEmail("");
        setMsg("Invited. They'll get access as soon as they sign in with that email.");
      }
    });
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-5 py-8 sm:px-8">
      <h1 className="text-2xl font-medium">Event team</h1>
      <p className="mt-1 text-sm" style={{ color: "var(--ink-2)" }}>
        Weddings are rarely run by one person. Anyone you add here gets full access to this event once they sign in.
      </p>

      {isOwner ? (
        <form onSubmit={add} className="card mt-6 grid gap-3 p-5 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          <div className="field">
            <label htmlFor="tm-email">Email</label>
            <input id="tm-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="cousin@example.com" required />
          </div>
          <div className="field">
            <label htmlFor="tm-role">Role</label>
            <select id="tm-role" value={role} onChange={(e) => setRole(e.target.value as EventTeamMember["role"])}>
              {Object.entries(TEAM_ROLES).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={pending || !email.trim()}>
            Invite
          </button>
        </form>
      ) : (
        <p className="card mt-6 p-5 text-sm" style={{ color: "var(--ink-2)" }}>
          Only the event owner can invite or remove people.
        </p>
      )}

      {msg && (
        <p className="mt-4 text-sm" style={{ color: "var(--ink-2)" }}>
          {msg}
        </p>
      )}

      <ul className="card mt-6 divide-y" style={{ borderColor: "var(--line)" }}>
        {members.length === 0 && (
          <li className="px-4 py-8 text-center text-sm" style={{ color: "var(--ink-2)" }}>
            It's just you so far.
          </li>
        )}
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-4 px-4 py-3">
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium">{m.email}</span>
              <span className="block text-xs" style={{ color: "var(--ink-2)" }}>
                {TEAM_ROLES[m.role].label} · {TEAM_ROLES[m.role].blurb}
              </span>
            </span>
            <span
              className="shrink-0 rounded-full px-2.5 py-1 text-xs font-medium"
              style={{ background: m.accepted_user_id ? "#e3f3e6" : "var(--paper-2)", color: m.accepted_user_id ? "#1f6b34" : "var(--ink-2)" }}
            >
              {m.accepted_user_id ? "Active" : "Pending"}
            </span>
            {isOwner && (
              <button type="button" className="btn-secondary" onClick={() => start(async () => void (await removeTeamMember(inviteId, m.id)))} aria-label={`Remove ${m.email}`}>
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
