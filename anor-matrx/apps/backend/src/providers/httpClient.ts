import axios, { AxiosInstance } from 'axios';
import config from '../config';

const http: AxiosInstance = axios.create({
  baseURL: config.API_BASE_URL ?? '',
  timeout: 10000,
});

export default http;
