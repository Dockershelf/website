export type PublicPost = {
  id: string;
  slug: string;
  title: string;
  body: string;
  excerpt: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PublicPostSummary = Omit<PublicPost, "body">;
