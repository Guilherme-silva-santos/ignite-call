import { Button, TextInput, Text } from '@ignite-ui/react'
import { ArrowRight } from 'phosphor-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Form, FormAnnotation } from './styles'
import { useRouter } from 'next/router'

const ClaimUsernameFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: 'O usuário precisa conter pelo menos 3 letras' })
    .regex(/^([a-z\\\\-]+)$/i, {
      message: 'O usuário pode ter apenas letras e hifens',
    })
    .transform((username) => username.toLocaleLowerCase()),
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

type ClaimUsernameFormData = z.infer<typeof ClaimUsernameFormSchema>
// converte a estrutara do zod por uma estrutura do typescript

export function ClaimUsernameForm() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }, // serve para que seja permito pegar os erros de validação passaods nas messages no claimusernameform
  } = useForm<ClaimUsernameFormData>({
    resolver: zodResolver(ClaimUsernameFormSchema), // a forma com que ele deve validar o usuario
  }) // o <> serve para mostrar quais campos tem ali dentro

  const router = useRouter()

  async function handleClaimUsername(data: ClaimUsernameFormData) {
    const { username } = data

    router.push(`/register?username=${username}`)
    // usando o router do use router, fazezemos um push para a rota que queremos, no caso a rota register
    // passando um username para ela sendo o username digitado no input
  }
  return (
    <>
      <Form as="form" onSubmit={handleSubmit(handleClaimUsername)}>
        <TextInput
          size="sm"
          prefix="ignite.com/"
          placeholder="seu-usuário"
          {...register('username')}
        />
        <Button size="sm" type="submit" disabled={isSubmitting}>
          Reservar
          <ArrowRight />
        </Button>
      </Form>

      <FormAnnotation>
        <Text size="sm">
          {errors.username
            ? errors.username.message
            : 'Digite o nome de usuário'}
          {/* se dentro do username hover um erros mostra a mensagem de erro definada pelo message se não 
      aparecera uma mensagem padrão  
  */}
        </Text>
      </FormAnnotation>
    </>
  )
}
