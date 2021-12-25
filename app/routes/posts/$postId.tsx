import type { Post } from '@prisma/client';
import {
  ActionFunction,
  Link,
  LoaderFunction,
  MetaFunction,
  redirect,
  useCatch,
  useLoaderData,
  useParams,
  useTransition,
} from 'remix';
import Layout from '~/components/Layout';
import { db } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';

type LoaderData = { post: Post; isOwner: boolean };

export const meta: MetaFunction = ({
  data,
}: {
  data: LoaderData | undefined;
}) => {
  if (!data) {
    return {
      title: 'No Post',
      description: 'No post found',
    };
  }
  return {
    title: `${data.post.title}`,
    description: `${data.post.title}`,
  };
};

export const loader: LoaderFunction = async ({ params, request }) => {
  const userId = await getUserId(request);
  const post = await db.post.findUnique({
    where: { id: params.postId },
  });
  if (!post) {
    throw new Response('Post Not found.', {
      status: 404,
    });
  }
  const data: LoaderData = { post, isOwner: post.userId === userId };

  return data;
};

export const action: ActionFunction = async ({ request, params }) => {
  const form = await request.formData();

  if (form.get('_method') === 'delete') {
    const userId = await requireUserId(request);

    const post = await db.post.findUnique({
      where: { id: params.postId },
    });

    if (!post) {
      throw new Response("Can't delete what does not exist", { status: 404 });
    }

    if (post.userId !== userId) {
      throw new Response('Sorry, you can only delete your post', {
        status: 401,
      });
    }

    await db.post.delete({ where: { id: params.postId } });

    return redirect('/posts');
  }
};

export default function Post() {
  const { post, isOwner } = useLoaderData<LoaderData>();

  const transition = useTransition();

  return (
    <div>
      <div className="page-header">
        <h1>{post.title}</h1>
        <Link prefetch="intent" to=".." className="btn btn-reverse">
          Back
        </Link>
      </div>
      <div className="page-content">{post.body}</div>

      <div className="page-footer">
        {isOwner && (
          <form method="POST">
            <input type="hidden" name="_method" value="delete" />
            <button className="btn btn-delete">
              {transition.submission ? 'deleting post' : 'Delete Post'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  const params = useParams();
  if (caught.status === 404) {
    return <h1>Huh? What the heck is "{params.postId}"?</h1>;
  }
  throw new Error(`Unhandled error: ${caught.status}`);
}

export function ErrorBoundary() {
  const { postId } = useParams();
  return (
    <Layout>{`There was an error loading post by the id ${postId}. Sorry.`}</Layout>
  );
}
