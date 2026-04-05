import React, { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pencil, Trash2 } from "lucide-react"
import { updateProduct, deleteProductMedia, deleteProductDocument } from "@/app/dashboard/actions/admin"

export type EditableProduct = {
    id: string
    sku: string
    name: string
    description: string | null
    category: string | null
    ph_level: number | null
    usp: string | null
    features_benefits: string | null
    applications: string | null
    ingredients: string | null
    directions_to_use: string | null
    product_media?: { id: string, media_url: string, type: string }[]
    documents?: { id: string, title: string, category: string, file_url: string }[]
}

const CATEGORIES = [
    "TOILET & BATHROOM",
    "SURFACE CLEANING",
    "KITCHEN CARE",
    "FABRIC CARE",
    "AIR FRESHNER",
    "INDUSTRIAL",
    "POULTRY FARM",
    "MEDICAL"
]

export function EditProductModal({ products, onSuccess }: { products: EditableProduct[], onSuccess: () => void }) {
    const [isOpen, setIsOpen] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState<string>("")
    const [isSaving, setIsSaving] = useState(false)
    const [mediaFile, setMediaFile] = useState<File | null>(null)

    // Local state for the selected product form
    const [sku, setSku] = useState("")
    const [name, setName] = useState("")
    const [category, setCategory] = useState("")
    const [phLevel, setPhLevel] = useState("")
    const [description, setDescription] = useState("")
    const [usp, setUsp] = useState("")
    const [features, setFeatures] = useState("")
    const [applications, setApplications] = useState("")
    const [ingredients, setIngredients] = useState("")
    const [directions, setDirections] = useState("")

    const [activeMedia, setActiveMedia] = useState<{ id: string, media_url: string, type: string }[]>([])
    const [activeDocuments, setActiveDocuments] = useState<{ id: string, title: string, category: string, file_url: string }[]>([])

    // When dropdown changes, populate states
    const handleProductSelect = (id: string) => {
        setSelectedProductId(id)
        const active = products.find(p => p.id === id)
        if (active) {
            setMediaFile(null)
            setSku(active.sku || "")
            setName(active.name || "")
            setCategory(active.category || "")
            setPhLevel(active.ph_level !== null ? String(active.ph_level) : "")
            setDescription(active.description || "")
            setUsp(active.usp || "")
            setFeatures(active.features_benefits || "")
            setApplications(active.applications || "")
            setIngredients(active.ingredients || "")
            setDirections(active.directions_to_use || "")
            setActiveMedia(active.product_media || [])
            setActiveDocuments(active.documents || [])
        }
    }

    const handleDeleteMedia = async (mediaId: string) => {
        if (!confirm("Are you sure you want to remove this media?")) return;
        const res = await deleteProductMedia(mediaId);
        if (res.success) {
            setActiveMedia(curr => curr.filter(m => m.id !== mediaId));
            onSuccess();
        } else {
            alert("Failed to delete media: " + res.error);
        }
    }

    const handleDeleteDoc = async (docId: string) => {
        if (!confirm("Are you sure you want to remove this document?")) return;
        const res = await deleteProductDocument(docId);
        if (res.success) {
            setActiveDocuments(curr => curr.filter(d => d.id !== docId));
            onSuccess();
        } else {
            alert("Failed to delete document: " + res.error);
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedProductId || !sku || !name) return
        setIsSaving(true)

        if (mediaFile) {
            try {
                const imgData = new FormData()
                imgData.append("mediaFile", mediaFile)
                imgData.append("product_id", selectedProductId)
                imgData.append("media_type", "Packaging")

                await fetch('/api/upload-media', {
                    method: 'POST',
                    body: imgData
                })
            } catch (err) {
                console.error("Failed to upload new picture during edit", err)
            }
        }

        const formData = new FormData()
        formData.append("id", selectedProductId)
        formData.append("sku", sku)
        formData.append("name", name)
        formData.append("category", category)
        if (phLevel) formData.append("ph_level", phLevel)
        formData.append("description", description)
        formData.append("usp", usp)
        formData.append("features_benefits", features)
        formData.append("applications", applications)
        formData.append("ingredients", ingredients)
        formData.append("directions_to_use", directions)

        const res = await updateProduct(formData)

        if (res.success) {
            alert("Product updated successfully")
            setIsOpen(false)
            onSuccess()
        } else {
            alert(`Error updating product: ${res.error}`)
        }
        setIsSaving(false)
    }

    // Effect to clean up form when opening new dialog
    const handleOpenChange = (open: boolean) => {
        setIsOpen(open)
        if (!open) setSelectedProductId("")
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-fit flex items-center gap-2 border-border-subtle bg-bg-main" title="Edit Products">
                    <Pencil className="w-4 h-4" />
                    Edit Product
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl p-6 bg-bg-card border-border-subtle max-h-[90vh] overflow-y-auto">
                <DialogHeader className="mb-4">
                    <DialogTitle className="text-2xl font-bold">Edit Product Details</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="productSelect">Select a Product to Edit</Label>
                        <Select value={selectedProductId} onValueChange={handleProductSelect}>
                            <SelectTrigger id="productSelect">
                                <SelectValue placeholder="Choose a product from catalog..." />
                            </SelectTrigger>
                            <SelectContent>
                                {products.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {selectedProductId && (
                        <form onSubmit={handleUpdate} className="space-y-6 pt-4 border-t border-border-subtle">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="sku">SKU</Label>
                                    <Input id="sku" value={sku} onChange={e => setSku(e.target.value)} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="phLevel">pH Level</Label>
                                    <Input id="phLevel" type="number" step="0.1" min="0" max="14" value={phLevel} onChange={e => setPhLevel(e.target.value)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Product Name</Label>
                                <Input id="name" value={name} onChange={e => setName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Select value={category} onValueChange={setCategory} required>
                                    <SelectTrigger id="category">
                                        <SelectValue placeholder="Select a category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {CATEGORIES.map(cat => (
                                            <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border-subtle">
                                <h4 className="text-sm font-semibold text-text-main">Linked Media</h4>
                                {activeMedia.length > 0 ? (
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {activeMedia.map(m => (
                                            <div key={m.id} className="relative group rounded-md border border-border-subtle bg-white overflow-hidden aspect-square flex items-center justify-center">
                                                <img src={m.media_url} alt={m.type} className="max-w-full max-h-full object-contain p-2" />
                                                <button type="button" onClick={() => handleDeleteMedia(m.id)} className="absolute top-1 right-1 bg-red-500/90 hover:bg-red-600 text-white rounded p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-xs text-text-muted">No media linked to this product.</p>}

                                <div className="space-y-2 mt-2">
                                    <Label htmlFor="mediaFile">Upload New Picture (Optional)</Label>
                                    <Input id="mediaFile" type="file" accept="image/*" className="cursor-pointer" onChange={e => setMediaFile(e.target.files?.[0] || null)} />
                                    <p className="text-xs text-text-muted mt-1">Uploading a new picture will add it to the product's active image rotation.</p>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-border-subtle pb-4 border-b">
                                <h4 className="text-sm font-semibold text-text-main">Linked Documents</h4>
                                {activeDocuments.length > 0 ? (
                                    <div className="space-y-2 flex flex-col">
                                        {activeDocuments.map(d => (
                                            <div key={d.id} className="flex justify-between items-center p-3 border border-border-subtle rounded-md bg-bg-hover">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-text-main line-clamp-1">{d.title}</span>
                                                    <span className="text-[10px] text-text-muted uppercase tracking-wider">{d.category}</span>
                                                </div>
                                                <Button type="button" variant="destructive" size="icon" className="h-8 w-8 shrink-0" onClick={() => handleDeleteDoc(d.id)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : <p className="text-xs text-text-muted">No documents linked to this product.</p>}
                            </div>

                            <div className="space-y-2 pt-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" className="min-h-[80px]" value={description} onChange={e => setDescription(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="usp">USP (Unique Selling Proposition)</Label>
                                <Textarea id="usp" className="min-h-[80px]" value={usp} onChange={e => setUsp(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="features">Features & Benefits</Label>
                                <Textarea id="features" className="min-h-[80px]" value={features} onChange={e => setFeatures(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="applications">Applications</Label>
                                <Textarea id="applications" className="min-h-[80px]" value={applications} onChange={e => setApplications(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="ingredients">Ingredients</Label>
                                <Textarea id="ingredients" className="min-h-[80px]" value={ingredients} onChange={e => setIngredients(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="directions">Directions for Use</Label>
                                <Textarea id="directions" className="min-h-[80px]" value={directions} onChange={e => setDirections(e.target.value)} />
                            </div>

                            <Button type="submit" variant="default" className="w-full" disabled={isSaving}>
                                {isSaving ? "Saving details..." : "Save Product Details"}
                            </Button>
                        </form>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
