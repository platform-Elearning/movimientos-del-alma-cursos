import axios from "axios"

const instance = axios.create({
    baseURL:  "http://localhost:8080",
    withCredentials: true // envio de cookies
})

export default instance