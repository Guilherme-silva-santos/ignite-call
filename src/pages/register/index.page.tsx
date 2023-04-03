import { api } from '@/src/lib/axios'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Heading, MultiStep, Text, TextInput } from '@ignite-ui/react'
import { useRouter } from 'next/router'
import { ArrowRight } from 'phosphor-react'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { AxiosError } from 'axios'

import { Container, Form, FormError, Header } from './styles'

const registerFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'O usuário precisa conter pelo menos 3 letras' })
    .regex(/^([a-z\\\\-]+)$/i, {
      message: 'O usuário pode ter apenas letras e hifens',
    })
    .transform((username) => username.toLocaleLowerCase()),

  name: z
    .string()
    .min(3, { message: 'O nome precisa conter pelo menos 3 letras' }),
})
/**
     *.regex(/^([a-z\\-]+)$/i, 
     o regex serve para passar para o username que ele so pode conter letras de a até z ou conter -
     e precisa começar e terminar com um dos dois 
     ^ = deve começar contendo 
     ([a-z\\-] === qualquer letra de a até z e permitindo o uso de hifem e o + é que pode ser usado uma ou mais vezes 
 * user name precisa possuir no minimo 3 caracs
 * esta validação esta sendo feita por conta do
 * resolver resolver: zodResolver(ClaimUsernameFormSchema),
 */

type RegisterFormData = z.infer<typeof registerFormSchema>

export default function Register() {
  const {
    register,
    handleSubmit,
    setValue, // para setar o valor de algum campo do formulario de uma maneira programática
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerFormSchema),
  })

  const router = useRouter()

  useEffect(() => {
    // para que caso o usuario altera a url o campo username seja alterado tambem como username digitado na url
    if (router.query.username) {
      setValue('username', String(router.query.username))
    }
  }, [router.query?.username, setValue])
  // a dependeicia é o router.querry.username, ou seja a dependencia é o que sera ou não digitado no campo

  async function handleRegister(data: RegisterFormData) {
    try {
      await api.post('/users', {
        // a resposta sera o api.post para criar uma requisição, e a criação de um user usando /users
        name: data.name,
        username: data.username,
      })

      await router.push('/register/connect-calendar')
      // apos o user der criar ele sera direcionado para conexão do calendario
    } catch (err) {
      if (err instanceof AxiosError && err?.response?.data?.message) {
        // se o error é uma instancia do axios erros e conter, error e dentro dele conter response e dentro data e dentro
        // message alert
        alert(err.response.data.message)
        return
      }

      console.error(err)
    }
  }

  return (
    <Container>
      <Header>
        <Heading as="strong">Bem-vindo ao Ignite Call!</Heading>
        <Text>
          Precisamos de algumas informações para criar seu perfil! Ah, você pode
          editar essas informações depois.
        </Text>

        <MultiStep size={4} currentStep={1} />
      </Header>

      <Form as="form" onSubmit={handleSubmit(handleRegister)}>
        <label>
          <Text size="sm">Nome de usuário</Text>
          <TextInput
            prefix="ignite.com/"
            placeholder="seu-usuário"
            {...register('username')}
          />

          {errors.username && (
            <FormError size="sm">{errors.username.message}</FormError>
          )}
        </label>

        <label>
          <Text size="sm">Nome completo</Text>
          <TextInput placeholder="Seu nome" {...register('name')} />

          {errors.name && (
            <FormError size="sm">{errors.name.message}</FormError>
          )}
        </label>

        <Button type="submit" disabled={isSubmitting}>
          Próximo passo
          <ArrowRight />
        </Button>
      </Form>
    </Container>
  )
}
