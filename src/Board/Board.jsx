import { useLocation } from "react-router-dom"

const Board = () => {
    const location = useLocation()
    const form = location.state.form
    const createLink = () => {
        const boardLink = `${window.location.origin}/boards/${location.pathname.split('/').pop()}`
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