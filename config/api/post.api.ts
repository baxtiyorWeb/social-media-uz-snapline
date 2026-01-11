import api from "@/config/api";
import { Post } from "@/interfaces/interfaces";

// ============================================
// API Funksiyalari (Faqat API chaqiruvlari)
// ============================================

/**
 * Barcha postlarni (Lenta) pagination bilan API'dan oladi. (GET /posts)
 */
export async function fetchFeedPosts(
  page: number,
  limit: number,
  category?: string
): Promise<Post[]> {
  try {
    const response = await api.get("/posts", {
      params: { page, limit, category },
    });

    console.log(response);
    
    // Post turi, interfeysga mos kelishi uchun response.data dan foydalaniladi
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Postni like/unlike qilish uchun API'ga chaqiruv yuboradi. (POST /posts/:id/like)
 */
export async function togglePostLike(
  postId: number
): Promise<{ isLiked: boolean; likes: number }> {
  try {
    // API chaqiruvi
    const response = await api.post(`/posts/${postId}/like`);

    // API'dan kelgan natijani qaytaradi (isLiked va likes soni)
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Yangi sharh yaratish uchun API'ga chaqiruv yuboradi. (POST /comments)
 */
export async function createComment(
  postId: number,
  content: string
): Promise<any> {
  try {
    const response = await api.post("/comments", { postId, content });
    
    // Yaratilgan sharh ob'ektini qaytaradi
    return response.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Postga tegishli sharhlarni API'dan olish. (GET /comments/post/:postId)
 */
export async function fetchCommentsByPost(
  postId: number,
  page: number = 1,
  limit: number = 10
): Promise<any[]> {
  try {
    const response = await api.get(`/comments/post/${postId}`, {
      params: { page, limit },
    });
    
    // Sharhlar ro'yxatini qaytaradi
    return response.data;
  } catch (error) {
    throw error;
  }
}