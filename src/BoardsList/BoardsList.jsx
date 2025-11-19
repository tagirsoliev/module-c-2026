import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

const BoardsList = () => {
    const Navigate = useNavigate()
    const [boards, setBoards] = useState([])
    useEffect(() => {
        setBoards(JSON.parse(localStorage.getItem('boards') || '[]'))
        onlyMyBoards()
        //
        //
        handleSortChange({ target: { value: sortOrder === 'asc' ? 'by likes asc' : 'by likes desc' } }) //!
        //
        //
    }, [])
    const [checkbox, setCheckbox] = useState(false)
    const likeBoard = () => {
        alert('Лайк поставлен!')
    }
    const [sortOrder, setSortOrder] = useState('asc')
    const myUser = JSON.parse(localStorage.getItem('currentUser') || '{}')


    const handleSortChange = (e) => {
        const order = e.target.value === 'by likes asc' ? 'asc' : 'desc'
        setSortOrder(order)
        if (order === 'asc') {
            const sortedBoards = [...boards].sort((a, b) => a.likes - b.likes)
            setBoards(sortedBoards)
        } else {
            const sortedBoards = [...boards].sort((a, b) => b.likes - a.likes)
            setBoards(sortedBoards)
        }
    }


    const onlyMyBoards = () => {
        setCheckbox(!checkbox)
        if (!checkbox) {
            const filteredBoards = boards.filter((board) =>
                board.users.find((email) => email === myUser.email)
            )
            setBoards(filteredBoards)
        } else {
            setBoards(JSON.parse(localStorage.getItem('boards') || '[]'))
        }
    }


    const toCreateBoard = () => {
        Navigate('/create-board')
    }
    return (
        <div>
            <h1>Список досок</h1>
            <select name="filter" id="filter" onChange={handleSortChange}>
                <option value="by likes asc">
                    По лайкам ▲
                </option>
                <option value="by likes desc">
                    По лайкам ▼
                </option>
            </select>
            <label htmlFor="showOnlyMyBoards">
                Показать только доски к которым я имею доступ
                <input type="checkbox" name="showOnlyMyBoards" id="showOnlyMyBoards" value={checkbox} onChange={onlyMyBoards} />
            </label>
            {boards.length === 0 ? (
                <p>Досок нет</p>
            ) : (
                boards.map((board, index) => (
                    <div key={index}>
                        <h2>{board.name}</h2>
                        <button>Смотреть</button>
                        <button>{board.users.find((email) => email === myUser.email) ? "Редактировать" : "Отправить запрос на редактирование"}</button>
                        {/* Можно хранить как связь доска.пользователи или как пользователь.доски */}
                        <button onClick={likeBoard}>Поставить лайк</button>
                    </div>
                ))
            )}
            <div>
                <button onClick={toCreateBoard}>Создать доску</button>
            </div>
        </div>
    )
}

export default BoardsList