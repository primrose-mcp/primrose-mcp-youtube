/**
 * Category Tools
 *
 * MCP tools for YouTube video categories and abuse report reasons.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { YouTubeClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerCategoryTools(server: McpServer, client: YouTubeClient): void {
  // ===========================================================================
  // List Video Categories
  // ===========================================================================
  server.tool(
    'youtube_list_video_categories',
    `List video categories available for a region.

Args:
  - regionCode: ISO 3166-1 alpha-2 country code (default: US)
  - hl: Language code for localization (optional)
  - format: Response format

Returns:
  List of video categories with IDs and titles.`,
    {
      regionCode: z.string().default('US').describe('Region code'),
      hl: z.string().optional().describe('Language code for localization'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ regionCode, hl, format }) => {
      try {
        const categories = await client.listVideoCategories(regionCode, hl);
        return formatResponse({ items: categories, count: categories.length, hasMore: false }, format, 'videoCategories');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Video Abuse Report Reasons
  // ===========================================================================
  server.tool(
    'youtube_list_video_abuse_report_reasons',
    `List reasons available for reporting abusive videos.

Args:
  - hl: Language code for localization (optional)
  - format: Response format

Returns:
  List of abuse report reasons with IDs and labels.`,
    {
      hl: z.string().optional().describe('Language code for localization'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ hl, format }) => {
      try {
        const reasons = await client.listVideoAbuseReportReasons(hl);
        return formatResponse({ items: reasons, count: reasons.length, hasMore: false }, format, 'abuseReasons');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
