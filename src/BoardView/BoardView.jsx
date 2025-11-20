import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"

const Board = () => {
    const { id } = useParams()
    const [form, setForm] = useState({
        title: '',
        users: []
    })
    useEffect(() => {
        const boards = JSON.parse(localStorage.getItem('boards') || '[]')
        const board = boards.find((board, index) => index.toString() === id)
        if (!board) {
            alert('Доска не найдена')
            return
        }
        setForm({
            title: board.title,
            users: board.users
        })
    }, [id])
    const createLink = () => {
        const boardLink = `${window.location.origin}/boards/${id}`
        navigator.clipboard.writeText(boardLink)
        alert(`Ссылка скопирована в буфер обмена: ${boardLink}`)
        //	генерировать публичную ссылку на просмотр доски (доступ по /board/{hash} без авторизации);
    }

    return (
        <div>
            <nav>
                <button onClick={createLink}>Создать ссылку на просмотр доски</button>
            </nav>
            <h2>{form.title}</h2>
        </div>
    )
}
export default Board