import { prisma } from '@/lib/db';
import { Prisma } from '@prisma/client';

export const listScreenshots = async (
  organizationId: string,
  filters: {
    start: number;
    end: number;
    limit: number;
    timezone?: string;
    taskId?: string;
    shiftId?: string;
    projectId?: string;
    sortBy?: string;
    next?: string;
  }
) => {
  try {
    const where: Prisma.ScreenshotWhereInput = {
      organizationId,
      timestamp: {
        gte: filters.start,
        lte: filters.end,
      },
    };

    if (filters.taskId) {
      where.taskId = { in: filters.taskId.split(',') };
    }
    if (filters.projectId) {
      where.projectId = { in: filters.projectId.split(',') };
    }

    const screenshots = await prisma.screenshot.findMany({
      where,
      take: filters.limit,
      cursor: filters.next ? { id: filters.next } : undefined,
      orderBy: {
        timestamp: 'desc',
      },
    });

    return { success: true, data: screenshots };
  } catch (error) {
    console.error('Error listing screenshots:', error);
    return { success: false, error: 'Failed to retrieve screenshots' };
  }
};

export const deleteScreenshot = async (id: string, organizationId: string) => {
  try {
    const result = await prisma.screenshot.deleteMany({
      where: {
        id,
        organizationId,
      },
    });

    if (result.count === 0) {
      return { success: false, error: 'Screenshot not found' };
    }

    return { success: true, data: { id } };
  } catch (error) {
    console.error('Error deleting screenshot:', error);
    return { success: false, error: 'Failed to delete screenshot' };
  }
};
