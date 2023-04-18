import { CaretLeft, CaretRight } from 'phosphor-react'
import { getWeekDays } from '../../utils/get-week-days'
import {
  CalendarActions,
  CalendarBody,
  CalendarContainer,
  CalendarDay,
  CalendarHeader,
  CalendarTitle,
} from './styles'
import dayjs from 'dayjs'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../../lib/axios'
import { useRouter } from 'next/router'
interface CalendarWeek {
  week: number
  days: Array<{
    date: dayjs.Dayjs
    disabled: boolean
  }>
}

type CalendarWeeks = CalendarWeek[]

interface BlockedDates {
  blockedWeekDays: number[]
}
interface CalendarProps {
  selectedDate?: Date | null
  onDateSelected: (date: Date) => void
  /**
 * cria uma porta de entrada e saida para o componente para que outros componentes possam passar para ele
  a data selecionada
 */
}

export function Calendar({ onDateSelected, selectedDate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(() => {
    // usando usestate para que a data seja armazenada no estado
    // cria o dayjs que é um objeto de date porem setando o dia de um pois so queremos a informação de mes e de ano
    return dayjs().set('date', 1)
  })

  const router = useRouter()

  function handlePreviusMonth() {
    const previusMonthDate = currentDate.subtract(1, 'month')
    // pega o currentdate e subitrai um mes usando o subtract
    // ou seja pega a data atual e subtrai 1 mes

    setCurrentDate(previusMonthDate)
    // e passa a função para o onclick, e assim que o botão for acionado
    // ele adiciona ou subtrai um mes
  }

  function handleNextMonth() {
    const previusMonthDate = currentDate.add(1, 'month')
    // pega o currentdate e add um mes usando o subtract
    // ou seja pega a data atual e add 1 mes
    setCurrentDate(previusMonthDate)
  }

  const shortWeekDays = getWeekDays({ short: true })

  const currentMonth = currentDate.format('MMMM')
  // formata a informação do currentdate para a versão do mes por extenso
  const currentYear = currentDate.format('YYYY')

  const username = String(router.query.username)
  const { data: blockedDates } = useQuery<BlockedDates>(
    ['blocked-dates', currentDate.get('year'), currentDate.get('month')],
    async () => {
      const response = await api.get(`/users/${username}/blocked-dates`, {
        // pega o username de dentro da rota
        params: {
          year: currentDate.get('year'),
          month: currentDate.get('month'),
        },
      })
      return response.data
    },
  )

  // forma um array e cada posição do array é uma semana com os dias da semana
  // [ [ 1,2,3 ] [ 4,5,6,7,8,9,10 ] ]
  const calendarWeeks = useMemo(() => {
    if (!blockedDates) {
      return []
      // caso o blockedDates ainda não tenha sido carregado ele retorna como null
    }
    /**
   * use memo para armazenar na memoria e não atualizar o component pai por
     qualquer coisa
   */

    const daysInMonthArray = Array.from({
      /**
       * com o length pega a data atual usando o currentdate
        e como o current date esta usando o dayjs, ele possui uma propriedade chamada daysInMonth
        que nada mais são os dias do mes
       */
      length: currentDate.daysInMonth(),
    }).map((_, i) => {
      /**
       * o i=indice é o Elemento a ser pesquisado no array.
         faz um map para percorrer o daysInMonthArray
         passa '_' pois os valores do array não são importante no momento, pois usando o Array.from
         os valores ficam como indefinidos, então o que importa é o i ou seja o indice que vai de 0 até o tamanho
         do mes.
         então retorna a data atual currentDate porem substituindo o dia = date, (o date no js significa dia )
          por i + 1, i + 1 pois o array começa em 0 então não existe dia 0
       */
      return currentDate.set('date', i + 1)
    })

    /**
     * para pegar o dia da semana do primeiro dia do mes
     *
     * como no currentDate ja setou que o primeiro dia da semana seria 1 currentDate.set('date', i + 1)
     * basta pegar o currentdate e pegar o dia da semana usando o day
     * "NO JS DAY = DIA DA SEMANA E DATE = DIA EM NÚMERO"
     */
    const firstWeekDay = currentDate.get('day')

    /**
     * Cria um array com os dias do mes anterior
     * Ou seja caso o mes começe na quinta-feira, esse array vai preencher os dias do mes passado nos dias da
     * da semana anterios ao inicio do mes.
     *
     * Array.from Serve pra criar uma array
     *
     * passa o length: firstWeekDay, pois o firstWeekDay sempre retornara quantos dias faltaram para completar
     * o mes no calendario, a linha da semana basicamente, ou seja, se o mes começa na quinta, quinta é a quarta posição no array, então
     * tem qautro dias anteriores que serão preenchidos com os quatro ultimos dias do mes anterior
     *
     * retorna currentDate.subtract(i + 1, 'day')
     * pega a data que ja esta no dia 1 e vai voltando um dia
     */
    const previusMonthFillArray = Array.from({
      length: firstWeekDay,
    })
      .map((_, i) => {
        return currentDate.subtract(i + 1, 'day')
      })
      .reverse()

    const lastDayInCurrentMonth = currentDate.set(
      'date',
      currentDate.daysInMonth(),
    )
    /**
     * Para saber quantos dias vamos precisar do próximo mês, se o mes terminasse na quarta quantos dias
     * do mes subsequente precisaria para completar a semana.
     *
     * Precia pegar o ultimo dia da semana do ultimo dia dos mes
     *
     * daysInMonth retorna quantos dias tem no mes, e se setarmos o dia da data .set('date' no total de
     * dias do mes currentDate.daysInMonth()) acaba pegando o ultimo dia do mes
     */
    const lastWeekDay = lastDayInCurrentMonth.get('day')

    /**
     * length: 7 - (lastWeekDay + 1),
     * para representar que temos sete dias na semana e que le não começa com 0 e então soma um no lastweekday
     * para representar que a semana começa no 1
     */
    const nextMonthFillArray = Array.from({
      length: 7 - (lastWeekDay + 1),
    }).map((_, i) => {
      return lastDayInCurrentMonth.add(i + 1, 'day')
    })

    const calendarDays = [
      ...previusMonthFillArray.map((date) => {
        return { date, disabled: true }
        // para que a data do mes anterior seja disabilitada
        // para que não possa efetuar o click
      }),
      ...daysInMonthArray.map((date) => {
        return {
          date,
          // estrão disabilitados caso eles já passaram ou
          // blockedDates?.blockedWeekDays.includes(date.get('day')),
          // ou inclui o dia da semana que não esta dentro do blockedDates
          disabled:
            date.endOf('day').isBefore(new Date()) ||
            blockedDates.blockedWeekDays.includes(date.get('day')),
        }
        /**
         * O botão estara disabilitado quando se a date.endof('day'), que retorna 23:59:59, do dia especifico
         * já passou ou seja é anterior ao new date ele precisa estar desabilitado
         */
      }),
      ...nextMonthFillArray.map((date) => {
        return { date, disabled: true }
      }),
    ]

    const calendarWeeks = calendarDays.reduce<CalendarWeeks>(
      (weeks, _, i, original) => {
        /**
         * o reduce precisa prodizir um array com do formato do calendarWeeks
         * weeks = o array final
         * "_" = cada deta passado na const calendarDays
         *
         */
        /**
         * a variavel sera true quando começar a criar uma nova semana
         * e verifica se o modulo de i por sete é igual a 0
         */
        const isNewWeek = i % 7 === 0

        if (isNewWeek) {
          weeks.push({
            week: i / 7 + 1,
            // para que o i não comece me 0 e sim em 1
            days: original.slice(i, i + 7),
            // pega uma fatia do array original usando slice comecando do i ate o 7
          })
        }

        return weeks
      },
      [],
    )

    return calendarWeeks
    /**
     * Passa o currentdate como dependencia, pois toda vez que ela mudar, ou seja, toda vez que o user mudar o mes
     * precisa recalcular os dias do mes.
     */
  }, [currentDate, blockedDates])

  console.log(calendarWeeks)

  return (
    <CalendarContainer>
      <CalendarHeader>
        <CalendarTitle>
          {currentMonth} <span>{currentYear}</span>
        </CalendarTitle>

        <CalendarActions>
          <button onClick={handlePreviusMonth} title="Previous month">
            <CaretLeft />
          </button>
          <button onClick={handleNextMonth} title="Next month">
            <CaretRight />
          </button>
        </CalendarActions>
      </CalendarHeader>

      <CalendarBody>
        <thead>
          <tr>
            {shortWeekDays.map((weekDay) => (
              <th key={weekDay}>{weekDay}.</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {calendarWeeks.map(({ week, days }) => {
            return (
              <tr key={week}>
                {days.map(({ date, disabled }) => {
                  return (
                    <td key={date.toString()}>
                      <CalendarDay
                        onClick={() => onDateSelected(date.toDate())}
                        disabled={disabled}
                      >
                        {date.get('date')}
                      </CalendarDay>
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </CalendarBody>
    </CalendarContainer>
  )
}
