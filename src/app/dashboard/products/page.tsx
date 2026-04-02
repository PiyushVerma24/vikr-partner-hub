import { createClient } from "@/utils/supabase/server"
import { checkIsAdminBoolean } from "@/app/dashboard/actions/admin"
import { ProductsClient } from "./ProductsClient"

export default async function ProductsPage() {
  const supabase = await createClient()

  const [productsResult, isAdmin] = await Promise.all([
    supabase
      .from('products')
      .select(`id, sku, name, description, category, ph_level, usp, features_benefits, applications, ingredients, directions_to_use, product_media(id, media_url, type)`)
      .eq('is_active', true)
      .order('name', { ascending: true }),
    checkIsAdminBoolean(),
  ])

  return (
    <ProductsClient
      initialProducts={(productsResult.data ?? []) as any}
      isAdmin={isAdmin}
    />
  )
}
