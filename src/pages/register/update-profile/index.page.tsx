import { zodResolver } from '@hookform/resolvers/zod'
import {
  Avatar,
  Button,
  Heading,
  MultiStep,
  Text,
  TextArea,
} from '@ignite-ui/react'

import { ArrowRight } from 'phosphor-react'

import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Container, Header } from '../styles'
import { FormAnnotation, ProfileBox } from './styles'
import { useSession } from 'next-auth/react'
import { GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth'
import { buildNextAuthOptions } from '../../api/auth/[...nextauth].api'
import { api } from '@/src/lib/axios'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'

const UpdateProfileSchema = z.object({
  bio: z.string(),
})
type UpdateProfileData = z.infer<typeof UpdateProfileSchema>

export default function UpdateProfile() {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<UpdateProfileData>({
    resolver: zodResolver(UpdateProfileSchema),
  })

  const session = useSession()
  // quando pegamos o use session e demos um log ele demora um certo tempo até fazer a conexão com o back
  // pois essa informações não ficam salvas nos cookies
  // então existe uma forma para quando quisermos buscar as informações do user e estas informações já estarem
  // disponiveis desde a primeira chamada e sem precisar fazer qualquer tipo de loading, apenas usando a funcion
  // getserversideprops
  console.log(session)

  // para obter informações do usuario logado
  const router = useRouter()

  async function handleUpdateProfile(data: UpdateProfileData) {
    await api.put('/users/profile', {
      bio: data.bio,
    })

    await router.push(`/schedule/${session.data?.user.username}`)
  }

  return (
    <>
      <NextSeo title="Atualize seu perfil | Ignite Call" noindex />
      <Container>
        <Header>
          <Heading as="strong">Bem-vindo ao Ignite Call!</Heading>
          <Text>
            Precisamos de algumas informações para criar seu perfil! Ah, você
            pode editar essas informações depois.
          </Text>

          <MultiStep size={4} currentStep={4} />
        </Header>

        <ProfileBox as="form" onSubmit={handleSubmit(handleUpdateProfile)}>
          <label>
            <Text size="sm">Foto de Perfil</Text>
            <Avatar
              src={session.data?.user.avatar_url}
              referrerPolicy="no-referrer"
              alt={session.data?.user.name}
            />
          </label>

          <label>
            <Text size="sm">Sobre Você</Text>
            <TextArea placeholder="Seu nome" {...register('bio')} />
            <FormAnnotation>
              Fale um pouco sobre você. Isto será exibido na sua página pessoal
            </FormAnnotation>
          </label>

          <Button type="submit" disabled={isSubmitting}>
            Finalizar
            <ArrowRight />
          </Button>
        </ProfileBox>
      </Container>
    </>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  /**
   * no arquivo __app, temos o session provider envolvendo toda a aplicação, e nesse sessionprovider tem a prop session
   * e essa session vem de dentro de pageprops que tudo que é retornado de dentro do  getServerSideProps
   * so que por padrão esse session esta com undefined, ele não foi carregado pois em nenhuma págian tem o
   * getServerSideProps retornando a session com as props por isso quando é dado um log na session use session sem ter
   * o getServerSideProps em um primeiro momento ele retorna undefined, pois em nenhum momento esta sendo pre definido
   * um valor para ela
   *
   * Então usesession so carrega a session quando ela é requisitada
   *
   * a função getsession pode ser usada pois ela é um codigo node e a getServerSideProps tbm é
   * 
   * 
   * 
   * no arquivo [..next] foi mudado o req e res para a tipagem que pode ser
   *   req: NextApiRequest | NextPageContext['req'],
       res: NextApiResponse | NextPageContext['res'],
       então eles podem ser tanto NextApiRequest quanto NextPageContext

       assim desde o primeiro carregamento ass informações do user já estarão disponiveis 
       pois o req e res do getServerSession é do tipo NextApiResponse
       e o req e o res do GetServerSideProps é do tipo NextPageContext
   */

  const session = await getServerSession(
    req,
    res,
    buildNextAuthOptions(req, res),
  )

  return {
    props: {
      session,
    },
  }
}
