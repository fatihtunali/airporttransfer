import { NextRequest, NextResponse } from 'next/server';
import { authenticateSupplier } from '@/lib/supplier-auth';
import { uploadFile } from '@/lib/spaces';

// POST /api/supplier/upload - Upload a file to DigitalOcean Spaces
export async function POST(request: NextRequest) {
  // Authenticate supplier
  const auth = await authenticateSupplier(request);
  if (!auth.success) return auth.response;

  const { supplierId } = auth.payload;

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = (formData.get('folder') as string) || 'supplier-docs';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Convert File to Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Include supplier ID in folder path for organization
    const folderPath = `${folder}/${supplierId}`;

    // Upload to Spaces
    const result = await uploadFile(
      buffer,
      file.name,
      file.type,
      folderPath
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      url: result.url,
      key: result.key,
      filename: file.name,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    console.error('Error handling upload:', error);
    return NextResponse.json(
      { error: 'Failed to process upload' },
      { status: 500 }
    );
  }
}
