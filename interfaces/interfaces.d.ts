export interface Comment {
  id: string;
  content: string;
  user: {
    profile: {
      avatar: string;
      username: string;
    };
  };
  avatar: string;
  text: string;
  likes: number;
  timeAgo: string;
  replies?: Comment[];
}

export interface RelatedVideo {
  id: number;
  caption: string;
  thumbnail: string;
  user: {
    profile: {
      username: string;
      firstName: string;
      lastName: string;
      avatar: string;
    };
  };
  views: number;
  likes: number;
}

interface Post {
  id: string;
  username: string;
  avatar: string;
  mediaUrl: string;
  caption: string;
  likes: number;
  comments: number;
  shares: number;
  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;
  song?: string;
  location?: string;
}
