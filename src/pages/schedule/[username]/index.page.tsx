// a pasta foi criada como [username] pois é o parametro que a url ira receber

import { GetStaticPaths, GetStaticProps } from 'next'
import { Avatar, Heading, Text } from '@ignite-ui/react'
import { Container, UserHeader } from './styles'
import { prisma } from '@/src/lib/prisma'
import { ScheduleForm } from './ScheduleForm'

interface ScheduleProps {
  user: {
    name: string
    bio: string
    avatarUrl: string
  }
}

export default function Schedule({ user }: ScheduleProps) {
  return (
    <Container>
      <UserHeader>
        <Avatar src={user.avatarUrl} />
        <Heading>{user.name}</Heading>
        <Text>{user.bio}</Text>
      </UserHeader>

      <ScheduleForm />
    </Container>
  )
}

/**
 * este metodo é usado quando temos uma página estatica e temos um parametro dinamico que no caso é o username
 * pois quando for dada a build no projeto ele gera todas as páginas estaticas e no momento da build o next não sabe
 * qual é o parametro username.
 * GetStaticPaths que fala quais são os usernames= parametros que eu quero gerar de forma estatica desde o primeiro
 * momento da build.
 *
 * então retorna os paths como vazio para que não gere páginas estaticas logo no momento da build
 * e sim conforme os users forem acessando a pagina.
 *
 * fallback: 'blocking', para quando um user tentar acessar uma página que ela ainda não é estatica
 * o next vai buscar os dados no banco e vai gerar a pagina estatica pelo server side do next e quando estiver pronto
 * devolve-la para o user
 *
 */
export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps = async ({ params }) => {
  // para que essa pagina seja estatica, pois a amaioria dos elementos não vão mudar
  const username = String(params?.username)
  // pega o username como parametro

  // GetStaticProps sempre será executado no lado servidor
  const user = await prisma.user.findUnique({
    where: {
      username,
    },
  })
  if (!user) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      user: {
        name: user.name,
        bio: user.bio,
        avatarUrl: user.avatar_url,
      },
    },
    // de quanto em quanto tempo essa pagina ira recarregar
    revalidate: 60 * 60 * 24,
  }
}
