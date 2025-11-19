import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Input from "../supComps/Input"

const CreateBoard = () => {
    const Navigate = useNavigate()
    const [form, setForm] = useState({
        title: '',
        users: ''
    })
    const handleChange = (e) => {
        const { name, value } = e.target
        setForm({
            ...form,
            [name]: value
        })
    }
    const PushBoard = (e) => {
        e.preventDefault()
        const boards = JSON.parse(localStorage.getItem('boards') || '[]')
        boards.push({
            title: form.title,
            users: form.users.split(',').map((email) => email.trim()).push(JSON.parse(localStorage.getItem('currentUser') || '{}').email)
        })
        localStorage.setItem('boards', JSON.stringify(boards))
        setForm({
            title: '',
            users: '',
            id: boards.length - 1,
            likes: 0
        })
        Navigate(`/boards/${boards.length - 1}`, { state: { form } })
    }
    return (
        <div>
            <h1>Создание новой доски</h1>
            <form action="#" onSubmit={PushBoard}>
                <Input
                    name='title'
                    label='Название доски'
                    value={form.title}
                    onChange={handleChange}
                    minLength={3}
                />
                <Input
                    name='users'
                    label='Почты Пользователей (через запятую)'
                    value={form.users}
                    onChange={handleChange}
                />
                <button type="submit">Создать доску</button>
            </form>
        </div>
    )
}

export default CreateBoard