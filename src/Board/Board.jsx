import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import boardStyles from "./Board.module.css"

const Board = () => {
    

    const { id } = useParams()
    const [form, setForm] = useState({
        title: '',
        users: []
    })
    const boardRef = useRef(null)
    const palette = [{ id: 1, type: 'text', name: 'текст' }, { id: 2, type: 'image', name: 'изображение' }, { id: 3, type: 'rect', name: 'прямоугольник' }, { id: 4, type: 'circle', name: 'круг' }, { id: 5, type: 'line', name: 'линия' }]
    const [items, setItems] = useState([])
    const [selectedId, setSelectedId] = useState(null)
    const [resizing, setResizing] = useState(null)
    const [rotating, setRotating] = useState(null)
    const [currentUser, setCurrentUser] = useState(JSON.parse(localStorage.getItem('currentUser') || '{}'))
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
        // load saved items for this board (shared across tabs/users) and focus info
        const saved = JSON.parse(localStorage.getItem(`board-${id}-items`) || 'null')
        if (saved) setItems(saved)
    }, [id])
    const createLink = () => {
        const boardLink = `${window.location.origin}/boards/${id}`
        navigator.clipboard.writeText(boardLink)
        alert(`Ссылка скопирована в буфер обмена: ${boardLink}`)
        //	генерировать публичную ссылку на просмотр доски (доступ по /board/{hash} без авторизации);
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
                const newItem = makeDefaultItem(data.type, x, y)
                setItems(prev => {
                    const next = [...prev, newItem]
                    localStorage.setItem(`board-${id}-items`, JSON.stringify(next))
                    return next
                })
            } else if (data.kind === 'move') {
                setItems(prev => {
                    const next = prev.map(it => it.id === data.id ? { ...it, x: x - data.offsetX, y: y - data.offsetY } : it)
                    localStorage.setItem(`board-${id}-items`, JSON.stringify(next))
                    return next
                })
            }
        } catch (err) {
            // ignore
        }
    }

    function renderShape(it) {
        switch (it.type) {
            case 'text': return <div className={boardStyles.shapeText}>{it.text || 'Текст'}</div>
            case 'image': return <img src={it.src || ''} alt="img" className={boardStyles.shapeImage} />
            case 'rect': return <div className={boardStyles.shapeRect}></div>
            case 'circle': return <div className={boardStyles.shapeCircle}></div>
            case 'line': return <div className={boardStyles.shapeLine}></div>
            default: return <div className={boardStyles.shapeRect}></div>
        }
    }


    function selectItem(it, evt) {
        evt.stopPropagation()
        const userEmail = currentUser.email
        if (it.focusOwner && it.focusOwner !== userEmail) {
            alert(`Элемент занят: ${it.focusOwnerName || it.focusOwner}`)
            return
        }
        // set focus owner to me
        setItems(prev => {
            const next = prev.map(item => item.id === it.id ? { ...item, focusOwner: userEmail, focusOwnerName: currentUser.name || userEmail } : item)
            localStorage.setItem(`board-${id}-items`, JSON.stringify(next))
            return next
        })
        setSelectedId(it.id)
    }

    function clearSelection() {
        setSelectedId(null)
    }

    // resize handlers
    function onHandleMouseDown(e, it){
        e.stopPropagation()
        if (it.focusOwner !== currentUser.email) return
        setResizing({ id: it.id, startX: e.clientX, startY: e.clientY, origW: it.width, origH: it.height })
    }

    function onRotateMouseDown(e, it){
        e.stopPropagation()
        if (it.focusOwner !== currentUser.email) return
        const rect = boardRef.current.getBoundingClientRect()
        const cx = rect.left + it.x
        const cy = rect.top + it.y
        setRotating({ id: it.id, cx, cy })
    }

    useEffect(()=>{
        function onMove(e){
            if (resizing){
                const dx = e.clientX - resizing.startX
                const dy = e.clientY - resizing.startY
                // preserve aspect ratio
                const ratio = resizing.origW / resizing.origH
                let newW = Math.max(20, Math.round(resizing.origW + dx))
                let newH = Math.max(20, Math.round(newW / ratio))
                setItems(prev => {
                    const next = prev.map(it => it.id === resizing.id ? { ...it, width: newW, height: newH } : it)
                    localStorage.setItem(`board-${id}-items`, JSON.stringify(next))
                    return next
                })
            }
            if (rotating){
                const a = Math.atan2(e.clientY - rotating.cy, e.clientX - rotating.cx)
                const deg = Math.round(a * 180 / Math.PI)
                setItems(prev => {
                    const next = prev.map(it => it.id === rotating.id ? { ...it, rotation: deg } : it)
                    localStorage.setItem(`board-${id}-items`, JSON.stringify(next))
                    return next
                })
            }
        }
        function onUp(){
            if (resizing) setResizing(null)
            if (rotating) setRotating(null)
        }
        window.addEventListener('mousemove', onMove)
        window.addEventListener('mouseup', onUp)
        return ()=>{
            window.removeEventListener('mousemove', onMove)
            window.removeEventListener('mouseup', onUp)
        }
    }, [resizing, rotating])

    function updateSelected(changes){
        if (!selectedId) return
        setItems(prev=>{
            const next = prev.map(it=> it.id===selectedId? {...it, ...changes}:it)
            localStorage.setItem(`board-${id}-items`, JSON.stringify(next))
            return next
        })
    }

    function makeDefaultItem(type, x, y){
        const base = { id: Date.now()+Math.random(), type, x, y, rotation: 0, focusOwner: null, focusOwnerName: null }
        switch(type){
            case 'text': return { ...base, width: 140, height: 50, text: 'Текст' }
            case 'image': return { ...base, width: 140, height: 90, src: '', }
            case 'rect': return { ...base, width: 120, height: 80 }
            case 'circle': return { ...base, width: 80, height: 80 }
            case 'line': return { ...base, width: 120, height: 6 }
            default: return { ...base, width: 100, height: 60 }
        }
    }

    // handle click outside to clear selection
    useEffect(()=>{
        function onDocClick(){ setSelectedId(null) }
        document.addEventListener('click', onDocClick)
        return ()=> document.removeEventListener('click', onDocClick)
    }, [])

    // release any focus owned by this user when page unloads
    useEffect(()=>{
        function releaseOwn(){
            const userEmail = currentUser.email
            if (!userEmail) return
            setItems(prev=>{
                const next = prev.map(it=> it.focusOwner===userEmail ? {...it, focusOwner:null, focusOwnerName:null} : it)
                localStorage.setItem(`board-${id}-items`, JSON.stringify(next))
                return next
            })
        }
        window.addEventListener('beforeunload', releaseOwn)
        return ()=> window.removeEventListener('beforeunload', releaseOwn)
    }, [currentUser, id])
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
                                    >{p.name}</div>
                                ))}
                            </div>
                            <div style={{ marginTop: 16 }}>
                                <h3>Редактор</h3>
                                {selectedId ? (() => {
                                    const sel = items.find(it=>it.id===selectedId)
                                    if (!sel) return <div>Нет выбранного</div>
                                    if (sel.focusOwner !== (currentUser.email || '')) return <div>Элемент в фокусе у {sel.focusOwnerName || sel.focusOwner}</div>
                                    return (
                                        <div>
                                            {sel.type === 'text' && (
                                                <div>
                                                    <label>Текст</label>
                                                    <textarea value={sel.text || ''} onChange={(e)=>updateSelected({ text: e.target.value })} />
                                                </div>
                                            )}
                                            {sel.type === 'image' && (
                                                <div>
                                                    <label>Картинка (файл)</label>
                                                    <input type="file" accept="image/*" onChange={(e)=>{
                                                        const f = e.target.files && e.target.files[0]
                                                        if (!f) return
                                                        const url = URL.createObjectURL(f)
                                                        updateSelected({ src: url })
                                                    }} />
                                                    <label>URL</label>
                                                    <input type="text" value={sel.src || ''} onChange={(e)=>updateSelected({ src: e.target.value })} />
                                                </div>
                                            )}
                                            <div>
                                                <label>Ширина</label>
                                                <input type="number" value={sel.width} onChange={(e)=>updateSelected({ width: Number(e.target.value) })} />
                                                <label>Высота</label>
                                                <input type="number" value={sel.height} onChange={(e)=>updateSelected({ height: Number(e.target.value) })} />
                                            </div>
                                            <div>
                                                <label>Поворот</label>
                                                <input type="range" min="-180" max="180" value={sel.rotation || 0} onChange={(e)=>updateSelected({ rotation: Number(e.target.value) })} />
                                            </div>
                                            <div>
                                                <button onClick={()=>{
                                                    // release focus
                                                    setItems(prev=>{
                                                        const next = prev.map(it=> it.id===sel.id? {...it, focusOwner: null, focusOwnerName: null}:it)
                                                        localStorage.setItem(`board-${id}-items`, JSON.stringify(next))
                                                        return next
                                                    })
                                                    setSelectedId(null)
                                                }}>Отпустить фокус</button>
                                            </div>
                                        </div>
                                    )
                                })() : <div>Выберите элемент, чтобы редактировать</div>}
                            </div>
                        </div>
                    </aside>
                    <div
                        ref={boardRef}
                        className={boardStyles.board}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => onBoardDrop(e)}
                    >
                        {items.map(it => {
                            const isSelected = selectedId === it.id
                            const focusByOther = it.focusOwner && it.focusOwner !== (currentUser.email || '')
                            return (
                                <div
                                    key={it.id}
                                    className={
                                        `${boardStyles.placedItem} ${isSelected ? boardStyles.focusByMe : ''} ${focusByOther ? boardStyles.focusByOther : ''}`
                                    }
                                    style={{ left: it.x + 'px', top: it.y + 'px', width: it.width + 'px', height: it.height + 'px', transform: `translate(-50%, -50%) rotate(${it.rotation || 0}deg)` }}
                                    draggable={!focusByOther}
                                    onClick={(e) => selectItem(it, e)}
                                    onDragStart={(e) => onPlacedDragStart(e, it)}
                                >
                                    {renderShape(it)}
                                    {it.focusOwner && it.focusOwner !== (currentUser.email || '') ? <div className={boardStyles.ownerBadge}>{it.focusOwnerName || it.focusOwner}</div> : null}
                                    {/* resize handle */}
                                    <div className={boardStyles.handle} onMouseDown={(e)=>onHandleMouseDown(e,it)} />
                                    {/* rotate handle */}
                                    <div className={boardStyles.rotateHandle} onMouseDown={(e)=>onRotateMouseDown(e,it)} />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div >
        </div >
    )

}
export default Board