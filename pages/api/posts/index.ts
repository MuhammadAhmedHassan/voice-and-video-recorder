import type { NextApiRequest, NextApiResponse } from "next";
import { IPost } from "../../../types/article";

const fetchPosts = async (limit: string | string[]) => {
  const url = limit
    ? `https://jsonplaceholder.typicode.com/posts?_limit=${limit}`
    : `https://jsonplaceholder.typicode.com/posts`;

  const result = await fetch(url);
  const posts = (await result.json()) as IPost[];

  if (posts)
    return {
      status: 200,
      posts,
    };
  else return { status: 404, posts: [] };
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const limit = req.query?.limit;
}
