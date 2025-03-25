// 在 script 部分添加接口定义
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
}
