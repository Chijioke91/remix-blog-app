import { useCatch } from 'remix';
import Layout from '~/components/Layout';

export default function Index() {
  return (
    <div>
      <h1>Welcome to Remix</h1>
      <p>
        Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quibusdam
        explicabo voluptate error, cum provident cumque, minus dignissimos quam
        necessitatibus, totam voluptatibus? Commodi fugiat excepturi
        consequuntur a autem harum officia minus.
      </p>
    </div>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  if (caught.status === 404) {
    return <h4>There are no posts to display.</h4>;
  }
  throw new Error(`Unexpected caught response with status: ${caught.status}`);
}

export function ErrorBoundary() {
  return <p>I did a whoopsies.</p>;
}
