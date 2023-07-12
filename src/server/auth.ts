import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { GetServerSidePropsContext } from 'next'
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions
} from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { prisma } from '~/server/db'

// type UserRole = 'ADMIN' | 'USER'

/**
 * Module augmentation for `next-auth` types. Allows us to add custom properties to the `session`
 * object and keep type safety.
 *
 * @see https://next-auth.js.org/getting-started/typescript#module-augmentation
 */
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string
      // ...other properties
      // role: UserRole
    } & DefaultSession['user']
  }

  // interface User {
  //   // ...other properties
  //   // role: UserRole
  // }
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user, token }) {
      return {
        ...session,
        user: {
          ...session.user,
          ...user,
          ...(token?.user ? token.user : {})
        }
      }
    },
    jwt({ token, user }) {
      user && (token.user = user)
      return token
    }
  },
  // comment this below when using credentials provider or disable database persistence
  adapter: PrismaAdapter(prisma),
  providers: [
    // uncomment this to enable the credentials provider
    // CredentialsProvider({
    //   name: 'Credentials',
    //   credentials: {
    //     email: {
    //       label: 'Email',
    //       type: 'email',
    //       placeholder: 'your@email.com'
    //     },
    //     password: {
    //       label: 'Password',
    //       type: 'password',
    //       placeholder: 'Enter Password'
    //     }
    //   },
    //   async authorize(credentials) {
    //     if (!credentials) return null
    //     const user = await prisma.user.findFirst({
    //       where: {
    //         email: credentials.email
    //       }
    //     })
    //     if (
    //       user &&
    //       user.password &&
    //       (await compare(credentials.password, user.password))
    //     ) {
    //       return {
    //         id: user.id,
    //         email: user.email,
    //         name: user.name,
    //         image: user.image
    //       }
    //     } else {
    //       return null
    //     }
    //   }
    // })
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: process.env.EMAIL_FROM
    })
    /**
     * ...add more providers here.
     *
     * Most other providers require a bit more work than the Discord provider. For example, the
     * GitHub provider requires you to add the `refresh_token_expires_in` field to the Account
     * model. Refer to the NextAuth.js docs for the provider you want to use. Example:
     *
     * @see https://next-auth.js.org/providers/github
     */
  ]
}

/**
 * Wrapper for `getServerSession` so that you don't need to import the `authOptions` in every file.
 *
 * @see https://next-auth.js.org/configuration/nextjs
 */
export const getServerAuthSession = (ctx: {
  req: GetServerSidePropsContext['req']
  res: GetServerSidePropsContext['res']
}) => {
  return getServerSession(ctx.req, ctx.res, authOptions)
}
