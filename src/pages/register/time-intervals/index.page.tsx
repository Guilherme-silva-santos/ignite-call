import { api } from '../../../lib/axios'
import {
  Button,
  Checkbox,
  Heading,
  MultiStep,
  Text,
  TextInput,
} from '@ignite-ui/react'
import { ArrowRight } from 'phosphor-react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
import { Container, Header } from '../styles'
import { z } from 'zod'
import {
  FormError,
  IntervalBox,
  IntervalContainer,
  IntervalDay,
  IntervalInputs,
  IntervalItem,
} from './styles'
import { getWeekDays } from '@/src/utils/get-week-days'
import { zodResolver } from '@hookform/resolvers/zod'
import { convertTimeStringInMinutes } from '@/src/utils/convert-time-string-to-minutes'
import { useRouter } from 'next/router'
import { NextSeo } from 'next-seo'

const timeIntervalsFormSchema = z.object({
  intervals: z
    .array(
      z.object({
        weekDay: z.number().min(0).max(6),
        enabled: z.boolean(),
        startTime: z.string(),
        endTime: z.string(),

        // está apenas falando que cada campo é um objeto e definindo o que cada campo é
      }),
    )
    /**
     * com o zod podemos fazer a tranformação de dados
      como no form colocamos o input de dados de uma forma
      mas quando esses dados forem retornados atraves do submit
      eles cheguem de outra maneira
      como no caso abaixo que passa o transform que ira transformar 
      os dados.
     */
    .length(7) // é preciso receber todos os dias da semana dentro dos inervals
    .transform((intervals) => intervals.filter((interval) => interval.enabled))
    /**
     *   o pegou o array original e passou para a variavel intervals transform((intervals)
     *   => intervals.filter((interval) retorna o array original filtrado com somente os items
     *   que tem enabled sendo true
     */
    .refine((intervals) => intervals.length > 0, {
      message: 'Você precisa selecionar pelo menos um dias da semana! ',
      // recebe o arrayu original de intervalos, e retorna os intervals
      // e se o intervals.length for menor que 0 retorna uma mensagem de erro
    })
    .transform((intervals) => {
      return intervals.map((interval) => {
        // percorre todos os intervalos e pra cada intervalo retorna um novo objeto
        return {
          // e neste objeto, tera cada campo,
          // porem neste caso está reescrevento os campos em minutos
          // o unico que permanece o mesmo é o week day
          weekDay: interval.weekDay,
          startTimeInMinutes: convertTimeStringInMinutes(interval.startTime),
          // pega a função de conversão e passa para dentro do start time que é a string
          endTimeInMinutes: convertTimeStringInMinutes(interval.endTime),
        }
      })
    })
    .refine(
      (intervals) => {
        return intervals.every(
          (interval) =>
            interval.endTimeInMinutes - 60 >= interval.startTimeInMinutes,
        )
      },
      {
        message:
          'O horário de término deve ser pelo menos 1h distante do início',
      },
    ),
  /**
   * este refine serve para refinar o array de intervalos e vereficar se todos os items do array cumprem com
   * a regra de existir pelo menso uma hora entre o inicio e o termino
   * .refine(
    (intervals) => { da um refine no array de intervals do 
    então retorna se todos os items do array cumprem com a regra return intervals.every(
      (interval) =>
            interval.endTimeinMinutes - 60 >= interval.startTimeInMinutes,
        )
      }, verifica se o termino do intervalo interval.endTimeinMinutes - 60 >= pegando o horario de termino de um determinado
      dia tirando os 60 minutos precisa ser maior ou igual ao horario de inicio para saber que existe pelo menos uma hora 
      de diferença

   */
})

type TimeIntervalsFormInput = z.input<typeof timeIntervalsFormSchema>
// representa os dados de entrada  startTime: '08:00', endTime: '18:00'
type TimeIntervalsFormOutput = z.output<typeof timeIntervalsFormSchema>
// representa os dados de saida startTimeInMinutes: convertTimeStringInMinutes(interval.startTime),

