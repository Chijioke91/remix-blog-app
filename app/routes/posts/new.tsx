import {
  ActionFunction,
  Form,
  json,
  Link,
  LoaderFunction,
  redirect,
  useActionData,
  useCatch,
  useTransition,
} from 'remix';
import { db } from '~/utils/db.server';
import { getUserId, requireUserId } from '~/utils/session.server';

export const loader: LoaderFunction = async ({ request }) => {
  const userId = await getUserId(request);
  if (!userId) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return {};
};

function validateTitle(title: string) {
  if (title.length < 3) {
    return `Title should be at least 3 characters long`;
  }
}

function validateBody(body: string) {
  if (body.length < 10) {
    return `Body should be at least 10 characters long`;
  }
}

const badRequest = (data: ActionData) => json(data, { status: 400 });

type ActionData = {
  formError?: string;
  fieldErrors?: {
    title: string | undefined;
    body: string | undefined;
  };
  fields?: {
    title: string;
    body: string;
  };
};

export const action: ActionFunction = async ({ request }) => {
  const userId = await requireUserId(request);
  const form = await request.formData();
  const title = form.get('title');
  const body = form.get('body');

  if (typeof title !== 'string' || typeof body !== 'string') {
    return badRequest({
      formError: `Form not submitted correctly. Please enter valid inputs`,
    });
  }

  const fieldErrors = {
    title: validateTitle(title),
    body: validateBody(body),
  };

  const fields = { title, body };

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields });
  }

  const post = await db.post.create({
    data: {
      ...fields,
      userId,
    },
  });

  return redirect(`/posts/${post.id}`);
};

export default function NewPost() {
  const actionData = useActionData<ActionData>();

  let transition = useTransition();

  return (
    <>
      <div className="page-header">
        <h1>New Post</h1>
        <Link prefetch="intent" to="/posts" className="btn btn-reverse">
          Back
        </Link>
      </div>

      <div className="page-content">
        <div className="error">
          <p>{actionData?.formError && actionData?.formError}</p>
        </div>

        <Form method="post">
          <div className="form-control">
            <label>Title</label>
            <input
              type="text"
              name="title"
              defaultValue={actionData?.fields?.title}
            />
            <div className="error">
              <p>
                {actionData?.fieldErrors?.title &&
                  actionData?.fieldErrors?.title}
              </p>
            </div>
          </div>

          <div className="form-control">
            <label>Post Body</label>
            <textarea name="body" defaultValue={actionData?.fields?.body} />
            <div className="error">
              <p>
                {actionData?.fieldErrors?.body && actionData?.fieldErrors?.body}
              </p>
            </div>
          </div>

          <button type="submit" className="btn btn-block">
            {transition.submission ? 'creating post' : 'create post'}
          </button>
        </Form>
      </div>
    </>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 401) {
    return (
      <>
        <p>You must be logged in to create a joke.</p>
        <Link prefetch="intent" to="/login">
          Login
        </Link>
      </>
    );
  }
}

export function ErrorBoundary() {
  return <p>Something unexpected went wrong. Sorry about that.</p>;
}
