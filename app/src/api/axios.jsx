import axios from "axios"

const instance = axios.create({
    baseURL: `${import.meta.env.VITE_REACT_APP_API_URL}/api`,
    withCredentials: true // envio de cookies
})

export default instance