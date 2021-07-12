import React from "react";
import styles from "../styles/Home.module.css";
import { Post } from "../types/article";
import PostItem from "./PostItem";

interface Props {
  posts: Post[];
}

function PostList({ posts }: Props) {
  return (
    <div className={styles.grid}>
      {posts.map((p) => (
        <PostItem post={p} key={p.id} />
      ))}
    </div>
  );
}

export default PostList;
