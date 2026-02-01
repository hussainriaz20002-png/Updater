import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  timestamp: number;
  date: string;
}

// Format relative time (unchanged)
export const formatRelativeTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;

  if (diff < 60000) return "Just now";
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

// Toggle Like (Firestore Array)
export const toggleLike = async (
  articleId: string,
  userId: string,
): Promise<boolean> => {
  try {
    const articleRef = doc(db, "articles", articleId);
    const articleSnap = await getDoc(articleRef);

    if (!articleSnap.exists()) return false;

    const data = articleSnap.data();
    const likes = data.likes || [];
    const isLiked = likes.includes(userId);

    if (isLiked) {
      await updateDoc(articleRef, {
        likes: arrayRemove(userId),
      });
      return false; // Now unliked
    } else {
      await updateDoc(articleRef, {
        likes: arrayUnion(userId),
      });
      return true; // Now liked
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    throw error;
  }
};

// Check if user liked (Firestore)
export const hasUserLiked = async (
  articleId: string,
  userId: string,
): Promise<boolean> => {
  try {
    const articleRef = doc(db, "articles", articleId);
    const articleSnap = await getDoc(articleRef);
    if (!articleSnap.exists()) return false;
    const likes = articleSnap.data().likes || [];
    return likes.includes(userId);
  } catch {
    return false;
  }
};

// Get like count (Firestore)
export const getLikeCount = async (articleId: string): Promise<number> => {
  try {
    const articleRef = doc(db, "articles", articleId);
    const articleSnap = await getDoc(articleRef);
    if (!articleSnap.exists()) return 0;
    return articleSnap.data().likes?.length || 0;
  } catch {
    return 0;
  }
};

// Add Comment (Subcollection)
export const addComment = async (
  articleId: string,
  userId: string,
  userName: string,
  text: string,
): Promise<Comment> => {
  try {
    const commentsRef = collection(db, "articles", articleId, "comments");
    const newComment = {
      userId,
      userName,
      text,
      timestamp: Date.now(),
      date: new Date().toLocaleDateString("en-GB"),
    };
    const docRef = await addDoc(commentsRef, newComment);
    return { id: docRef.id, ...newComment };
  } catch (error) {
    console.error("Error adding comment:", error);
    throw error;
  }
};

// Delete Comment (Subcollection)
export const deleteComment = async (
  articleId: string,
  commentId: string,
  userId: string,
): Promise<boolean> => {
  try {
    const commentRef = doc(db, "articles", articleId, "comments", commentId);
    const commentSnap = await getDoc(commentRef);

    if (!commentSnap.exists()) {
      throw new Error("Comment not found");
    }

    const commentData = commentSnap.data();

    // Strict Check: Only the comment creator can delete
    if (commentData.userId !== userId) {
      throw new Error("Unauthorized: You can only delete your own comments.");
    }

    await deleteDoc(commentRef);
    return true;
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw error;
  }
};

// Get Comments (Subcollection)
export const getComments = async (articleId: string): Promise<Comment[]> => {
  try {
    const commentsRef = collection(db, "articles", articleId, "comments");
    const q = query(commentsRef, orderBy("timestamp", "desc")); // Show newest first
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Comment[];
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
};
