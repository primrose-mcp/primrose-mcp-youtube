/**
 * YouTube MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials (OAuth tokens, API keys) are parsed from request headers,
 * allowing a single server deployment to serve multiple customers.
 *
 * Required Headers (one of):
 * - X-YouTube-Access-Token: OAuth 2.0 access token for authenticated operations
 * - X-YouTube-API-Key: API key for public data access
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createYouTubeClient } from './client.js';
import {
  registerActivityTools,
  registerCaptionTools,
  registerCategoryTools,
  registerChannelSectionTools,
  registerChannelTools,
  registerCommentTools,
  registerI18nTools,
  registerMemberTools,
  registerPlaylistItemTools,
  registerPlaylistTools,
  registerSearchTools,
  registerSubscriptionTools,
  registerVideoTools,
} from './tools/index.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'primrose-mcp-youtube';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

export class YouTubeMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-YouTube-Access-Token or X-YouTube-API-Key header instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  const client = createYouTubeClient(credentials);

  // Register all tools
  registerVideoTools(server, client);
  registerChannelTools(server, client);
  registerPlaylistTools(server, client);
  registerPlaylistItemTools(server, client);
  registerCommentTools(server, client);
  registerSubscriptionTools(server, client);
  registerCaptionTools(server, client);
  registerActivityTools(server, client);
  registerChannelSectionTools(server, client);
  registerI18nTools(server, client);
  registerCategoryTools(server, client);
  registerMemberTools(server, client);
  registerSearchTools(server, client);

  // Test connection tool
  server.tool('youtube_test_connection', 'Test the connection to the YouTube API', {}, async () => {
    try {
      const result = await client.testConnection();
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Stateless MCP with Streamable HTTP
    if (url.pathname === '/mcp' && request.method === 'POST') {
      const credentials = parseTenantCredentials(request);

      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: ['X-YouTube-Access-Token or X-YouTube-API-Key'],
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const server = createStatelessServer(credentials);
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint for legacy clients
    if (url.pathname === '/sse') {
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'YouTube Data API v3 MCP Server',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass credentials via request headers',
          required_headers: {
            'X-YouTube-Access-Token': 'OAuth 2.0 access token (for authenticated operations)',
            'X-YouTube-API-Key': 'API key (for public data access)',
          },
        },
        tools: {
          videos: [
            'youtube_get_video',
            'youtube_list_videos',
            'youtube_search_videos',
            'youtube_update_video',
            'youtube_delete_video',
            'youtube_rate_video',
            'youtube_get_video_rating',
            'youtube_report_video_abuse',
          ],
          channels: [
            'youtube_get_my_channel',
            'youtube_get_channel',
            'youtube_list_channels',
            'youtube_get_channel_by_username',
            'youtube_update_channel',
            'youtube_search_channels',
          ],
          playlists: [
            'youtube_list_my_playlists',
            'youtube_list_channel_playlists',
            'youtube_get_playlist',
            'youtube_create_playlist',
            'youtube_update_playlist',
            'youtube_delete_playlist',
            'youtube_search_playlists',
          ],
          playlistItems: [
            'youtube_list_playlist_items',
            'youtube_add_video_to_playlist',
            'youtube_update_playlist_item',
            'youtube_remove_from_playlist',
          ],
          comments: [
            'youtube_list_comment_threads',
            'youtube_get_comment_thread',
            'youtube_post_comment',
            'youtube_list_comment_replies',
            'youtube_reply_to_comment',
            'youtube_update_comment',
            'youtube_delete_comment',
            'youtube_set_comment_moderation_status',
          ],
          subscriptions: [
            'youtube_list_my_subscriptions',
            'youtube_list_my_subscribers',
            'youtube_subscribe',
            'youtube_unsubscribe',
          ],
          captions: [
            'youtube_list_captions',
            'youtube_download_caption',
            'youtube_insert_caption',
            'youtube_update_caption',
            'youtube_delete_caption',
          ],
          activities: ['youtube_list_activities'],
          channelSections: [
            'youtube_list_channel_sections',
            'youtube_insert_channel_section',
            'youtube_update_channel_section',
            'youtube_delete_channel_section',
          ],
          i18n: ['youtube_list_languages', 'youtube_list_regions'],
          categories: ['youtube_list_video_categories', 'youtube_list_video_abuse_report_reasons'],
          members: ['youtube_list_members', 'youtube_list_membership_levels'],
          search: ['youtube_search'],
          connection: ['youtube_test_connection'],
        },
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
