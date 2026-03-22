import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import { compare } from 'bcryptjs';
import { prisma } from './prisma';

export const authOptions: NextAuthOptions = {
  // Explicit secret avoids volatile hashing in prod; must match .env NEXTAUTH_SECRET / AUTH_SECRET
  secret: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: '/login' },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
    CredentialsProvider({
      name: 'credentials',
      credentials: { email: { label: 'Email', type: 'email' }, password: { label: 'Password', type: 'password' } },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const user = await prisma.user.findUnique({ where: { email: credentials.email } });
          if (!user || !user.password || !(await compare(credentials.password, user.password))) return null;
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        } catch (err) {
          console.error('[NextAuth] authorize error:', err);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Credentials: user has id/role from authorize
        if ((user as { id?: string }).id) {
          token.id = (user as { id: string }).id;
          token.role = (user as { role?: string }).role;
        } else {
          // OAuth (Google): create/find user in DB, get id and role
          const dbUser = await prisma.user.upsert({
            where: { email: user.email! },
            update: { name: user.name ?? undefined, image: user.image ?? undefined },
            create: {
              email: user.email!,
              name: user.name ?? undefined,
              image: user.image ?? undefined,
              password: null,
              role: 'viewer',
            },
          });
          token.id = dbUser.id;
          token.role = dbUser.role;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        // Use JWT role only — avoid a DB round-trip on every RSC request / navigation.
        // Role changes in DB apply on next sign-in (or use "Update session" if you add it later).
        (session.user as { role?: string }).role = token.role as string | undefined;
      }
      return session;
    },
  },
};
