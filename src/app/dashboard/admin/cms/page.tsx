"use client" // Trigger reload

import React, { useState, useEffect } from "react"
import { createProduct, createTrainingModule, createAnnouncement, getProducts, getAnnouncements, archiveAnnouncement, deleteAnnouncement } from "../../actions/admin"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

const REGIONS = ["GLOBAL", "UAE", "KSA", "North America", "Russia", "India"]

export default function AdminCMSPage() {
  // SKU Form State
  const [skuId, setSkuId] = useState("")
  const [skuName, setSkuName] = useState("")
  const [skuCategory, setSkuCategory] = useState("")
  const [phLevel, setPhLevel] = useState("")
  const [skuDescription, setSkuDescription] = useState("")
  const [skuUsp, setSkuUsp] = useState("")
  const [skuFeatures, setSkuFeatures] = useState("")
  const [skuApplications, setSkuApplications] = useState("")
  const [skuIngredients, setSkuIngredients] = useState("")
  const [skuDirections, setSkuDirections] = useState("")
  const [isCreatingSku, setIsCreatingSku] = useState(false)

  // Document Form State
  const [docProductId, setDocProductId] = useState("")
  const [docTitle, setDocTitle] = useState("")
  const [docCategory, setDocCategory] = useState("TDS")
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [selectedRegions, setSelectedRegions] = useState<string[]>([])

  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  // Product Media State
  const [mediaProductId, setMediaProductId] = useState("")
  const [mediaType, setMediaType] = useState("IMAGE")
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [isUploadingMedia, setIsUploadingMedia] = useState(false)

  // Training Module State
  const [trainTitle, setTrainTitle] = useState("")
  const [trainDescription, setTrainDescription] = useState("")
  const [trainVideoUrl, setTrainVideoUrl] = useState("")
  const [trainPdfUrl, setTrainPdfUrl] = useState("")
  const [trainDuration, setTrainDuration] = useState("")
  const [trainCategory, setTrainCategory] = useState("Sales")
  const [trainMarketSegment, setTrainMarketSegment] = useState("Hospitality")
  const [trainSelectedRegions, setTrainSelectedRegions] = useState<string[]>(["GLOBAL"])
  const [isCreatingTraining, setIsCreatingTraining] = useState(false)

  const toggleTrainRegion = (region: string) => {
    setTrainSelectedRegions(curr =>
      curr.includes(region)
        ? curr.filter(r => r !== region)
        : [...curr, region]
    )
  }

  // Announcement State
  const [annTitle, setAnnTitle] = useState("")
  const [annContent, setAnnContent] = useState("")
  const [annAttachmentUrl, setAnnAttachmentUrl] = useState("")
  const [annIsPinned, setAnnIsPinned] = useState(false)
  const [annSelectedRegions, setAnnSelectedRegions] = useState<string[]>(["GLOBAL"])
  const [isCreatingAnn, setIsCreatingAnn] = useState(false)

  // Announcements List State
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [isLoadingAnnouncements, setIsLoadingAnnouncements] = useState(false)


  const toggleAnnRegion = (region: string) => {
    setAnnSelectedRegions(curr =>
      curr.includes(region)
        ? curr.filter(r => r !== region)
        : [...curr, region]
    )
  }

  // Products Data
  const [products, setProducts] = useState<{ id: string, name: string, sku: string, category?: string }[]>([])
  const [dynamicCategories, setDynamicCategories] = useState<string[]>([])

  const fetchProducts = async () => {
    const res = await getProducts()
    if (res.success && res.data) {
      setProducts(res.data as any)
      const cats = Array.from(new Set(res.data.map((p: any) => p.category).filter(Boolean))) as string[]
      setDynamicCategories(cats.sort())
    }
  }

  const fetchAnnouncements = async () => {
    setIsLoadingAnnouncements(true)
    const res = await getAnnouncements()
    if (res.success && res.data) {
      setAnnouncements(res.data as any)
    }
    setIsLoadingAnnouncements(false)
  }

  useEffect(() => {
    fetchProducts()
    fetchAnnouncements()
  }, [])

  const handleCreateSKU = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!skuId || !skuName || !skuCategory) {
      alert("Please fill in all required fields: SKU ID, Product Name, and Category.")
      return
    }

    setIsCreatingSku(true)

    const formData = new FormData()
    formData.append("sku", skuId)
    formData.append("name", skuName)
    formData.append("category", skuCategory)
    if (phLevel) formData.append("ph_level", phLevel)
    formData.append("description", skuDescription)
    formData.append("usp", skuUsp)
    formData.append("features_benefits", skuFeatures)
    formData.append("applications", skuApplications)
    formData.append("ingredients", skuIngredients)
    formData.append("directions_to_use", skuDirections)

    const result = await createProduct(formData)

    if (result.success) {
      alert(`SKU created successfully: ${skuId}`)
      setSkuId("")
      setSkuName("")
      setSkuCategory("")
      setPhLevel("")
      setSkuDescription("")
      setSkuUsp("")
      setSkuFeatures("")
      setSkuApplications("")
      setSkuIngredients("")
      setSkuDirections("")
      await fetchProducts()
    } else {
      alert(`Error creating SKU: ${result.error}`)
    }

    setIsCreatingSku(false)
  }

  const toggleRegion = (region: string) => {
    setSelectedRegions(curr =>
      curr.includes(region)
        ? curr.filter(r => r !== region)
        : [...curr, region]
    )
    if (uploadError) setUploadError(null)
  }

  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!documentFile) {
      setUploadError("Please select a file to upload.")
      return
    }

    if (selectedRegions.length === 0) {
      setUploadError("You must select at least one valid region before uploading.")
      return
    }

    if (!docProductId || !docTitle || !docCategory) {
      setUploadError("Please fill out all document details and select a product.")
      return
    }

    setIsUploading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append("file", documentFile)
      formData.append("product_id", docProductId)
      formData.append("title", docTitle)
      formData.append("category", docCategory)
      selectedRegions.forEach(region => formData.append("valid_regions", region))

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload document')
      }

      alert(`Document uploaded successfully for regions: ${selectedRegions.join(", ")}`)

      // Reset form
      setDocProductId("")
      setDocTitle("")
      setDocumentFile(null)
      setSelectedRegions([])
      // Keep category as user likely uploads multiples of same type

    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  const handleUploadMedia = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mediaProductId || !mediaFile) return
    setIsUploadingMedia(true)

    try {
      const formData = new FormData()
      formData.append("mediaFile", mediaFile)
      formData.append("product_id", mediaProductId)
      formData.append("media_type", mediaType)

      const response = await fetch('/api/upload-media', {
        method: 'POST',
        body: formData
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to upload media')

      alert(`Product ${mediaType} media uploaded successfully!`)
      setMediaProductId("")
      setMediaFile(null)
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsUploadingMedia(false)
    }
  }

  const handleCreateTraining = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!trainTitle || !trainVideoUrl) return
    setIsCreatingTraining(true)

    const formData = new FormData()
    formData.append("title", trainTitle)
    formData.append("description", trainDescription)
    formData.append("video_url", trainVideoUrl)
    if (trainDuration) formData.append("duration_seconds", trainDuration)
    formData.append("pdf_url", trainPdfUrl)
    formData.append("category", trainCategory)
    formData.append("market_segment", trainMarketSegment)
    trainSelectedRegions.forEach(region => formData.append("valid_regions", region))

    const result = await createTrainingModule(formData)
    if (result.success) {
      alert("Training module created successfully")
      setTrainTitle("")
      setTrainDescription("")
      setTrainVideoUrl("")
      setTrainDuration("")
      setTrainPdfUrl("")
      setTrainSelectedRegions(["GLOBAL"])
    } else {
      alert(`Error creating training module: ${result.error}`)
    }

    setIsCreatingTraining(false)
  }

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!annTitle || !annContent) return
    if (annSelectedRegions.length === 0) {
      alert("Please select at least one region for the announcement.")
      return
    }
    setIsCreatingAnn(true)

    const formData = new FormData()
    formData.append("title", annTitle)
    formData.append("content", annContent)
    if (annAttachmentUrl) formData.append("attachment_url", annAttachmentUrl)
    formData.append("is_pinned", annIsPinned ? "true" : "false")
    annSelectedRegions.forEach(region => formData.append("valid_regions", region))

    const result = await createAnnouncement(formData)
    if (result.success) {
      alert("Announcement created successfully")
      setAnnTitle("")
      setAnnContent("")
      setAnnAttachmentUrl("")
      setAnnIsPinned(false)
      setAnnSelectedRegions(["GLOBAL"])
    } else {
      alert(`Error creating announcement: ${result.error}`)
    }

    setIsCreatingAnn(false)
  }

  const handleArchiveAnnouncement = async (announcementId: string) => {
    const result = await archiveAnnouncement(announcementId)
    if (result.success) {
      await fetchAnnouncements()
    } else {
      alert(`Error archiving announcement: ${result.error}`)
    }
  }

  const handleDeleteAnnouncement = async (announcementId: string) => {
    if (confirm('Are you sure you want to permanently delete this announcement?')) {
      const result = await deleteAnnouncement(announcementId)
      if (result.success) {
        await fetchAnnouncements()
      } else {
        alert(`Error deleting announcement: ${result.error}`)
      }
    }
  }

    return (
    <div className="p-4 md:p-8 space-y-6 bg-bg-main min-h-full text-text-main">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-text-main">Content Management System</h1>
        <p className="text-text-muted mt-2">
          Manage product SKUs and upload region-specific hub documents.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Create SKU Form */}
        <Card className="shadow-sm">
          <form onSubmit={handleCreateSKU}>
            <CardHeader>
              <CardTitle>Create New SKU</CardTitle>
              <CardDescription>
                Add a new product entry to the catalog.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="skuId">SKU ID</Label>
                  <Input
                    id="skuId"
                    placeholder="e.g. VK-100"
                    value={skuId}
                    onChange={(e) => setSkuId(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phLevel">pH Level (Optional)</Label>
                  <Input
                    id="phLevel"
                    type="number"
                    step="0.1"
                    min="0"
                    max="14"
                    placeholder="e.g. 7.5"
                    value={phLevel}
                    onChange={(e) => setPhLevel(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="skuName">Product Name</Label>
                <Input
                  id="skuName"
                  placeholder="e.g. Veritas Heavy Duty Cleaner"
                  value={skuName}
                  onChange={(e) => setSkuName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="skuCategory">Category</Label>
                <Input
                  id="skuCategory"
                  list="category-suggestions"
                  placeholder="Select or type a new category"
                  value={skuCategory}
                  onChange={(e) => setSkuCategory(e.target.value)}
                  required
                />
                <datalist id="category-suggestions">
                  {dynamicCategories.map(cat => (
                    <option key={cat} value={cat} />
                  ))}
                </datalist>
              </div>

              <div className="space-y-2 pt-2 border-t border-border-subtle">
                <h4 className="text-sm font-semibold text-text-main mb-3">Product Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="skuDescription">Description (Optional)</Label>
                    <Textarea id="skuDescription" className="min-h-[80px]" placeholder="General description..." value={skuDescription} onChange={(e) => setSkuDescription(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skuUsp">USP (Unique Selling Proposition)</Label>
                    <Textarea id="skuUsp" className="min-h-[80px]" placeholder="What makes this product special..." value={skuUsp} onChange={(e) => setSkuUsp(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skuFeatures">Features & Benefits</Label>
                    <Textarea id="skuFeatures" className="min-h-[80px]" placeholder="Bullet points of features..." value={skuFeatures} onChange={(e) => setSkuFeatures(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skuApplications">Applications</Label>
                    <Textarea id="skuApplications" className="min-h-[80px]" placeholder="Where to apply this..." value={skuApplications} onChange={(e) => setSkuApplications(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skuIngredients">Ingredients</Label>
                    <Textarea id="skuIngredients" className="min-h-[80px]" placeholder="Key chemical compounds..." value={skuIngredients} onChange={(e) => setSkuIngredients(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="skuDirections">Directions for Use</Label>
                    <Textarea id="skuDirections" className="min-h-[80px]" placeholder="Step by step instructions..." value={skuDirections} onChange={(e) => setSkuDirections(e.target.value)} />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200" variant="outline" disabled={isCreatingSku}>
                {isCreatingSku ? "Creating..." : "Create SKU"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Upload Document Form */}
        <Card className="shadow-sm">
          <form onSubmit={handleUploadDocument}>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription>
                Upload marketing, technical, or sales material. Forced region selection ensures compliant distribution.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="docProductId">Target Product</Label>
                  <Select value={docProductId} onValueChange={setDocProductId} required>
                    <SelectTrigger id="docProductId">
                      <SelectValue placeholder="Select a product..." />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="docCategory">Doc Category</Label>
                  <Select value={docCategory} onValueChange={setDocCategory} required>
                    <SelectTrigger id="docCategory">
                      <SelectValue placeholder="TDS, MSDS, etc." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TDS">TDS (Technical Data)</SelectItem>
                      <SelectItem value="MSDS">MSDS (Safety Data)</SelectItem>
                      <SelectItem value="Coshh Sheet">Coshh Sheet</SelectItem>
                      <SelectItem value="GreenPro Certificate">GreenPro Certificate</SelectItem>
                      <SelectItem value="ISO 90012015 Certificate">ISO 90012015 Certificate</SelectItem>
                      <SelectItem value="Product Label">Product Label</SelectItem>
                      <SelectItem value="Product Test Report">Product Test Report</SelectItem>
                      <SelectItem value="CERTIFICATE">Certificate (Generic)</SelectItem>
                      <SelectItem value="MANUAL">Manual (Generic)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="docTitle">Document Title</Label>
                <Input
                  id="docTitle"
                  placeholder="e.g. NA Market Safety Guidelines 2026"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="docFile">File</Label>
                <Input
                  id="docFile"
                  type="file"
                  className="cursor-pointer"
                  onChange={(e) => setDocumentFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="space-y-3">
                <Label>Valid Regions (Required)</Label>
                <div className="grid grid-cols-2 gap-4 py-1">
                  {REGIONS.map((region) => (
                    <div key={region} className="flex items-center space-x-2">
                      <Checkbox
                        id={`region-${region}`}
                        checked={selectedRegions.includes(region)}
                        onCheckedChange={() => toggleRegion(region)}
                      />
                      <label
                        htmlFor={`region-${region}`}
                        className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {region}
                      </label>
                    </div>
                  ))}
                </div>
                {uploadError && (
                  <p className="text-sm text-red-500 font-medium mt-2">{uploadError}</p>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200" variant="outline" disabled={isUploading}>
                {isUploading ? "Uploading..." : "Upload to Selected Regions"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Add Product Media Form */}
        <Card className="shadow-sm">
          <form onSubmit={handleUploadMedia}>
            <CardHeader>
              <CardTitle>Add Product Media</CardTitle>
              <CardDescription>
                Upload visual media like Before/After images for a product.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mediaProductId">Target Product</Label>
                <Select value={mediaProductId} onValueChange={setMediaProductId} required>
                  <SelectTrigger id="mediaProductId">
                    <SelectValue placeholder="Select a product..." />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.sku})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mediaType">Media Type</Label>
                <Select value={mediaType} onValueChange={setMediaType} required>
                  <SelectTrigger id="mediaType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="IMAGE">Image</SelectItem>
                    <SelectItem value="VIDEO">Video</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="mediaFile">Image File</Label>
                <Input
                  id="mediaFile"
                  type="file"
                  accept="image/*"
                  className="cursor-pointer"
                  onChange={(e) => setMediaFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200" variant="outline" disabled={isUploadingMedia}>
                {isUploadingMedia ? "Uploading..." : "Upload Media"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Create Training Module Form */}
        <Card className="shadow-sm">
          <form onSubmit={handleCreateTraining}>
            <CardHeader>
              <CardTitle>Create Training Module</CardTitle>
              <CardDescription>
                Publish new educational content to the Training Hub.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trainCategory">Category</Label>
                  <Select value={trainCategory} onValueChange={setTrainCategory} required>
                    <SelectTrigger id="trainCategory">
                      <SelectValue placeholder="Category..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Sales">Sales</SelectItem>
                      <SelectItem value="Industries">Industries</SelectItem>
                      <SelectItem value="Onboarding">Onboarding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trainMarketSegment">Market Segment</Label>
                  <Select value={trainMarketSegment} onValueChange={setTrainMarketSegment} required>
                    <SelectTrigger id="trainMarketSegment">
                      <SelectValue placeholder="Segment..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Hospitality">Hospitality</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="F&B">F&B</SelectItem>
                      <SelectItem value="JanSan">JanSan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainTitle">Module Title</Label>
                <Input
                  id="trainTitle"
                  placeholder="e.g. Advanced Cleaning Techniques"
                  value={trainTitle}
                  onChange={(e) => setTrainTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainDescription">Description</Label>
                <Textarea
                  id="trainDescription"
                  placeholder="Short summary of this training video..."
                  value={trainDescription}
                  onChange={(e) => setTrainDescription(e.target.value)}
                  className="min-h-[80px]"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="trainVideoUrl">YouTube Video URL</Label>
                  <Input
                    id="trainVideoUrl"
                    type="url"
                    placeholder="https://youtu.be/..."
                    value={trainVideoUrl}
                    onChange={(e) => setTrainVideoUrl(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="trainDuration">Duration (Seconds, Optional)</Label>
                  <Input
                    id="trainDuration"
                    type="number"
                    placeholder="e.g. 120"
                    value={trainDuration}
                    onChange={(e) => setTrainDuration(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trainPdfUrl">PDF Resource URL (Optional)</Label>
                <Input
                  id="trainPdfUrl"
                  type="url"
                  placeholder="https://.../deck.pdf"
                  value={trainPdfUrl}
                  onChange={(e) => setTrainPdfUrl(e.target.value)}
                />
              </div>

              <div className="space-y-3 pt-2">
                <Label>Valid Regions (Required)</Label>
                <div className="grid grid-cols-2 gap-4 py-1">
                  {REGIONS.map((region) => (
                    <div key={`train-${region}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`train-region-${region}`}
                        checked={trainSelectedRegions.includes(region)}
                        onCheckedChange={() => toggleTrainRegion(region)}
                      />
                      <label
                        htmlFor={`train-region-${region}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {region}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200" variant="outline" disabled={isCreatingTraining}>
                {isCreatingTraining ? "Creating..." : "Publish Training Module"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Create Announcement Form */}
        <Card className="shadow-sm md:col-span-2 xl:col-span-1">
          <form onSubmit={handleCreateAnnouncement}>
            <CardHeader>
              <CardTitle>Broadcast Announcement</CardTitle>
              <CardDescription>
                Publish news to the main dashboard for all partners.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="annTitle">Title</Label>
                <Input
                  id="annTitle"
                  placeholder="e.g. Q4 Price Adjustments"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annContent">Message Content</Label>
                <Textarea
                  id="annContent"
                  placeholder="Detailed announcement text..."
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  required
                  className="min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="annAttachmentUrl">Attachment URL (Optional)</Label>
                <Input
                  id="annAttachmentUrl"
                  type="url"
                  placeholder="https://.../annex.pdf"
                  value={annAttachmentUrl}
                  onChange={(e) => setAnnAttachmentUrl(e.target.value)}
                />
              </div>
              <div className="space-y-3 pt-2">
                <Label>Valid Regions (Required)</Label>
                <div className="grid grid-cols-2 gap-4 py-1">
                  {REGIONS.map((region) => (
                    <div key={`ann-${region}`} className="flex items-center space-x-2">
                      <Checkbox
                        id={`ann-region-${region}`}
                        checked={annSelectedRegions.includes(region)}
                        onCheckedChange={() => toggleAnnRegion(region)}
                      />
                      <label
                        htmlFor={`ann-region-${region}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {region}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <Checkbox
                  id="annIsPinned"
                  checked={annIsPinned}
                  onCheckedChange={(checked) => setAnnIsPinned(checked === true)}
                />
                <label
                  htmlFor="annIsPinned"
                  className="text-sm font-medium leading-none cursor-pointer"
                >
                  Pin to top of Dashboard
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full hover:bg-primary hover:text-primary-foreground transition-all duration-200" variant="outline" disabled={isCreatingAnn}>
                {isCreatingAnn ? "Publishing..." : "Broadcast Announcement"}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Announcements Management */}
        <Card className="col-span-1 md:col-span-2">
          <CardHeader>
            <CardTitle>Manage Announcements</CardTitle>
            <CardDescription>Archive or delete existing announcements</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingAnnouncements ? (
              <div className="text-center py-8 text-sm text-text-muted">Loading announcements...</div>
            ) : announcements.length === 0 ? (
              <div className="text-center py-8 text-sm text-text-muted">No announcements yet</div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {announcements.map((ann: any) => (
                  <div key={ann.id} className="flex items-start justify-between p-3 border border-border-subtle rounded-lg hover:bg-bg-hover transition-colors">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm text-text-main truncate">{ann.title}</h4>
                      <p className="text-xs text-text-muted mt-1 line-clamp-2">{ann.content}</p>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        {ann.valid_regions?.map((region: string) => (
                          <span key={region} className="text-[10px] bg-brand-accent/10 text-brand-accent px-2 py-0.5 rounded">
                            {region}
                          </span>
                        ))}
                        {ann.is_pinned && (
                          <span className="text-[10px] bg-orange-500/10 text-orange-600 px-2 py-0.5 rounded">
                            📌 Pinned
                          </span>
                        )}
                        {ann.is_archived && (
                          <span className="text-[10px] bg-gray-500/10 text-gray-600 px-2 py-0.5 rounded">
                            📋 Archived
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2 ml-3 flex-shrink-0">
                      {!ann.is_archived && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleArchiveAnnouncement(ann.id)}
                          className="text-xs"
                        >
                          Archive
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteAnnouncement(ann.id)}
                        className="text-xs text-red-600 hover:text-red-700"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
