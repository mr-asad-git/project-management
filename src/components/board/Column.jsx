import React, { useState, useRef } from 'react'
import TaskCard from './TaskCard'

const ACCENT = {
    'On Hold': '#D87272',
    'To Do': '#5030E5',
    'In Progress': '#FFA500',
    'Completed': '#7AC555',
}

// 5 MB — standard for task management tools (Trello, Jira, Asana use 10MB but 5MB is safe for previews)
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg']

const Column = ({ title, status, tasks, isOver, onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop, onTaskAdd, onTaskUpdate, allTasks = [] }) => {
    const accent = ACCENT[title] ?? '#D87272'

    const priorityOptions = status === 'completed' ? ['Completed'] : ['Low', 'High', 'Completed']

    const [showAddForm, setShowAddForm] = useState(false)
    const [newTitle, setNewTitle] = useState('')
    const [newText, setNewText] = useState('')
    const [newPriority, setNewPriority] = useState(status === 'completed' ? 'Completed' : 'Low')
    const [imageFile, setImageFile] = useState(null)         // File object
    const [imagePreview, setImagePreview] = useState(null)   // base64 data-URL
    const [imageError, setImageError] = useState('')
    const [titleError, setTitleError] = useState('')
    const inputRef = useRef(null)
    const fileRef = useRef(null)

    // Editing states
    const [editingTask, setEditingTask] = useState(null)
    const [editName, setEditName] = useState('')
    const [editText, setEditText] = useState('')
    const [editPriority, setEditPriority] = useState('Low')
    const [editImagePreview, setEditImagePreview] = useState(null)
    const [editImageError, setEditImageError] = useState('')
    const [editError, setEditError] = useState('')
    const editFileRef = useRef(null)

    // --- Validation logic for title duplicates ---
    React.useEffect(() => {
        const trimmed = newTitle.trim().toLowerCase()
        if (!trimmed) {
            setTitleError('')
            return
        }
        const isDuplicate = allTasks.some(t => t.title.trim().toLowerCase() === trimmed)
        setTitleError(isDuplicate ? 'A task with this title already exists in this project.' : '')
    }, [newTitle, allTasks])

    React.useEffect(() => {
        if (!editingTask) return
        const trimmed = editName.trim().toLowerCase()
        if (!trimmed) {
            setEditError('')
            return
        }
        const isDuplicate = allTasks.some(t =>
            t.title.trim().toLowerCase() === trimmed && t.id !== editingTask.id
        )
        setEditError(isDuplicate ? 'A task with this title already exists in this project.' : '')
    }, [editName, allTasks, editingTask])

    const openForm = () => {
        setShowAddForm(true)
        setNewTitle('')
        setNewText('')
        setNewPriority(status === 'completed' ? 'Completed' : 'Low')
        setImageFile(null)
        setImagePreview(null)
        setImageError('')
        setTitleError('')
        setTimeout(() => inputRef.current?.focus(), 50)
    }

    const handleImageChange = (e) => {
        const file = e.target.files[0]
        setImageError('')
        if (!file) return

        // Type check
        if (!ALLOWED_TYPES.includes(file.type)) {
            setImageError('Only PNG, JPEG or JPG files are allowed.')
            e.target.value = ''
            return
        }
        // Size check
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            setImageError(`Image must be under 5 MB. (Yours: ${(file.size / 1024 / 1024).toFixed(1)} MB)`)
            e.target.value = ''
            return
        }

        setImageFile(file)
        const reader = new FileReader()
        reader.onload = (ev) => setImagePreview(ev.target.result)
        reader.readAsDataURL(file)
    }

    const removeImage = () => {
        setImageFile(null)
        setImagePreview(null)
        setImageError('')
        if (fileRef.current) fileRef.current.value = ''
    }

    const handleAdd = (e) => {
        e.preventDefault()
        const trimmed = newTitle.trim()
        if (!trimmed || titleError) return
        onTaskAdd({ title: trimmed, text: newText.trim(), priority: newPriority, image: imagePreview ?? null })
        setShowAddForm(false)
        setNewTitle('')
        setNewText('')
        setImageFile(null)
        setImagePreview(null)
    }

    const handleCancel = () => {
        setShowAddForm(false)
        setNewTitle('')
        setNewText('')
        setImageFile(null)
        setImagePreview(null)
        setImageError('')
        setTitleError('')
    }

    // Task editing logic (Modal)
    const handleEditOpen = (task) => {
        setEditingTask(task)
        setEditName(task.title || '')
        setEditText(task.text || '')
        setEditPriority(task.priority || 'Low')
        setEditImagePreview(task.image || null)
        setEditImageError('')
        setEditError('')
    }

    const onEditImageChange = (e) => {
        const file = e.target.files[0]
        setEditImageError('')
        if (!file) return
        if (!ALLOWED_TYPES.includes(file.type)) {
            setEditImageError('Only PNG, JPEG or JPG files are allowed.')
            return
        }
        if (file.size > MAX_IMAGE_SIZE_BYTES) {
            setEditImageError(`Image must be under 5 MB.`)
            return
        }
        const reader = new FileReader()
        reader.onload = (ev) => setEditImagePreview(ev.target.result)
        reader.readAsDataURL(file)
    }

    const handleEditSave = (e) => {
        e.preventDefault()
        if (!editName.trim() || editError) return
        onTaskUpdate(editingTask.id, {
            title: editName.trim(),
            text: editText.trim(),
            priority: editPriority,
            image: editImagePreview
        })
        setEditingTask(null)
    }

    return (
        <div
            className={`rounded-xl p-4 transition-all duration-200 ${isOver ? 'ring-2 ring-offset-2 scale-[1.01]' : 'ring-0'}`}
            style={{ background: isOver ? `${accent}20` : 'var(--bg-surface-2)' }}
            onDragOver={e => { e.preventDefault(); onDragOver(); }}
            onDragLeave={onDragLeave}
            onDrop={e => { e.preventDefault(); onDrop(); }}
        >
            {/* ── Column Header with inline Add button ── */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="h-[8px] w-[8px] rounded-full flex-shrink-0" style={{ background: accent }} />
                    <h2 className="font-semibold text-[15px] text-[#0D062D]">{title}</h2>

                    <div className="h-[22px] min-w-[22px] px-1.5 bg-[var(--text-primary)]/40 rounded-full flex justify-center items-center text-[#0D062D] text-[11px] font-bold">
                        {tasks.length}
                    </div>
                </div>

                {/* Add Task button */}
                <button
                    onClick={openForm}
                    title="Add task"
                    className="group h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95"
                    style={{ background: `${accent}18` }}
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="2.5" strokeLinecap="round">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                </button>
            </div>

            {/* Colour bar */}
            <div className="w-full h-1 rounded-sm mb-4" style={{ background: accent }} />

            {/* ── Inline Add Task Form ── appears above cards */}
            {
                showAddForm && (
                    <form
                        onSubmit={handleAdd}
                        className="bg-white rounded-xl p-3.5 shadow-sm flex flex-col gap-2.5 border-2 border-dashed mb-3"
                        style={{ borderColor: accent }}
                        onDragOver={e => e.stopPropagation()}
                    >
                        <div className="flex flex-col gap-1">
                            <input
                                ref={inputRef}
                                value={newTitle}
                                onChange={e => setNewTitle(e.target.value)}
                                placeholder="Task title…"
                                className={`w-full text-[14px] font-medium outline-none px-2 py-1.5 rounded-lg border transition-all ${titleError ? 'border-red-500 bg-red-50' : 'border-[#DBDBDB] focus:border-[#5030E5] focus:ring-2 focus:ring-[#5030E5]/10'}`}
                                onKeyDown={e => e.key === 'Escape' && handleCancel()}
                            />
                            {titleError && (
                                <span className="text-red-500 text-[10px] font-medium px-1 animate-in fade-in duration-200">
                                    {titleError}
                                </span>
                            )}
                        </div>

                        {/* Priority pills */}
                        <div className="flex gap-1.5 flex-wrap">
                            {priorityOptions.map(p => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => setNewPriority(p)}
                                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${newPriority === p ? 'border-transparent text-white' : 'border-[#DBDBDB] text-[#787486] hover:border-gray-300'}`}
                                    style={newPriority === p ? {
                                        background: p === 'High' ? '#D8727D' : p === 'Completed' ? '#7AC555' : '#D58D49'
                                    } : {}}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>

                        {/* Message / Description input */}
                        <textarea
                            value={newText}
                            onChange={e => setNewText(e.target.value)}
                            placeholder="Add a message / description…"
                            rows={3}
                            className="w-full text-[13px] text-[#0D062D] outline-none px-2 py-2 rounded-lg border border-[#DBDBDB] focus:border-[#5030E5] focus:ring-2 focus:ring-[#5030E5]/10 transition-all resize-none placeholder:text-[#787486]/60"
                        />

                        {/* ── Image Upload ── */}
                        <div className="flex flex-col gap-1">
                            {!imagePreview ? (
                                <label
                                    className="flex items-center gap-2 cursor-pointer group"
                                    htmlFor={`img-upload-${status}`}
                                >
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg border-2 border-dashed border-[#DBDBDB] hover:border-[#5030E5]/40 transition-colors w-full">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#787486" strokeWidth="2" strokeLinecap="round">
                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                            <circle cx="8.5" cy="8.5" r="1.5" />
                                            <polyline points="21 15 16 10 5 21" />
                                        </svg>
                                        <span className="text-[12px] text-[#787486] font-medium group-hover:text-[#5030E5] transition-colors">
                                            Add image <span className="text-[10px] opacity-60">(PNG, JPEG, JPG · max 5 MB)</span>
                                        </span>
                                    </div>
                                    <input
                                        id={`img-upload-${status}`}
                                        ref={fileRef}
                                        type="file"
                                        accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                                        className="hidden"
                                        onChange={handleImageChange}
                                    />
                                </label>
                            ) : (
                                <div className="relative rounded-lg overflow-hidden border border-[#DBDBDB]">
                                    <img src={imagePreview} alt="Preview" className="w-full h-28 object-cover" />
                                    <button
                                        type="button"
                                        onClick={removeImage}
                                        className="absolute top-1.5 right-1.5 h-6 w-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                                    >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                        </svg>
                                    </button>
                                    <div className="absolute bottom-1.5 left-2 text-[10px] text-white/80 font-medium bg-black/40 rounded px-1.5 py-0.5 truncate max-w-[80%]">
                                        {imageFile?.name}
                                    </div>
                                </div>
                            )}

                            {/* Error message */}
                            {imageError && (
                                <p className="text-[11px] text-[#D8727D] font-medium flex items-center gap-1">
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    {imageError}
                                </p>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                type="submit"
                                disabled={!newTitle.trim() || !!titleError}
                                className="flex-1 py-1.5 rounded-lg text-[12px] font-bold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                                style={{ background: accent }}
                            >
                                Add task
                            </button>
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-3 py-1.5 rounded-lg text-[12px] font-bold text-[#787486] border border-[#DBDBDB] hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                )
            }

            {/* Drop hint for empty column */}
            {
                isOver && tasks.length === 0 && (
                    <div
                        className="w-full h-20 rounded-lg border-2 border-dashed flex items-center justify-center text-sm font-medium opacity-60 mb-2"
                        style={{ borderColor: accent, color: accent }}
                    >
                        Drop here
                    </div>
                )
            }

            {/* Empty state */}
            {tasks.length === 0 && !showAddForm && !isOver && (
                <div className="flex flex-col items-center justify-center py-8 gap-2 text-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.3">
                        <rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 12l2 2 4-4" />
                    </svg>
                    <p className="text-[12px] font-medium text-slate-300">No task created yet</p>
                </div>
            )}

            {/* Cards */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-180px)] scrollbar-hide min-h-0">
                {tasks.map(task => (
                    <div key={task.id} className="flex-shrink-0">
                        <TaskCard
                            task={task}
                            onDragStart={() => onDragStart(task.id, task.status)}
                            onDragEnd={onDragEnd}
                            onEdit={() => handleEditOpen(task)}
                        />
                    </div>
                ))}
            </div>

            {/* ── Edit Task Modal ── */}
            {
                editingTask && (
                    <div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setEditingTask(null)}>
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-[440px] p-6 flex flex-col gap-6" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center">
                                <h2 className="text-[18px] font-bold text-[#0D062D]">Edit Task</h2>
                                <button onClick={() => setEditingTask(null)} className="text-[#787486] hover:text-[#0D062D] text-[24px] leading-none transition-colors">×</button>
                            </div>

                            <form onSubmit={handleEditSave} className="flex flex-col gap-5">
                                {/* Title */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#787486] uppercase tracking-wide">Task Title</label>
                                    <input
                                        autoFocus
                                        type="text"
                                        value={editName}
                                        onChange={e => setEditName(e.target.value)}
                                        className={`border rounded-xl px-4 py-2.5 text-[14px] outline-none transition-all font-medium ${editError ? 'border-red-500 focus:ring-red-100' : 'border-[#DBDBDB] focus:border-[#5030E5] focus:ring-2 focus:ring-[#5030E5]/20'}`}
                                    />
                                    {editError && <span className="text-red-500 text-[12px] font-medium mt-1 animate-in fade-in duration-200">{editError}</span>}
                                </div>

                                {/* Priority */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-bold text-[#787486] uppercase tracking-wide">Priority</label>
                                    <div className="flex gap-2">
                                        {priorityOptions.map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setEditPriority(p)}
                                                className={`px-4 py-1.5 rounded-full text-[12px] font-semibold border-2 transition-all ${editPriority === p ? 'text-white' : 'border-[#DBDBDB] text-[#787486] hover:border-gray-300'}`}
                                                style={editPriority === p ? {
                                                    background: p === 'High' ? '#D8727D' : p === 'Completed' ? '#7AC555' : '#D58D49',
                                                    borderColor: 'transparent'
                                                } : {}}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Message / Description */}
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[12px] font-bold text-[#787486] uppercase tracking-wide">Message / Description</label>
                                    <textarea
                                        value={editText}
                                        onChange={e => setEditText(e.target.value)}
                                        rows={4}
                                        placeholder="Add more details about this task..."
                                        className="border border-[#DBDBDB] rounded-xl px-4 py-3 text-[14px] outline-none focus:border-[#5030E5] focus:ring-2 focus:ring-[#5030E5]/20 transition-all resize-none min-h-[100px]"
                                    />
                                </div>

                                {/* Image input in Edit Modal */}
                                <div className="flex flex-col gap-2">
                                    <label className="text-[12px] font-bold text-[#787486] uppercase tracking-wide">Image Attachment</label>
                                    {!editImagePreview ? (
                                        <label className="cursor-pointer group">
                                            <div className="flex items-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[#DBDBDB] group-hover:border-[#5030E5]/40 transition-colors">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#787486" strokeWidth="2" strokeLinecap="round">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                                                </svg>
                                                <span className="text-[13px] text-[#787486] font-medium group-hover:text-[#5030E5]">Click to upload new image</span>
                                            </div>
                                            <input type="file" ref={editFileRef} accept="image/*" className="hidden" onChange={onEditImageChange} />
                                        </label>
                                    ) : (
                                        <div className="relative rounded-xl overflow-hidden border border-[#DBDBDB] h-[120px]">
                                            <img src={editImagePreview} alt="Task" className="w-full h-full object-cover" />
                                            <button
                                                type="button"
                                                onClick={() => setEditImagePreview(null)}
                                                className="absolute top-2 right-2 h-7 w-7 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                                            >
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
                                                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                                                </svg>
                                            </button>
                                        </div>
                                    )}
                                    {editImageError && <p className="text-[11px] text-[#D8727D] font-medium">{editImageError}</p>}
                                </div>

                                <div className="flex gap-3 pt-2">
                                    <button type="button" onClick={() => setEditingTask(null)} className="flex-1 py-3 rounded-xl border border-[#DBDBDB] text-[#787486] font-semibold hover:bg-gray-50 transition-colors">Cancel</button>
                                    <button type="submit" disabled={!editName.trim() || !!editError} className="flex-1 py-3 rounded-xl bg-[#5030E5] text-white font-semibold hover:bg-[#3d22c4] transition-colors shadow-lg shadow-[#5030E5]/20">Save Changes</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    )
}

export default Column