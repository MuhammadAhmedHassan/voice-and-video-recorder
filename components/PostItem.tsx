import React from "react";
import Link from "next/link";
import styles from "../styles/Home.module.css";
import { Post } from "../types/article";

interface Props {
  post: Post;
}

function PostItem({ post }: Props) {
  return (
    <Link href="/posts/[id]" as={`/posts/${post.id}`}>
      <a className={styles.card}>
        <h3>{post.title} &rarr;</h3>
        <p>{post.body}</p>
      </a>
    </Link>
  );
}

export default PostItem;
