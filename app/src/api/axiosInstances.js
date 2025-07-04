import axios from "axios"

export const instance = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/api`,
    withCredentials: true
})

export const instanceUsers = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/users`,
})

export const instanceCursos = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/courses`,
})

export const instanceEnrollmentss = axios.create({
    baseURL: `${import.meta.env.VITE_API_URL}/enrollments`,
})

export const instanceReports = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL}/report-problem`,
  headers: {
    "Content-Type": "application/json",
  }
});

export default instance