export default function TimeIntervals() {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { isSubmitting, errors },
  } = useForm<TimeIntervalsFormInput>({
    resolver: zodResolver(timeIntervalsFormSchema),
    defaultValues: {
      /**
       *  para que quando o user acesse a aplicação todos os dias da semana ja estejam marcados
           e com um horario já setado.
          cada dia da semana é um objeto dentro de um array
          [ { day: 0, start: time, end: time } ]
          para que fica assim para cada dia da semana
          isso é chamado de fieldarray, é quando um formulário possui um campo que é um array
       */
      intervals: [
        { weekDay: 0, enabled: false, startTime: '08:00', endTime: '18:00' },
        { weekDay: 1, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 2, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 3, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 4, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 5, enabled: true, startTime: '08:00', endTime: '18:00' },
        { weekDay: 6, enabled: false, startTime: '08:00', endTime: '18:00' },
      ],
    },
  })

  const weekDays = getWeekDays()

  const router = useRouter()
  const { fields } = useFieldArray({
    control, // para saber que useFieldArray esta lidando com o form acima
    name: 'intervals', // nome do campo passado
    // permite que manipular um campo do formulario que é um array e esse array pode receber mais valores
  })

  const intervals = watch('intervals') // saber em tempo real as mudanças que houveram em algum campo

  async function handleSetTimeIntervals(data: any) {
    const { intervals } = data as TimeIntervalsFormOutput

    await api.post('/users/time-intervals', {
      intervals,
    })

    await router.push(`/register/update-profile`)
  }

  return (
    <>
      <NextSeo title="Selecione sua disponibilidade | Ignite Call" noindex />
      <Container>
        <Header>
          <Heading as="strong">Quase lá</Heading>
          <Text>
            Defina o intervalo de horários que você está disponível em cada dia
            da semana.
          </Text>

          <MultiStep size={4} currentStep={3} />
        </Header>

        <IntervalBox as="form" onSubmit={handleSubmit(handleSetTimeIntervals)}>
          <IntervalContainer>
            {fields.map((field, index) => {
              // percorre todos os fields passados na useFieldArray
              // ai cada campo retornara dentro de um field((field) =>
              // a key id serve para identificar cada campo corretamente
              return (
                <IntervalItem key={field.id}>
                  <IntervalDay>
                    <Controller
                      // serve para quando temos um elemento em tela que vai inserir uma informação no formulario
                      // mas ele não é um elemento nativo do html
                      name={`intervals.${index}.enabled`}
                      // nome do campo, que é um booblean que foi passado lá nas informações para deixar o check
                      // preenchido ou não
                      control={control}
                      // api que permite alterar e registar valores de campos do form
                      render={({ field }) => {
                        return (
                          <Checkbox
                            onCheckedChange={
                              (checked) =>
                                // quando o user clicar para trocar se o chebox esta selecionado ou não
                                field.onChange(checked === true)
                              // se o user colocou o check como true passa ele sendo true se não false
                              // pois noradix caso o user não interaja com o checkbox ele fica como indeterminate
                              // então foi passado ele como true
                            }
                            checked={field.value}
                          />
                        )
                      }}
                    />
                    <Text>{weekDays[field.weekDay]}</Text>
                  </IntervalDay>
                  <IntervalInputs>
                    <TextInput
                      size="sm"
                      type="time"
                      step={60}
                      {...register(`intervals.${index}.startTime`)}
                      // percorre o register, faz um interpolação passando o intervals, passando o indice do array
                      // que seria o indice dentro dos intervalos e o

                      disabled={intervals[index].enabled === false}
                      // o input sera disabilitado quando o index enabled que é indice do campo
                      // seja igual a false
                    />
                    <TextInput
                      size="sm"
                      type="time"
                      step={60}
                      {...register(`intervals.${index}.endTime`)}
                      disabled={intervals[index].enabled === false}
                    />
                  </IntervalInputs>
                </IntervalItem>
              )
            })}
          </IntervalContainer>

          {errors.intervals && (
            <FormError size="sm">{errors.intervals.message}</FormError>
          )}

          <Button type="submit" disabled={isSubmitting}>
            Próximo Passo <ArrowRight />
          </Button>
        </IntervalBox>
      </Container>
    </>
  )
}
