import puppeteer, { Browser, Page } from 'puppeteer';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { logger } from '../utils/logger';
import { prisma } from '../config/database';

/**
 * Screenshot Service - Capture and store page screenshots
 */
export class ScreenshotService {
  private s3Client: S3Client;
  private browser?: Browser;
  private bucket: string;

  constructor() {
    this.bucket = process.env.S3_BUCKET || 'lia';
    this.s3Client = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: 'us-east-1',
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY || '',
        secretAccessKey: process.env.S3_SECRET_KEY || '',
      },
      forcePathStyle: true,
    });
  }

  /**
   * Initialize browser instance
   */
  private async getBrowser(): Promise<Browser> {
    if (!this.browser) {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      logger.info('Puppeteer browser initialized');
    }
    return this.browser;
  }

  /**
   * Capture screenshot of a URL
   */
  async captureScreenshot(
    url: string,
    bookmarkId: string,
    userId: string,
    options?: {
      fullPage?: boolean;
      width?: number;
      height?: number;
    }
  ): Promise<{ id: string; url: string; path: string }> {
    const browser = await this.getBrowser();
    let page: Page | null = null;

    try {
      logger.info(`Capturing screenshot for: ${url}`);

      page = await browser.newPage();

      // Set viewport
      await page.setViewport({
        width: options?.width || 1280,
        height: options?.height || 720,
        deviceScaleFactor: 1,
      });

      // Navigate to URL with timeout
      await page.goto(url, {
        waitUntil: 'networkidle2',
        timeout: 30000,
      });

      // Wait a bit for JavaScript to render
      await page.waitForTimeout(1000);

      // Capture screenshot
      const screenshot = await page.screenshot({
        type: 'jpeg',
        quality: 85,
        fullPage: options?.fullPage || false,
      });

      // Upload to S3
      const timestamp = Date.now();
      const filename = `screenshots/${userId}/${bookmarkId}_${timestamp}.jpg`;

      await this.s3Client.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: filename,
          Body: screenshot,
          ContentType: 'image/jpeg',
        })
      );

      const s3Url = `${process.env.S3_ENDPOINT}/${this.bucket}/${filename}`;

      // Save to database
      const screenshotRecord = await prisma.screenshot.create({
        data: {
          bookmarkId,
          userId,
          url: s3Url,
          path: filename,
        },
      });

      logger.info(`Screenshot saved: ${screenshotRecord.id}`);

      return {
        id: screenshotRecord.id,
        url: s3Url,
        path: filename,
      };
    } catch (error) {
      logger.error(`Error capturing screenshot for ${url}:`, error);
      throw error;
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Capture multiple screenshots (for different viewports/devices)
   */
  async captureMultipleScreenshots(
    url: string,
    bookmarkId: string,
    userId: string
  ): Promise<Array<{ id: string; url: string; path: string; viewport: string }>> {
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 667 },
    ];

    const screenshots = [];

    for (const viewport of viewports) {
      try {
        const screenshot = await this.captureScreenshot(url, bookmarkId, userId, {
          width: viewport.width,
          height: viewport.height,
          fullPage: false,
        });

        screenshots.push({
          ...screenshot,
          viewport: viewport.name,
        });
      } catch (error) {
        logger.error(`Failed to capture ${viewport.name} screenshot:`, error);
      }
    }

    return screenshots;
  }

  /**
   * Delete screenshot
   */
  async deleteScreenshot(screenshotId: string, userId: string): Promise<void> {
    const screenshot = await prisma.screenshot.findFirst({
      where: {
        id: screenshotId,
        userId,
      },
    });

    if (!screenshot) {
      throw new Error('Screenshot not found');
    }

    // Delete from S3 (optional - you might want to keep for backup)
    // await this.s3Client.send(
    //   new DeleteObjectCommand({
    //     Bucket: this.bucket,
    //     Key: screenshot.path,
    //   })
    // );

    // Delete from database
    await prisma.screenshot.delete({
      where: { id: screenshotId },
    });

    logger.info(`Screenshot deleted: ${screenshotId}`);
  }

  /**
   * Get screenshots for a bookmark
   */
  async getScreenshots(bookmarkId: string, userId: string) {
    return await prisma.screenshot.findMany({
      where: {
        bookmarkId,
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Close browser instance
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = undefined;
      logger.info('Puppeteer browser closed');
    }
  }
}

// Export singleton instance
export const screenshotService = new ScreenshotService();

// Cleanup on process exit
process.on('exit', () => {
  screenshotService.close();
});
