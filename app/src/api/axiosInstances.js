import axios from "axios"

export const instance = axios.create({
    baseURL: `${import.meta.env.VITE_REACT_APP_API_URL}/api`,
    withCredentials: true
})

export const instanceLocalhost = axios.create({
    baseURL: "http://127.0.0.1:8080/",
})
