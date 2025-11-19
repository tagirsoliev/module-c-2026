import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Input from "../supComps/Input"

const login = () => {
    const Navigate = useNavigate()
    const [form, setForm] = useState({
        email: '',
        password: ''
    })
    const handleChange = (e) => {
        const { name, value } = e.target
        setForm({
            ...form,
            [name]: value
        })
    }
    const pushForm = (e) => {
        e.preventDefault()
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        const user = users.find(
            (user) => user.email === form.email && user.password === form.password
        )
        if (!user) {
            alert('Неверный email или пароль')
            return
        }
        localStorage.setItem('currentUser', JSON.stringify(user))
        Navigate('/boards')
        setForm({
            email: '',
            password: ''
        })
    }
    return (
        <>
            <h1>Вход</h1>
            <form action="#" onSubmit={pushForm}>
                <Input
                    name='email'
                    label='Почта'
                    value={form.email}
                    onChange={handleChange}
                    type='email'
                />
                <Input
                    name='password'
                    label='Пароль'
                    value={form.password}
                    onChange={handleChange}
                    type='password'
                />
                <button type='submit'>Войти</button>
            </form>
        </>
    )
}

export default login