import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, AuthResult } from '@/lib/auth/auth-middleware';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { nowUnixMs, applyTimezoneOffset } from '@/lib/utils/time';
import { jsonWithBigInts } from '@/lib/utils/json';

const uploadScreenshotSchema = z.object({
  windowId: z.string(),
  timestamp: z.coerce.bigint(),
  timezoneOffset: z.number(),
  os: z.string().optional(),
  osVersion: z.string().optional(),
  computerName: z.string().optional(),
  gateways: z.any().optional(),
  app: z.string().optional(),
  appFileName: z.string().optional(),
  appFilePath: z.string().optional(),
  title: z.string().optional(),
  url: z.string().optional(),
  ipAddress: z.string().optional(),
  macAddress: z.string().optional(),
});

export const POST = requireAuth(async (req: NextRequest, auth: AuthResult) => {
  if (auth.type === 'api-token' || !auth.employee) {
    return NextResponse.json({ error: 'This endpoint is for employees only.' }, { status: 403 });
  }

  const body = await req.json();
  const validation = uploadScreenshotSchema.safeParse(body);

  if (!validation.success) {
    return NextResponse.json({ error: 'Invalid request body', details: validation.error.issues }, { status: 400 });
  }

  const { windowId, ...screenshotData } = validation.data;
  const employee = auth.employee;

  try {
    // First, verify the window exists and belongs to the employee
    const window = await prisma.window.findFirst({
      where: {
        id: windowId,
        employeeId: employee.id,
        end: null, // Ensure the window is still active
      },
    });

    if (!window) {
      return NextResponse.json({ error: 'Active window not found for this employee.' }, { status: 404 });
    }

    const currentTimestamp = nowUnixMs();

    // Use a transaction to ensure both operations succeed
    const [screenshot] = await prisma.$transaction([
      prisma.screenshot.create({
        data: {
          // Core IDs
          windowId: windowId,
          employeeId: employee.id,
          organizationId: employee.organizationId,
          teamId: employee.teamId,
          sharedSettingsId: employee.sharedSettingsId,
          projectId: window.projectId,
          taskId: window.taskId,
          
          // Employee Info
          name: employee.name,
          user: employee.email,
          
          // System & App Info (with defaults)
          computer: screenshotData.computerName || '',
          hwid: window.hwid, // Inherit hwid from the window
          app: screenshotData.app || '',
          appFileName: screenshotData.appFileName || '',
          appFilePath: screenshotData.appFilePath || '',
          title: screenshotData.title || '',
          os: screenshotData.os || '',
          osVersion: screenshotData.osVersion || '',
          ipAddress: screenshotData.ipAddress,
          macAddress: screenshotData.macAddress,
          url: screenshotData.url,

          // Time Info
          timestamp: screenshotData.timestamp,
          timezoneOffset: BigInt(screenshotData.timezoneOffset),
          timestampTranslated: applyTimezoneOffset(screenshotData.timestamp, BigInt(screenshotData.timezoneOffset)),
          
          // Spread remaining optional fields
          gateways: screenshotData.gateways,
        },
      }),
      prisma.window.update({
        where: {
          id: windowId,
        },
        data: {
          lastHeartbeat: currentTimestamp,
        },
      }),
    ]);

    return jsonWithBigInts(screenshot, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/internal/screenshot/upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
