import axios from 'axios'

const api = axios.create({
    baseURL: window.location.hostname === "localhost"
    ? "http://localhost:3000"
    :"https://resuify-server.onrender.com"
})

export default api