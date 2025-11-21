import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import boardStyles from "./Board.module.css"

const Board = () => {
    const [value, setValue] = useState('')

    const { id } = useParams()
    const [form, setForm] = useState({
        title: '',
        users: []
    })
    const boardRef = useRef(null)
    const palette = [{
        id: Math.random,
        type: 'text',
        name: 'текст'
    },
    {
        id: Math.random,
        type: 'image',
        name: 'изображение'
    },
    {
        id: Math.random,
        type: 'rect',
        name: 'прямоугольник'
    },
    {
        id: Math.random,
        type: 'circle',
        name: 'круг'
    },
    {
        id: Math.random,
        type: 'line',
        name: 'линия'
    }
    ]
    const [items, setItems] = useState([])
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

    function createPaletteItem(type) {
        const id = Date.now() + Math.random()
        setPalette(prev => [...prev, { id, type }])
    }

    function onPaletteDragStart(e, p) {
        e.dataTransfer.setData('application/json', JSON.stringify({ kind: 'new', type: p.type }))
    }

    function onPlacedDragStart(e, it) {
        const rect = boardRef.current.getBoundingClientRect()
        const offsetX = e.clientX - rect.left - it.x
        const offsetY = e.clientY - rect.top - it.y
        e.dataTransfer.setData('application/json', JSON.stringify({ kind: 'move', id: it.id, offsetX, offsetY }))
    }

    function onBoardDrop(e) {
        e.preventDefault()
        const rect = boardRef.current.getBoundingClientRect()
        const x = Math.round(e.clientX - rect.left)
        const y = Math.round(e.clientY - rect.top)
        try {
            const data = JSON.parse(e.dataTransfer.getData('application/json'))
            if (data.kind === 'new') {
                const newItem = { id: Date.now() + Math.random(), type: data.type, x: x, y: y }
                setItems(prev => [...prev, newItem])
            } else if (data.kind === 'move') {
                setItems(prev => prev.map(it => it.id === data.id ? { ...it, x: x - data.offsetX, y: y - data.offsetY } : it))
            }
        } catch (err) {
            // ignore
        }
    }

    function renderShape(it) {
        const size = 80
        switch (it.type) {
            case 'text': return <div className={boardStyles.shapeText}>Текст</div>
            case 'image': return <div className={boardStyles.shapeImage}>IMG</div>
            case 'rect': return <div className={boardStyles.shapeRect}></div>
            case 'circle': return <div className={boardStyles.shapeCircle}></div>
            case 'line': return <div className={boardStyles.shapeLine}></div>
            default: return <div className={boardStyles.shapeRect}></div>
        }
    }


    const onChange = () => {
        
    }
    return (
        <div>
            <nav>
                <h2>{form.title}</h2>
                <button onClick={createLink}>Создать ссылку на просмотр доски</button>
            </nav>
            <div >
                <div className={boardStyles.container}>
                    <aside>
                        <div>
                            <h2>Фигуры</h2>
                            <div className={boardStyles.palette}>
                                {palette.map(p => (
                                    <div key={p.id}
                                        className={boardStyles.draggable}
                                        draggable
                                        onDragStart={(e) => onPaletteDragStart(e, p)}
                                    >{p.type == 'text' ? <input type="text" placeholder={p.name} value={value} onChange={onChange} /> : p.name}</div>
                                ))}
                            </div>
                        </div>
                    </aside>
                    <div
                        ref={boardRef}
                        className={boardStyles.board}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => onBoardDrop(e)}
                    >
                        {items.map(it => (
                            <div
                                key={it.id}
                                className={boardStyles.placedItem}
                                style={{ left: it.x + 'px', top: it.y + 'px' }}
                                draggable
                                onDragStart={(e) => onPlacedDragStart(e, it)}
                            >
                                {renderShape(it)}
                            </div>
                        ))}
                    </div>
                </div>
            </div >
        </div >
    )

}
export default Board