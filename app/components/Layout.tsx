import { User } from '@prisma/client';
import React from 'react';
import { Link, LoaderFunction } from 'remix';
import { getUser } from '~/utils/session.server';

type IProps = {
  children: React.ReactNode;
  user?: User | null;
};

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUser(request);
  return { user };
};

export default function Layout({ children, user }: IProps) {
  return (
    <>
      <nav className="navbar">
        <Link to="/" className="logo">
          Remix
        </Link>
        <ul className="nav">
          <li>
            <Link to="/posts">posts</Link>
          </li>
          {user ? (
            <li>
              <form action="/auth/logout" method="post">
                <button type="submit" className="btn">
                  Logout, {user.username}
                </button>
              </form>
            </li>
          ) : (
            <li>
              <Link to="/auth/login">Login</Link>
            </li>
          )}
        </ul>
      </nav>
      <div className="container">{children}</div>
    </>
  );
}
