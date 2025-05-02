export interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: string;
  imageUrl: string | null;
  starsCount: number;
  status: number;
  allow: number;
  likesCount: number;
  favoritesCount: number;
  commentsCount: number;
  isLiked?: boolean;
  isFavorite?: boolean;
}
