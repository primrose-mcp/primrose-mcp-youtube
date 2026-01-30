/**
 * Subscription Tools
 *
 * MCP tools for YouTube subscription operations.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { YouTubeClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerSubscriptionTools(server: McpServer, client: YouTubeClient): void {
  // ===========================================================================
  // List My Subscriptions
  // ===========================================================================
  server.tool(
    'youtube_list_my_subscriptions',
    `List the authenticated user's subscriptions.

Requires OAuth authentication.

Args:
  - maxResults: Maximum results to return (1-50)
  - pageToken: Pagination token
  - parts: Resource parts to include
  - format: Response format

Returns:
  Paginated list of subscriptions.`,
    {
      maxResults: z.number().int().min(1).max(50).default(25).describe('Maximum results'),
      pageToken: z.string().optional().describe('Pagination token'),
      parts: z
        .array(z.string())
        .optional()
        .default(['snippet', 'contentDetails'])
        .describe('Resource parts'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ maxResults, pageToken, parts, format }) => {
      try {
        const result = await client.listMySubscriptions({ maxResults, pageToken }, parts);
        return formatResponse(result, format, 'subscriptions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Channel Subscribers
  // ===========================================================================
  server.tool(
    'youtube_list_my_subscribers',
    `List the authenticated user's subscribers.

Requires OAuth authentication.

Args:
  - maxResults: Maximum results to return (1-50)
  - pageToken: Pagination token
  - parts: Resource parts to include
  - format: Response format

Returns:
  Paginated list of subscribers.`,
    {
      maxResults: z.number().int().min(1).max(50).default(25).describe('Maximum results'),
      pageToken: z.string().optional().describe('Pagination token'),
      parts: z
        .array(z.string())
        .optional()
        .default(['snippet', 'subscriberSnippet'])
        .describe('Resource parts'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ maxResults, pageToken, parts, format }) => {
      try {
        const result = await client.listChannelSubscribers('mine', { maxResults, pageToken }, parts);
        return formatResponse(result, format, 'subscriptions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Subscribe
  // ===========================================================================
  server.tool(
    'youtube_subscribe',
    `Subscribe to a YouTube channel.

Requires OAuth authentication.

Args:
  - channelId: The channel ID to subscribe to

Returns:
  Created subscription.`,
    {
      channelId: z.string().describe('Channel ID to subscribe to'),
    },
    async ({ channelId }) => {
      try {
        const subscription = await client.subscribe(channelId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Subscribed', subscription }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Unsubscribe
  // ===========================================================================
  server.tool(
    'youtube_unsubscribe',
    `Unsubscribe from a YouTube channel.

Requires OAuth authentication.

Args:
  - subscriptionId: The subscription ID (not the channel ID)

Returns:
  Confirmation of unsubscription.`,
    {
      subscriptionId: z.string().describe('Subscription ID'),
    },
    async ({ subscriptionId }) => {
      try {
        await client.unsubscribe(subscriptionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Unsubscribed (subscription ${subscriptionId})` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
