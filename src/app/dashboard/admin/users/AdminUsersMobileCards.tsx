"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Database } from "@/types/supabase"

type Territory = Database["public"]["Enums"]["territory"]

interface UserProfile {
  id: string
  territory_code: Territory
  is_admin: boolean | null
  email?: string
  created_at: string
}

type Props = {
  users: UserProfile[]
  isLoading: boolean
  error: string | null
  onEdit: (user: UserProfile) => void
  onResetPassword: (user: UserProfile) => void
  onDelete: (user: UserProfile) => void
}

export function AdminUsersMobileCards({ users, isLoading, error, onEdit, onResetPassword, onDelete }: Props) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16 gap-2 text-text-muted text-sm">
        <div className="w-4 h-4 border-2 border-brand-accent border-t-transparent rounded-full animate-spin" />
        Loading users...
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center text-red-400 font-medium text-sm">{error}</div>
    )
  }

  if (users.length === 0) {
    return (
      <div className="py-12 text-center text-text-meta text-sm">No partners found.</div>
    )
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div key={user.id} className="bg-bg-card border border-border-subtle rounded-xl p-4 space-y-3">
          {/* Email + badges */}
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-text-main truncate">
                {user.email ?? (
                  <span className="font-mono text-xs text-text-meta">{user.id.substring(0, 8)}…</span>
                )}
              </p>
              {user.created_at && (
                <p className="text-xs text-text-meta mt-0.5">
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </p>
              )}
            </div>
            <div className="flex gap-1.5 shrink-0 flex-wrap justify-end">
              {user.is_admin ? (
                <Badge
                  variant="secondary"
                  className="text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                >
                  Admin
                </Badge>
              ) : (
                <Badge variant="outline" className="text-[10px]">Partner</Badge>
              )}
              <Badge
                variant={user.territory_code === "UAE" ? "default" : "outline"}
                className="text-[10px] font-mono"
              >
                {user.territory_code}
              </Badge>
            </div>
          </div>

          {/* Action buttons — only for non-admin users */}
          {!user.is_admin && (
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(user)}
                className="text-xs border-border-subtle text-text-main h-10"
              >
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onResetPassword(user)}
                className="text-xs border-[#FF4C4C]/30 text-[#FF4C4C] hover:bg-[#FF4C4C]/10 h-10"
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => onDelete(user)}
                className="text-xs bg-[#FF4C4C] hover:bg-[#e04444] text-white h-10"
              >
                Delete
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
