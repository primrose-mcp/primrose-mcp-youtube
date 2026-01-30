/**
 * i18n Tools
 *
 * MCP tools for YouTube internationalization (languages and regions).
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { YouTubeClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerI18nTools(server: McpServer, client: YouTubeClient): void {
  // ===========================================================================
  // List Languages
  // ===========================================================================
  server.tool(
    'youtube_list_languages',
    `List application languages supported by YouTube.

Args:
  - hl: Language code for response localization (optional)
  - format: Response format

Returns:
  List of supported languages with codes and names.`,
    {
      hl: z.string().optional().describe('Language code for localization'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ hl, format }) => {
      try {
        const languages = await client.listI18nLanguages(hl);
        return formatResponse({ items: languages, count: languages.length, hasMore: false }, format, 'languages');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Regions
  // ===========================================================================
  server.tool(
    'youtube_list_regions',
    `List content regions supported by YouTube.

Args:
  - hl: Language code for response localization (optional)
  - format: Response format

Returns:
  List of supported regions with codes and names.`,
    {
      hl: z.string().optional().describe('Language code for localization'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ hl, format }) => {
      try {
        const regions = await client.listI18nRegions(hl);
        return formatResponse({ items: regions, count: regions.length, hasMore: false }, format, 'regions');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
