// 在 script 部分添加接口定义
export interface Post {
  id: number;
  user_id: number;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: string;
  image_url: string | null;
  stars_count: number;
  status: number;
}
