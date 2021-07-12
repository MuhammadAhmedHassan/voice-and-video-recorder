import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import type { GetServerSidePropsContext } from "next";
import { IPost } from "../../types/article";

interface Props {
  post: IPost;
}

function Post({ post }: Props) {
  const router = useRouter();
  const { id } = router.query;
  return (
    <div>
      <h3>{post.title}</h3>
      <p>{post.body}</p>

      <Link href="/">
        <a>Go Back</a>
      </Link>
    </div>
  );
}

export const getStaticProps = async (ctx: GetServerSidePropsContext) => {
  const id = ctx.params?.id;
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  const post = await res.json();
  return {
    props: { post },
  };
};

export const getStaticPaths = async () => {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts`);
  const posts = (await res.json()) as IPost[];

  const paths = posts.map(({ id }) => ({ params: { id: id + "" } }));

  // return { paths: [ { params: { id: '1' } }, { params: { id: '2' } } ]}
  return { paths, fallback: false };
};

export default Post;
