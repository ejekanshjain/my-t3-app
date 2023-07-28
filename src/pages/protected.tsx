import { getServerAuthSession } from '@/server/auth'
import { api } from '@/utils/api'
import type { GetServerSideProps, NextPage } from 'next'
import { useSession } from 'next-auth/react'
import Head from 'next/head'

export const getServerSideProps: GetServerSideProps = async context => {
  const session = await getServerAuthSession(context)

  if (session) {
    return {
      props: {}
    }
  } else {
    return {
      redirect: {
        notFound: false
      },
      props: {}
    }
  }
}

const Protected: NextPage = () => {
  const { data: sessionData } = useSession()

  const { data: secret } = api.example.private.useQuery(undefined, {
    enabled: !!sessionData?.user
  })

  return (
    <>
      <Head>
        <title>Protected Page</title>
        <meta name="description" content="Protected Page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <h2 className="text-xl text-blue-500">Protected Page</h2>
        <p>{secret?.message}</p>
      </main>
    </>
  )
}

export default Protected
