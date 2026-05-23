import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const providers = await prisma.provider.findMany({
      include: {
        _count: {
          select: { assignments: true },
        },
        assignments: {
          include: {
            lead: {
              include: {
                service: true,
              },
            },
          },
          orderBy: {
            assignedAt: 'desc',
          },
          take: 10, // Just show latest 10 on the dashboard
        },
      },
      orderBy: {
        id: 'asc',
      },
    });

    return NextResponse.json({ providers });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
}
