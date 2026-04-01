import { createClient } from "@/utils/supabase/server"
import { checkIsAdminBoolean } from "@/app/dashboard/actions/admin"
import { TrainingClient } from "./TrainingClient"

export default async function TrainingHubPage() {
  const supabase = await createClient()

  const [modulesResult, isAdmin] = await Promise.all([
    supabase
      .from('training_hub_videos')
      .select('*')
      .order('created_at', { ascending: false }),
    checkIsAdminBoolean(),
  ])

  return (
    <TrainingClient
      initialModules={(modulesResult.data ?? []) as any}
      isAdmin={isAdmin}
    />
  )
}
