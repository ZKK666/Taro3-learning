/**
 * 评论相关接口服务
 */

import { get, post } from './request'
import type {
  CommentInfo,
  ReplyInfo,
  CommentListParams,
  ReplyListParams,
  PostCommentParams,
  PostReplyParams,
  PostCommentResult
} from '@/types/comment'
import type { PaginationData } from '@/types/api'

const commentService = {
  /**
   * 获取评论列表
   * GET /comment/list
   */
  getCommentList(params: CommentListParams): Promise<PaginationData<CommentInfo>> {
    return get('/comment/list', params)
  },

  /**
   * 获取回复列表
   * GET /comment/reply-list
   */
  getReplyList(params: ReplyListParams): Promise<PaginationData<ReplyInfo>> {
    return get('/comment/reply-list', params)
  },

  /**
   * 发表评论
   * POST /comment/post
   */
  postComment(params: PostCommentParams): Promise<PostCommentResult> {
    return post('/comment/post', params)
  },

  /**
   * 发表回复
   * POST /comment/reply
   */
  postReply(params: PostReplyParams): Promise<PostCommentResult> {
    return post('/comment/reply', params)
  },

  /**
   * 点赞评论
   * POST /comment/like
   */
  likeComment(commentId: string): Promise<{ likeCount: number }> {
    return post('/comment/like', { commentId })
  },

  /**
   * 取消点赞评论
   * POST /comment/unlike
   */
  unlikeComment(commentId: string): Promise<{ likeCount: number }> {
    return post('/comment/unlike', { commentId })
  },

  /**
   * 删除评论
   * POST /comment/delete
   */
  deleteComment(commentId: string): Promise<void> {
    return post('/comment/delete', { commentId })
  },

  /**
   * 举报评论
   * POST /comment/report
   */
  reportComment(commentId: string, reason: string): Promise<void> {
    return post('/comment/report', { commentId, reason })
  }
}

export default commentService
