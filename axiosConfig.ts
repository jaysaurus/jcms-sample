import axios, { type AxiosInstance, type AxiosResponse } from 'axios'

export const api = axios.create({
  baseURL: 'http://localhost/api'
})
