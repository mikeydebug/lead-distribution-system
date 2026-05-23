import { NextResponse } from 'next/server';
import { processLead } from '@/lib/leadEngine';

export async function POST() {
  try {
    // Generate 10 concurrent requests
    const promises = Array.from({ length: 10 }).map(async (_, i) => {
      const timestamp = String(Date.now()).slice(-8);
      const phone = `${timestamp}${String(i).padStart(2, '0')}`;
      const data = {
        name: `Concurrent Lead ${i}`,
        phone,
        city: 'Test City',
        serviceId: 1, // Let's test concurrency heavily on Service 1
      };
      
      try {
        return await processLead(data);
      } catch (err: any) {
        return { error: err.message };
      }
    });

    const results = await Promise.allSettled(promises);
    
    const successes = results.filter((r) => r.status === 'fulfilled' && !(r.value as any).error).length;
    const failures = results.length - successes;

    return NextResponse.json({ 
      message: 'Concurrent generation complete', 
      successes,
      failures,
      details: results 
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
