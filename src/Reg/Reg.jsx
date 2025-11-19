import { useState } from "react"
import Input from "../supComps/Input"
import { useNavigate } from "react-router-dom"

const Reg = () => {
    const Navigate = useNavigate()
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: ''
    })
    const handleChange = (e) => {
        const { name, value } = e.target
        if (name === 'name') {
            const englishOnly = e.target.value.replace(/[^A-Za-z\s]/g, "");
            setForm({
                ...form,
                [name]: englishOnly
            })
            return
        }
        setForm({
            ...form,
            [name]: value
        })
    }
    const validate = (form) => {
        const nameRegex = /^[A-Za-z\s]+$/ //!
        //
        //
        const passwordRegex = /^(?=.*\d)(?=.*[!@#$%^&*]).+$/ //!
        //
        //
        if (!nameRegex.test(form.name)) {
            alert('Имя должно содержать только английские буквы')
            return false
        }
        if (form.password.length < 8 || !passwordRegex.test(form.password)) {
            alert('Пароль должен быть не менее 8 символов и содержать как минимум одну цифру и один специальный символ')
            return false
        }
        return true
    }
    const pushForm = (e) => {
        e.preventDefault()
        if (!validate(form)) {
            return
        }
        const users = JSON.parse(localStorage.getItem('users') || '[]')
        users.push(form)
        localStorage.setItem('users', JSON.stringify(users))
        Navigate('/login')
        setForm({
            name: '',
            email: '',
            password: ''
        })
    }

    return (
        <>
            <h1>Регистрация</h1>
            <form action="#" onSubmit={pushForm}>
                <Input
                    name='name'
                    label='Имя'
                    value={form.name}
                    onChange={handleChange}
                />
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
                    minLength={8}
                />
                <button type='submit'>Зарегистрироваться</button>
            </form>
        </>
    )
}

export default Reg