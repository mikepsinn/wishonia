import { put } from '@vercel/blob';
import { NextResponse } from 'next/server';
 
export async function POST(request: Request): Promise<NextResponse> {
 
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('image');
  const blob = await put(filename, request.body, {
    access: 'public',
  }); 
  return NextResponse.json({imageUrl:blob.url});
}