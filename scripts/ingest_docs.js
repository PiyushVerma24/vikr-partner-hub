const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { extname, basename } = require('path');
require('dotenv').config({ path: '.env.local' });

// Ensure credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
});

const getMimeType = (filePath) => {
    const ext = extname(filePath).toLowerCase();
    const mimes = {
        '.pdf': 'application/pdf',
        '.doc': 'application/msword',
        '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        '.xls': 'application/vnd.ms-excel',
        '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        '.ppt': 'application/vnd.ms-powerpoint',
        '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg'
    };
    return mimes[ext] || 'application/octet-stream';
};

const normalizeStr = (str) => {
    if (!str) return '';
    return str.toLowerCase().replace(/[^a-z0-9]/g, '').trim();
};

async function ingestDocuments(folderPath, documentType) {
  if (!fs.existsSync(folderPath)) {
    console.error(`Folder not found: ${folderPath}`);
    return;
  }

  const files = fs.readdirSync(folderPath);
  console.log(`Found ${files.length} files in "${folderPath}". Document Type: "${documentType}"\n`);

  console.log("Fetching all products from database for robust matching...");
  const { data: allProducts, error: prodErr } = await supabase.from('products').select('id, name');
  if (prodErr) {
      console.error("Failed to fetch products:", prodErr.message);
      return;
  }
  console.log(`Loaded ${allProducts.length} products to match against.\n`);

  for (const file of files) {
    if (file.startsWith('.')) continue; // Ignore hidden files

    const fullPath = path.join(folderPath, file);
    if (fs.statSync(fullPath).isDirectory()) continue;

    const ext = extname(file);
    const productName = basename(file, ext).trim(); 

    console.log(`Processing: ${file}`);

    // 1. Find product in DB using normalized string comparison
    const normName = normalizeStr(productName);
    const targetProduct = allProducts.find(p => normalizeStr(p.name) === normName);

    if (!targetProduct) {
      console.log(`   ✗ Warning: Could not find a product matching "${productName}" (normalized: ${normName}). Skipping.`);
      continue;
    }

    console.log(`   ✓ Matched Product -> ${targetProduct.name}`);

    // 2. Upload file to Storage Bucket
    const fileBuffer = fs.readFileSync(fullPath);
    const mimeType = getMimeType(fullPath);
    // Create a robust URL-safe path ensuring it matches exactly what the user wanted: "Product_Documents/Coshh Sheet/UUID_timestamp.pdf"
    const uniqueFileName = `${targetProduct.id}_${Date.now()}${ext}`;
    const storagePath = `Product_Documents/${documentType}/${uniqueFileName}`;

    console.log(`   ↑ Uploading to "secure_documents/${storagePath}"...`);
    const { data: uploadData, error: uploadErr } = await supabase
        .storage
        .from('secure_documents')
        .upload(storagePath, fileBuffer, {
            contentType: mimeType,
            upsert: true
        });

    if (uploadErr) {
        console.error(`   ✗ Error uploading file:`, uploadErr.message);
        continue;
    }

    // 3. Create database record
    console.log(`   + Linking to product in "public.documents" table...`);
    const { error: dbErr } = await supabase
        .from('documents')
        .insert({
            product_id: targetProduct.id,
            title: documentType,         // e.g. "Coshh Sheet"
            category: documentType,      // Passes direct input to DB category (requires matching DB Enum)
            valid_regions: ['GLOBAL'],
            file_url: uploadData.path    // Return value from Supabase upload
        });

    if (dbErr) {
        console.error(`   ✗ Error saving DB record:`, dbErr.message);
    } else {
        console.log(`   ✓ Success!`);
    }
  }

  console.log("\nBatch ingestion completed!");
}

// Map CLI arguments
const args = process.argv.slice(2);
if (args.length < 2) {
    console.log("Usage: node scripts/ingest_docs.js <relative_folder_path> <document_type>");
    console.log("Example: node scripts/ingest_docs.js \"Notion-Downloads/Notion-Downloads/downloads/Coshh Sheet\" \"Coshh Sheet\"");
    process.exit(1);
}

ingestDocuments(args[0], args[1]);
