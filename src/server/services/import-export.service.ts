import { prisma } from '../config/database';
import { logger } from '../utils/logger';
import Papa from 'papaparse';

/**
 * Browser bookmark HTML format
 */
interface BrowserBookmark {
  title: string;
  url: string;
  addDate?: number;
  icon?: string;
  tags?: string;
  folder?: string;
}

/**
 * Import/Export Service
 */
export class ImportExportService {
  /**
   * Import bookmarks from various formats
   */
  async importBookmarks(
    userId: string,
    format: 'html' | 'json' | 'csv',
    data: string
  ): Promise<{
    imported: number;
    skipped: number;
    errors: string[];
  }> {
    const results = {
      imported: 0,
      skipped: 0,
      errors: [] as string[],
    };

    try {
      let bookmarks: BrowserBookmark[] = [];

      switch (format) {
        case 'html':
          bookmarks = this.parseHTMLBookmarks(data);
          break;
        case 'json':
          bookmarks = JSON.parse(data);
          break;
        case 'csv':
          bookmarks = this.parseCSVBookmarks(data);
          break;
      }

      logger.info(`Importing ${bookmarks.length} bookmarks for user ${userId}`);

      for (const bookmark of bookmarks) {
        try {
          // Check if bookmark already exists
          const existing = await prisma.bookmark.findFirst({
            where: {
              userId,
              url: bookmark.url,
            },
          });

          if (existing) {
            results.skipped++;
            continue;
          }

          // Create bookmark
          await prisma.bookmark.create({
            data: {
              userId,
              title: bookmark.title,
              url: bookmark.url,
              description: null,
              favicon: bookmark.icon,
              createdAt: bookmark.addDate ? new Date(bookmark.addDate * 1000) : new Date(),
            },
          });

          // Add tags if provided
          if (bookmark.tags) {
            const tagNames = bookmark.tags.split(',').map((t) => t.trim());
            for (const tagName of tagNames) {
              if (tagName) {
                // Find or create tag
                let tag = await prisma.tag.findFirst({
                  where: {
                    name: tagName,
                    userId,
                  },
                });

                if (!tag) {
                  tag = await prisma.tag.create({
                    data: {
                      name: tagName,
                      userId,
                    },
                  });
                }
              }
            }
          }

          results.imported++;
        } catch (error) {
          results.errors.push(`Failed to import "${bookmark.title}": ${error}`);
          logger.error(`Import error for ${bookmark.url}:`, error);
        }
      }

      logger.info(`Import complete: ${results.imported} imported, ${results.skipped} skipped`);
      return results;
    } catch (error) {
      logger.error('Import failed:', error);
      throw error;
    }
  }

