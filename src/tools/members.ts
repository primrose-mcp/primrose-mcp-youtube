/**
 * Member Tools
 *
 * MCP tools for YouTube channel membership operations.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { YouTubeClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerMemberTools(server: McpServer, client: YouTubeClient): void {
  // ===========================================================================
  // List Members
  // ===========================================================================
  server.tool(
    'youtube_list_members',
    `List channel members (sponsors).

Requires OAuth authentication. Only available for channels with memberships enabled.

Args:
  - mode: List mode (all_current, updates)
  - maxResults: Maximum results to return (1-1000)
  - pageToken: Pagination token
  - hasAccessToLevel: Filter by membership level ID
  - filterByMemberChannelId: Filter by specific member channel ID
  - format: Response format

Returns:
  Paginated list of channel members.`,
    {
      mode: z.enum(['all_current', 'updates']).default('all_current').describe('List mode'),
      maxResults: z.number().int().min(1).max(1000).default(25).describe('Maximum results'),
      pageToken: z.string().optional().describe('Pagination token'),
      hasAccessToLevel: z.string().optional().describe('Filter by membership level ID'),
      filterByMemberChannelId: z.string().optional().describe('Filter by member channel ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ mode, maxResults, pageToken, hasAccessToLevel, filterByMemberChannelId, format }) => {
      try {
        const result = await client.listMembers({
          mode,
          maxResults,
          pageToken,
          hasAccessToLevel,
          filterByMemberChannelId,
        });
        return formatResponse(result, format, 'members');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Membership Levels
  // ===========================================================================
  server.tool(
    'youtube_list_membership_levels',
    `List membership levels for the authenticated channel.

Requires OAuth authentication. Only available for channels with memberships enabled.

Args:
  - parts: Resource parts to include
  - format: Response format

Returns:
  List of membership levels.`,
    {
      parts: z.array(z.string()).optional().default(['snippet']).describe('Resource parts'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ parts, format }) => {
      try {
        const levels = await client.listMembershipsLevels(parts);
        return formatResponse({ items: levels, count: levels.length, hasMore: false }, format, 'membershipLevels');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
