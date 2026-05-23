import { NextResponse } from 'next/server';
import { z } from 'zod';
import { processLead } from '@/lib/leadEngine';

const leadSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  phone: z.string().regex(/^\d{10}$/, 'Phone number must be exactly 10 digits'),
  city: z.string().min(2, 'City is required'),
  serviceId: z.coerce.number().int().min(1).max(3),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = leadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const result = await processLead(parsed.data);

    return NextResponse.json(
      { message: 'Lead assigned successfully', data: result },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message && error.message.includes('Duplicate lead')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }
    console.error('Error processing lead:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
