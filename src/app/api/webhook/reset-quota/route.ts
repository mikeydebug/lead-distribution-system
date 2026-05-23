import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const webhookSchema = z.object({
  eventId: z.string().min(1, 'Event ID is required'),
  providerId: z.number().int().positive(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = webhookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid webhook payload' }, { status: 400 });
    }

    const { eventId, providerId } = parsed.data;

    // Use a transaction to ensure idempotency and quota reset are atomic
    await prisma.$transaction(async (tx) => {
      // 1. Check if the event was already processed
      const existingEvent = await tx.webhookEvent.findUnique({
        where: { id: eventId },
      });

      if (existingEvent) {
        // Idempotency: Ignore duplicate event, but return 200 OK so webhook sender doesn't retry
        return;
      }

      // 2. Mark event as processed
      await tx.webhookEvent.create({
        data: {
          id: eventId,
          type: 'QUOTA_RESET',
        },
      });

      // 3. Reset quota
      await tx.provider.update({
        where: { id: providerId },
        data: { currentQuota: 10 },
      });
    }, {
      maxWait: 15000,
      timeout: 30000,
    });

    return NextResponse.json({ message: 'Quota reset successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Webhook error:', error);
    // If it's a unique constraint violation on webhookEvent from concurrent identical webhooks,
    // we can safely consider it handled due to idempotency.
    if (error.code === 'P2002') {
       return NextResponse.json({ message: 'Already processed' }, { status: 200 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
