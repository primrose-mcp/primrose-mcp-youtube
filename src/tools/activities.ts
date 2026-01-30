/**
 * Activity Tools
 *
 * MCP tools for YouTube activity operations.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { YouTubeClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerActivityTools(server: McpServer, client: YouTubeClient): void {
  // ===========================================================================
  // List Activities
  // ===========================================================================
  server.tool(
    'youtube_list_activities',
    `List channel activity events (uploads, likes, comments, etc.).

Args:
  - channelId: Channel ID to get activities for (or use mine=true)
  - mine: Get activities for authenticated user (requires OAuth)
  - maxResults: Maximum results to return (1-50)
  - pageToken: Pagination token
  - publishedAfter: Filter activities after date (RFC 3339)
  - publishedBefore: Filter activities before date (RFC 3339)
  - regionCode: Filter by region code
  - format: Response format

Returns:
  Paginated list of activity events.`,
    {
      channelId: z.string().optional().describe('Channel ID'),
      mine: z.boolean().optional().describe('Get my activities'),
      maxResults: z.number().int().min(1).max(50).default(25).describe('Maximum results'),
      pageToken: z.string().optional().describe('Pagination token'),
      publishedAfter: z.string().optional().describe('Filter after date (RFC 3339)'),
      publishedBefore: z.string().optional().describe('Filter before date (RFC 3339)'),
      regionCode: z.string().optional().describe('Region code'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ channelId, mine, maxResults, pageToken, publishedAfter, publishedBefore, regionCode, format }) => {
      try {
        const result = await client.listActivities({
          channelId,
          mine,
          maxResults,
          pageToken,
          publishedAfter,
          publishedBefore,
          regionCode,
        });
        return formatResponse(result, format, 'activities');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