  /**
   * Export bookmarks to various formats
   */
  async exportBookmarks(
    userId: string,
    format: 'html' | 'json' | 'csv',
    options?: {
      collectionId?: string;
      includeArchived?: boolean;
    }
  ): Promise<string> {
    const where: any = { userId };

    if (options?.collectionId) {
      where.collectionId = options.collectionId;
    }

    if (!options?.includeArchived) {
      where.isArchived = false;
    }

    const bookmarks = await prisma.bookmark.findMany({
      where,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        collection: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    logger.info(`Exporting ${bookmarks.length} bookmarks for user ${userId} in ${format} format`);

    switch (format) {
      case 'html':
        return this.exportToHTML(bookmarks);
      case 'json':
        return this.exportToJSON(bookmarks);
      case 'csv':
        return this.exportToCSV(bookmarks);
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  /**
   * Parse HTML bookmarks (Netscape Bookmark File Format)
   */
  private parseHTMLBookmarks(html: string): BrowserBookmark[] {
    const bookmarks: BrowserBookmark[] = [];
    const dtRegex = /<DT><A[^>]*HREF="([^"]*)"[^>]*ADD_DATE="([^"]*)"[^>]*>([^<]*)<\/A>/gi;

    let match;
    while ((match = dtRegex.exec(html)) !== null) {
      bookmarks.push({
        url: match[1],
        addDate: parseInt(match[2], 10),
        title: match[3],
      });
    }

    return bookmarks;
  }

  /**
   * Parse CSV bookmarks
   */
  private parseCSVBookmarks(csv: string): BrowserBookmark[] {
    const result = Papa.parse<any>(csv, {
      header: true,
      skipEmptyLines: true,
    });

    return result.data.map((row: any) => ({
      title: row.title || row.Title || row.name || row.Name || 'Untitled',
      url: row.url || row.URL || row.link || row.Link || '',
      tags: row.tags || row.Tags || '',
      folder: row.folder || row.Folder || '',
    }));
  }

  /**
   * Export to HTML (Netscape Bookmark File Format)
   */
  private exportToHTML(bookmarks: any[]): string {
    let html = `<!DOCTYPE NETSCAPE-Bookmark-file-1>
<!-- This is an automatically generated file.
     It will be read and overwritten.
     DO NOT EDIT! -->
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=UTF-8">
<TITLE>Bookmarks</TITLE>
<H1>Bookmarks</H1>
<DL><p>
`;

    const collections = new Map<string, any[]>();
    const uncategorized: any[] = [];

    // Group by collection
    bookmarks.forEach((bookmark) => {
      if (bookmark.collection) {
        const collectionName = bookmark.collection.name;
        if (!collections.has(collectionName)) {
          collections.set(collectionName, []);
        }
        collections.get(collectionName)?.push(bookmark);
      } else {
        uncategorized.push(bookmark);
      }
    });

    // Add collections
    collections.forEach((items, name) => {
      html += `    <DT><H3>${this.escapeHTML(name)}</H3>\n`;
      html += `    <DL><p>\n`;
      items.forEach((bookmark) => {
        html += this.bookmarkToHTML(bookmark);
      });
      html += `    </DL><p>\n`;
    });

    // Add uncategorized
    if (uncategorized.length > 0) {
      uncategorized.forEach((bookmark) => {
        html += this.bookmarkToHTML(bookmark);
      });
    }

    html += `</DL><p>\n`;
    return html;
  }

  /**
   * Convert single bookmark to HTML
   */
  private bookmarkToHTML(bookmark: any): string {
    const timestamp = Math.floor(new Date(bookmark.createdAt).getTime() / 1000);
    const tags = bookmark.tags?.map((t: any) => t.tag.name).join(',') || '';

    return `        <DT><A HREF="${this.escapeHTML(bookmark.url)}" ADD_DATE="${timestamp}" TAGS="${this.escapeHTML(tags)}">${this.escapeHTML(bookmark.title)}</A>\n`;
  }

  /**
   * Export to JSON
   */
  private exportToJSON(bookmarks: any[]): string {
    const data = bookmarks.map((bookmark) => ({
      id: bookmark.id,
      title: bookmark.title,
      url: bookmark.url,
      description: bookmark.description,
      favicon: bookmark.favicon,
      image: bookmark.image,
      isPinned: bookmark.isPinned,
      isArchived: bookmark.isArchived,
      tags: bookmark.tags?.map((t: any) => t.tag.name) || [],
      collection: bookmark.collection?.name || null,
      createdAt: bookmark.createdAt,
      updatedAt: bookmark.updatedAt,
    }));

    return JSON.stringify(data, null, 2);
  }

  /**
   * Export to CSV
   */
  private exportToCSV(bookmarks: any[]): string {
    const data = bookmarks.map((bookmark) => ({
      Title: bookmark.title,
      URL: bookmark.url,
      Description: bookmark.description || '',
      Tags: bookmark.tags?.map((t: any) => t.tag.name).join(', ') || '',
      Collection: bookmark.collection?.name || '',
      Pinned: bookmark.isPinned ? 'Yes' : 'No',
      Archived: bookmark.isArchived ? 'Yes' : 'No',
      Created: bookmark.createdAt.toISOString(),
    }));

    return Papa.unparse(data);
  }

  /**
   * Escape HTML special characters
   */
  private escapeHTML(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }

  /**
   * Create import record
   */
  async createImportRecord(
    userId: string,
    source: string,
    format: string,
    itemCount: number
  ): Promise<void> {
    await prisma.import.create({
      data: {
        userId,
        source,
        format,
        status: 'completed',
        itemCount,
      },
    });
  }

  /**
   * Create export record
   */
  async createExportRecord(
    userId: string,
    format: string,
    itemCount: number
  ): Promise<void> {
    await prisma.export.create({
      data: {
        userId,
        format,
        status: 'completed',
        itemCount,
      },
    });
  }
}

// Export singleton instance
export const importExportService = new ImportExportService();
