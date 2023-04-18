import dayjs from 'dayjs'
import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '../../../../lib/prisma'

/**
 * rota para listar os horarios disponiveis em um dia
 * O arquivo fori criado dentro de pages e api para que ele fosee uma rota de dentro da api
 * e foi colocado dentro de uma pasta [username] pois será o parametro da rota
 * para quando for buscar o dias disponiveis
 * http://localhost:3000/api/users/guilhermejn/availability?date=2023-10-10
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET') {
    return res.status(405).end()
    // se o metodo for diferente de get, dara um erro 405, pois esssa é uma rota que busca alguma informação
  }

  const username = String(req.query.username)
  /**
   * o query retorna tanto os dados enviado como parametro na rota, como é este caso que o parametro
   * esta na pasta que foi colocado o arquivo, quanto os dados enviados em querryparams como por exemplo
   * http://localhost:3333?username
   */
  const { date } = req.query

  if (!date) {
    return res.status(400).json({ message: 'Date not provided.' })
  }

  const user = await prisma.user.findUnique({
    // fazendo a busca do user no banco de dados para ver se o usuario realmente esta cadastrado
    where: {
      username,
    },
  })

  if (!user) {
    // caso o user não exista
    return res.status(400).json({ message: 'User does not exist.' })
  }

  const referenceDate = dayjs(String(date))
  /**
   * usando o dayjs na data que esta sendo recebida
   *   const { date } = req.query
   * para que ela seja tranformada em uma string
   */
  const isPastDate = referenceDate.endOf('day').isBefore(new Date())
  /**
   * fazendo uma validação para que se a data que o user informou já passou
   * para que isso seja feito pega a referenceDate.endOf('day') pasando para ela o final do dia
   * e se isso está antes da data atual .isBefore(new Date())
   * e então apareça um array vazio  return res.json({ availability: [] })
   */

  if (isPastDate) {
    return res.json({ possibleTimes: [], availableTimes: [] })
  }

  /**
   * Fazendo um cruzamento de dados entre o timeInterval (que seria o tempo do dia onde o user possui
   * disponibilidade) e os scheduligs
   * ou seja passa pelo timeIntervals validando se existem scheduligs suficientes para cobrir
   * todos intervalos que user tem senão quais os horários que não estão disponiveis
   */
  const userAvailability = await prisma.userTimeInterval.findFirst({
    /**
     * busca no banco de dados o userTimeinterval, ou seja, o intervalo de tempo que o user
     * simbolizou ter disponibilidade, onde o dia da semana bate exatamente com a data selecionada
     */
    where: {
      user_id: user.id,
      week_day: referenceDate.get('day'),
    },
  })

  if (!userAvailability) {
    return res.json({ possibleTimes: [], availableTimes: [] })
    // possibleTimes: [], availableTimes: [] precisa retornar vazio porem no mesmo formato do ultimo return
  }

  /**
   * se ele tem algum horario disponivel neste dia pega o horario de termino e o de inicio e converte ele
   * em horas dividindo por 60, pois havia sido feita a conversão das horas para minutos,
   * Isso se encontra no arquivo (convert-time-string-to-minuts.ts)
   */
  const { time_start_in_minutes, time_end_in_minutes } = userAvailability

  const startHour = time_start_in_minutes / 60
  const endHour = time_end_in_minutes / 60

  /**
   * Criando um array com todas as horas disponiveis no dia em questão, ou seja, caso o startHour seja as
   * 10hrs e o endHour seja as 18, pecisamos retornar as horas neste intervalo de tempo dentro de um
   * array.
   */
  const possibleTimes = Array.from({ length: endHour - startHour }).map(
    /**
     * O array criado com  o tamanho do endHour - startHour.
     * só relembrando que o "_" passado no map é porque o valor passado é sempre undefined
     * Faz um map retornando o startHour + i pois o i é 1 e o startHour começa em 10, então vai aumentando
     * de 1 em 1
     */
    (_, i) => {
      return startHour + i
    },
  )
  /**
   *  para cada um dos dias disponiveis precisa ser feita a validação pra ver se existem horarios
   *  disponiveis naquele dia, e se já exite algum agendamento já marcado naquela hora selecionada.
   *
   *  Buscando a disponibilidade dos horarios do dia selecionado
   */

  /**
   * começa buscando todos os agendamentos scheduling
   *
   * gte = greater than or equal
   * então busca todos os valores onde a data seja maior ou igual a referencedate
   * ou seja esta buscando todos os agendamento feitos pelo o user com determinado id no intervalo
   * de tempo entr o startHour e o endHour
   */
  const blockedTimes = await prisma.scheduling.findMany({
    select: {
      date: true,
    },
    where: {
      user_id: user.id,
      date: {
        gte: referenceDate.set('hour', startHour).toDate(),
        lte: referenceDate.set('hour', endHour).toDate(),
      },
    },
  })

  /**
   * Fazendo um cross entre os valores, então pegando todos os horarios disponiveis e validar que não
   * existem agendamentos naquele horario
   *
   * pega o possibletimes e filtra ele com os times
   * e retorna validando se não houver blockedtime.some ou seja pelo meno um time
   * onde o blockedTime seja igual a hora que tem dentro de possibletimes
   *
   * ou seja, caso o user tenha disponibilidade entre as horas array do possibletimes[10,11,12]
   * o availableTimes passa por cada horario (por isso usa-se o filter), validando que não existe nenhum
   * blockedTimes ou seja nenhum registro na tabela de scheduling onde bate o time com a hora do
   * agendamento blockedTime.date.getHours()
   */
  const availableTimes = possibleTimes.filter((time) => {
    return !blockedTimes.some(
      (blockedTime) => blockedTime.date.getHours() === time,
    )
  })

  // sempre que for retornar alguma coisa no next precisa colocar a res.json
  return res.json({ possibleTimes, availableTimes })
}
