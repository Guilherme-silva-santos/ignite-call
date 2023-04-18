interface GetWeekDaysParams {
  short?: boolean
}

export function getWeekDays({ short = false }: GetWeekDaysParams = {}) {
  const formatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long' })
  // intl é a api de internacionalização do js com a data formatada em portugues, com a informação de dias da semana
  // no formato long ou seja escrito por extenso
  return (
    Array.from(Array(7).keys())
      // cria um array com 7 posições
      // Array(7).keys() criar um array e com o metodo kys retonam as set posições
      // Array.from para converter as sete posições em um estrutura de arrays
      .map((day) => formatter.format(new Date(Date.UTC(2021, 5, day))))
      // pega o formater e formata ele com o new data usando o date.utc, com o ano o mes e a data
      // de um mes que começa com segunda no dia primeiro
      .map((weekDay) => {
        if (short) {
          return weekDay.substring(0, 3).toLocaleUpperCase()
        }

        return (
          weekDay
            .substring(0, 1)
            // pega a primeira letra de cada array e deixa ela em uppercase
            .toUpperCase()
            .concat(weekDay.substring(1))
        )
      })
  )
}
