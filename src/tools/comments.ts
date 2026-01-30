/**
 * Comment Tools
 *
 * MCP tools for YouTube comment operations.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { YouTubeClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

export function registerCommentTools(server: McpServer, client: YouTubeClient): void {
  // ===========================================================================
  // List Comment Threads
  // ===========================================================================
  server.tool(
    'youtube_list_comment_threads',
    `List comment threads (top-level comments with replies) for a video or channel.

Args:
  - videoId: Video ID to get comments for
  - channelId: Channel ID to get comments for (alternative to videoId)
  - allThreadsRelatedToChannelId: Get all threads related to a channel
  - maxResults: Maximum results to return (1-100)
  - pageToken: Pagination token
  - order: Sort order (time, relevance)
  - searchTerms: Filter by search terms
  - moderationStatus: Filter by moderation status (requires auth)
  - format: Response format

Returns:
  Paginated list of comment threads.`,
    {
      videoId: z.string().optional().describe('Video ID'),
      channelId: z.string().optional().describe('Channel ID'),
      allThreadsRelatedToChannelId: z.string().optional().describe('Get all threads related to channel'),
      maxResults: z.number().int().min(1).max(100).default(25).describe('Maximum results'),
      pageToken: z.string().optional().describe('Pagination token'),
      order: z.enum(['time', 'relevance']).optional().describe('Sort order'),
      searchTerms: z.string().optional().describe('Filter by search terms'),
      moderationStatus: z.enum(['heldForReview', 'likelySpam', 'published']).optional().describe('Moderation status'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ videoId, channelId, allThreadsRelatedToChannelId, maxResults, pageToken, order, searchTerms, moderationStatus, format }) => {
      try {
        const result = await client.listCommentThreads({
          videoId,
          channelId,
          allThreadsRelatedToChannelId,
          maxResults,
          pageToken,
          order,
          searchTerms,
          moderationStatus,
        });
        return formatResponse(result, format, 'commentThreads');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Comment Thread
  // ===========================================================================
  server.tool(
    'youtube_get_comment_thread',
    `Get a specific comment thread by ID.

Args:
  - commentThreadId: The comment thread ID
  - parts: Resource parts to include
  - format: Response format

Returns:
  Comment thread with top-level comment and replies.`,
    {
      commentThreadId: z.string().describe('Comment thread ID'),
      parts: z.array(z.string()).optional().default(['snippet', 'replies']).describe('Resource parts'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ commentThreadId, parts, format }) => {
      try {
        const thread = await client.getCommentThread(commentThreadId, parts);
        return formatResponse(thread, format, 'commentThread');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Post Comment
  // ===========================================================================
  server.tool(
    'youtube_post_comment',
    `Post a new top-level comment on a video or channel.

Requires OAuth authentication.

Args:
  - channelId: The channel ID (required)
  - videoId: The video ID (optional - if not provided, posts channel comment)
  - text: Comment text

Returns:
  Created comment thread.`,
    {
      channelId: z.string().describe('Channel ID'),
      videoId: z.string().optional().describe('Video ID'),
      text: z.string().describe('Comment text'),
    },
    async ({ channelId, videoId, text }) => {
      try {
        const thread = await client.postComment(channelId, videoId, text);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Comment posted', thread }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // List Replies
  // ===========================================================================
  server.tool(
    'youtube_list_comment_replies',
    `List replies to a comment.

Args:
  - parentId: The parent comment ID
  - maxResults: Maximum results to return (1-100)
  - pageToken: Pagination token
  - format: Response format

Returns:
  Paginated list of reply comments.`,
    {
      parentId: z.string().describe('Parent comment ID'),
      maxResults: z.number().int().min(1).max(100).default(25).describe('Maximum results'),
      pageToken: z.string().optional().describe('Pagination token'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ parentId, maxResults, pageToken, format }) => {
      try {
        const result = await client.listComments(parentId, { maxResults, pageToken });
        return formatResponse(result, format, 'comments');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Reply to Comment
  // ===========================================================================
  server.tool(
    'youtube_reply_to_comment',
    `Reply to an existing comment.

Requires OAuth authentication.

Args:
  - parentId: The parent comment ID to reply to
  - text: Reply text

Returns:
  Created reply comment.`,
    {
      parentId: z.string().describe('Parent comment ID'),
      text: z.string().describe('Reply text'),
    },
    async ({ parentId, text }) => {
      try {
        const comment = await client.replyToComment(parentId, text);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Reply posted', comment }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Comment
  // ===========================================================================
  server.tool(
    'youtube_update_comment',
    `Update an existing comment.

Requires OAuth authentication. You can only update your own comments.

Args:
  - commentId: The comment ID to update
  - text: New comment text

Returns:
  Updated comment.`,
    {
      commentId: z.string().describe('Comment ID to update'),
      text: z.string().describe('New comment text'),
    },
    async ({ commentId, text }) => {
      try {
        const comment = await client.updateComment(commentId, text);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Comment updated', comment }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Comment
  // ===========================================================================
  server.tool(
    'youtube_delete_comment',
    `Delete a comment.

Requires OAuth authentication. You can only delete your own comments or comments on your videos.

Args:
  - commentId: The comment ID to delete

Returns:
  Confirmation of deletion.`,
    {
      commentId: z.string().describe('Comment ID to delete'),
    },
    async ({ commentId }) => {
      try {
        await client.deleteComment(commentId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Comment ${commentId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Set Moderation Status
  // ===========================================================================
  server.tool(
    'youtube_set_comment_moderation_status',
    `Set the moderation status of comments.

Requires OAuth authentication. You can only moderate comments on your own videos.

Args:
  - commentIds: Array of comment IDs to moderate
  - moderationStatus: New moderation status (heldForReview, published, rejected)
  - banAuthor: Whether to ban the author from commenting (optional)

Returns:
  Confirmation of moderation.`,
    {
      commentIds: z.array(z.string()).describe('Comment IDs to moderate'),
      moderationStatus: z.enum(['heldForReview', 'published', 'rejected']).describe('Moderation status'),
      banAuthor: z.boolean().optional().default(false).describe('Ban the author'),
    },
    async ({ commentIds, moderationStatus, banAuthor }) => {
      try {
        await client.setCommentModerationStatus(commentIds, moderationStatus, banAuthor);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Moderation status set to ${moderationStatus} for ${commentIds.length} comment(s)` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
