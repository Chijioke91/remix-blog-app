import type { Post } from '@prisma/client';
import {
  Link,
  LoaderFunction,
  MetaFunction,
  useCatch,
  useLoaderData,
} from 'remix';
import { db } from '~/utils/db.server';

export const meta: MetaFunction = () => {
  return {
    title: `Posts`,
    description: `This route is for a All posts`,
  };
};

type LoaderData = {
  posts: Array<Post>;
};

export const loader: LoaderFunction = async () => {
  const data: LoaderData = {
    posts: await db.post.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
    }),
  };

  if (!data.posts) {
    throw new Response('Posts Not found.', {
      status: 404,
    });
  }

  return data;
};

export default function PostsIndexRoute() {
  const { posts } = useLoaderData<LoaderData>();

  return (
    <>
      <div className="page-header">
        <h1>Posts</h1>
        <Link prefetch="intent" to="new" className="btn">
          New Post
        </Link>
      </div>

      <ul className="posts-list">
        {posts.map((post) => (
          <li key={post.id}>
            <Link prefetch="intent" to={post.id}>
              <h3>{post.title}</h3>
              {new Date(post.createdAt).toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <h4>There are no jokes to display.</h4>;
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary() {
  return <h4>I did a whoopsies.</h4>;
}
