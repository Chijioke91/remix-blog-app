import {
  Links,
  LiveReload,
  LoaderFunction,
  Meta,
  Outlet,
  Scripts,
  useCatch,
  useLoaderData,
} from 'remix';
import type { MetaFunction } from 'remix';
import Layout from './components/Layout';

import styles from '~/styles/global.css';
import { getUser } from './utils/session.server';
import { User } from '@prisma/client';

type DocumentType = {
  children: React.ReactNode;
  title?: string;
};

export function links() {
  return [{ rel: 'stylesheet', href: styles }];
}

export const meta: MetaFunction = () => {
  return {
    description: 'Simple Blog built with Remix',
    keywords: 'blog, remix, react, javascript',
  };
};

type LoaderData = {
  user: User | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return { user };
};

export default function App() {
  const { user } = useLoaderData<LoaderData>();

  return (
    <Document>
      <Layout user={user}>
        <Outlet />
      </Layout>
    </Document>
  );
}
function Document({ children, title }: DocumentType) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <Meta />
        <Links />
        <title>{title ? title : 'Remix Blog'}</title>
      </head>
      <body>
        {children}
        <Scripts />
        {process.env.NODE_ENV === 'development' ? <LiveReload /> : null}
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();

  return (
    <Document title={`${caught.status} ${caught.statusText}`}>
      <Layout>
        <h1>
          {caught.status} {caught.statusText}
        </h1>
      </Layout>
    </Document>
  );
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error);

  return (
    <Document title="Uh-oh!">
      <Layout>
        <h1>Error</h1>
        <p>{error.message}</p>
      </Layout>
    </Document>
  );
}
