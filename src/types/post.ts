export interface Post {
  id: number;
  userId: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: string;
  imageUrl: string;
  starsCount: number;
  status: number;
  allow: number;
}
