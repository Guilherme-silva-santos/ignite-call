// import { api } from '@/src/lib/axios'
import { Button, Heading, MultiStep, Text } from '@ignite-ui/react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { ArrowRight, Check } from 'phosphor-react'

import { Container, Header } from '../styles'
import { AuthError, ConnectBox, ConnecteItem } from './styles'

export default function ConnectCalendar() {
  const session = useSession()
  // serve para obter informações do usuário logado

  const router = useRouter()

  const hasAuthError = !!router.query.error
  // o query pegara o erro da url
  const isSignedIn = session.status === 'authenticated'
  // se o user efetuou o login com o google de forma correta
  // o authenticated vem de dentro dos cookies do brouwser apos efetuar o login

  async function handleConnectCalendar() {
    await signIn('google')
  }

  return (
    <Container>
      <Header>
        <Heading as="strong">Conecte sua agenda!</Heading>
        <Text>
          Conecte o seu calendário para verificar automaticamente as horas
          ocupadas e os novos eventos à medida em que são agendados.
        </Text>

        <MultiStep size={4} currentStep={2} />
      </Header>
      <ConnectBox>
        <ConnecteItem>
          <Text>Google Calendar</Text>
          {isSignedIn ? (
            <Button size="sm" disabled>
              Conectado
              <Check />
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleConnectCalendar}
            >
              Conectar
              <ArrowRight />
            </Button>
          )}
        </ConnecteItem>

        {hasAuthError && (
          <AuthError size="sm">
            Falha ao se conectar ao Google, verifique se você habilitou as
            permissões de acesso ao Google Calendar.
          </AuthError>
        )}

        <Button size="sm" disabled={!isSignedIn}>
          Próximo passo
          <ArrowRight />
        </Button>
      </ConnectBox>
    </Container>
  )
}
