import { PrismaAdapter } from '@next-auth/prisma-adapter'
import type { GetServerSidePropsContext } from 'next'
import {
  getServerSession,
  type DefaultSession,
  type NextAuthOptions
} from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { prisma } from '~/server/db'

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

  // type UserRole = 'ADMIN' | 'USER'
}

/**
 * Options for NextAuth.js used to configure adapters, providers, callbacks, etc.
 *
 * @see https://next-auth.js.org/configuration/options
 */
export const authOptions: NextAuthOptions = {
  callbacks: {
    session({ session, user, token }) {
      if (session.user) {
        if (user) {
          session.user.id = user.id
          // put other properties on the session here
          // session.user.role = user.role
        }
        if (token?.user) {
          session.user.id = (token.user as { id: string }).id
          // also dont forget to add other properties here
          // session.user.role = (token.user as { id: string; role: UserRole }).role
        }
      }
      return session
    },
    jwt({ token, user }) {
      user && (token.user = user)
      return token
    }
  },
  adapter: PrismaAdapter(prisma), // comment this out when using credentials provider or disable database persistence
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
