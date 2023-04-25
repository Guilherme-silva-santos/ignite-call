import { Calendar } from '@/src/Components/Calendar'
import { api } from '../../../../../lib/axios'
import {
  Container,
  TimePicker,
  TimePickerHeader,
  TimePickerItem,
  TimePickerList,
} from './styles'
import { useState } from 'react'
import dayjs from 'dayjs'
import { useRouter } from 'next/router'
import { useQuery } from '@tanstack/react-query'

interface Availability {
  possibleTimes: number[]
  // horarios possiveis
  availableTimes: number[]
  // horarios disponiveis
}

interface CalendarstepProps {
  // função foi colocada dentro da interface para quando o user selecionar tanto a data quanto o horario
  // essa função precisa ser chamada enviando tanto a informação da data
  onSelectDateTime: (date: Date) => void
}

export function CalendarStep({ onSelectDateTime }: CalendarstepProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  // const [availability, setAvailability] = useState<Availability | null>(null)

  const router = useRouter()
  const username = String(router.query.username)

  const isDateSelected = !!selectedDate
  // se tiver algo no selected date ele já abre a janela de horarios

  const weekDay = selectedDate ? dayjs(selectedDate).format('dddd') : null
  /**
   *  se existir o sected date passa o selecteddate pra o day js e formata ele para a data certa : se não retorna
      como null
      PARA QUANDO CLICAR NO DIA DO MÊS APARECER NO STEP DE HOTARIO OS DIAS
   */
  const describedDate = selectedDate
    ? dayjs(selectedDate).format('DD[ de ]MMMM')
    : null

  const selectedDateWithoutTime = selectedDate
    ? dayjs(selectedDate).format('YYYY-MM-DD')
    : null
  const { data: availability } = useQuery<Availability>(
    ['availability', selectedDateWithoutTime],
    async () => {
      const response = await api.get(`/users/${username}/availability`, {
        // pega o username de dentro da rota
        params: {
          // como parametro a data em si
          date: selectedDateWithoutTime,
        },
      })
      return response.data
    },
    {
      enabled: !!selectedDate,
    },
  )

  function handleSelectTime(hour: number) {
    // sera chamada quando o user selecionar o horario em especifico
    // atraves do onClick do botão

    // passa para o dayjs a data que ja foi selecionada também pois queremos a data e o horaio selecionado
    // ou seja, pega a data selecionada e pega a hora selecionada
    const dateWithTime = dayjs(selectedDate)
      .set('hour', hour)
      .startOf('hour')
      .toDate()

    onSelectDateTime(dateWithTime)
  }

  /**
   * o useEffect carregara os dados da api toda vez que o selectedDate mudar
  useEffect(() => {
    if (!selectedDate) {
      return
    }

    api
      .get(`/users/${username}/availability`, {
        // pega o username de dentro da rota
        params: {
          // como parametro a data em si
          date: dayjs(selectedDate).format('YYYY-MM-DD'),
        },
      })
      .then((response) => {
        setAvailability(response.data)
      })
  }, [selectedDate, username])
   */
  return (
    <Container isTimePickerOpen={isDateSelected}>
      <Calendar selectedDate={selectedDate} onDateSelected={setSelectedDate} />

      {isDateSelected && (
        <TimePicker>
          <TimePickerHeader>
            {weekDay} <span>{describedDate}</span>
          </TimePickerHeader>

          <TimePickerList>
            {availability?.possibleTimes.map((hour) => {
              return (
                <TimePickerItem
                  key={hour}
                  onClick={() => handleSelectTime(hour)}
                  disabled={!availability.availableTimes.includes(hour)}
                >
                  {String(hour).padStart(2, '0')}:00h
                  {/* {String(hour).padStart(2, '0')}
                    para que se o horario for abaixo de 10 ele vai ter apenas um caracter então preenche com 0
                  */}
                </TimePickerItem>
              )
            })}
          </TimePickerList>
        </TimePicker>
      )}
    </Container>
  )
}
