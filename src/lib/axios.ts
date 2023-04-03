import axios from 'axios'

export const api = axios.create({
  baseURL: '/api',
  // como o back e front estao sendo executados na mesma url, so precisa passar o /api que sera onde a pi esta sendo
  // executada, é o que sera retornado de dentro dos campos preenchidos
})
