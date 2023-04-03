export function convertTimeStringInMinutes(timeString: string) {
  const [hours, minutes] = timeString.split(':').map(Number)
  // divide a time string onde tem horas e minutos, ou seja, ":" vai dividir o que é hora e o que é minutos
  // e converte e converte o que vem antes e depois do :  em um numero.
  // foi feito o map, pois o split retorna um array, e passou o number, pois é um construtor de classe js para transformar ele em um numero
  // e na desestruturação mostrou que na primeira posição do array vai retornar as horas e na segunda os minutos
  return hours * 60 + minutes
}
