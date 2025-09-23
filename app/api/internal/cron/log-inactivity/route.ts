import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { nowUnixMs } from '@/lib/utils/time';
import { Prisma } from '@/app/generated/prisma';

// This is a simplified security check. In a real production app,
// this should be a more robust secret validation.
function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get('authorization');
  return !!cronSecret && authHeader === `Bearer ${cronSecret}`;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const now = nowUnixMs();
    // Threshold: 15 minutes in milliseconds
    const threshold = BigInt(15 * 60 * 1000);
    const staleTime = now - threshold;

    // Find all active windows that haven't had a heartbeat in the last 15 minutes
    const staleWindows = await prisma.window.findMany({
      where: {
        end: null,
        lastHeartbeat: {
          lt: staleTime,
        },
      },
    });

    if (staleWindows.length === 0) {
      return NextResponse.json({ message: 'No stale windows to update.' });
    }

    // Use a transaction to update all stale windows
    await prisma.$transaction(async (tx) => {
      for (const window of staleWindows) {
        const missedScreenshots = (window.missedScreenshots as Prisma.JsonArray) || [];
        const newMissedScreenshots = [...missedScreenshots, now.toString()];

        await tx.window.update({
          where: { id: window.id },
          data: {
            missedScreenshots: newMissedScreenshots,
            // IMPORTANT: Update lastHeartbeat to now to prevent re-flagging
            lastHeartbeat: now,
          },
        });
      }
    });

    return NextResponse.json({
      message: `Successfully updated ${staleWindows.length} stale window(s).`,
      updatedWindowIds: staleWindows.map((w) => w.id),
    });
  } catch (error) {
    console.error('Error in cron job /api/internal/cron/log-inactivity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
