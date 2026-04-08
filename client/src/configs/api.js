import axios from 'axios'

const api = axios.create({
    baseURL: "https://resuify-server.onrender.com"
})

export default api