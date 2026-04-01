import { createClient } from "@/utils/supabase/server"
import { DocumentsClient } from "./DocumentsClient"

export default async function DocumentsPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('documents')
    .select(`*, products(name, sku)`)
    .order('created_at', { ascending: false })

  return <DocumentsClient initialDocuments={(data ?? []) as any} />
}
