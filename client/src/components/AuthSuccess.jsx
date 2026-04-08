import axios from 'axios'
import React, { useEffect } from 'react'
import toast from 'react-hot-toast'
import { login, setLoading } from '../app/features/authSlice'
import { useDispatch } from 'react-redux'
import api from '../configs/api'
import { useNavigate } from 'react-router-dom'
import Loader from './Loader'

const AuthSuccess = () => {
    const dispatch = useDispatch()
    const nav = useNavigate()
    useEffect(() => {
        const handleAuth = async () => {
            const params = new URLSearchParams(window.location.search)
            const token = params.get("token")
            try {
                if (token) {
                    localStorage.setItem('token', token)

                    const { data } = await api.get('/api/users/data', {
                        headers: {
                            Authorization: token
                        }
                    })
                    if (data.user) {
                        dispatch(login({ token, user: data.user }))
                    }
                    dispatch(setLoading(false))
                    nav('/app')
                } else {
                    dispatch(setLoading(false))
                }
            } catch (error) {
                dispatch(setLoading(false))
                toast(error?.response?.data?.message || error.message)
            }

        }
        handleAuth()
    }, [])
    return (
        <div><Loader /></div>
    )
}

export default AuthSuccess