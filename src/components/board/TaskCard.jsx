import React, { useState, useEffect } from 'react'
import users from '../../data/users'
import UserAvatar from '../ui/UserAvatar'
import { useAuth } from '../../context/AuthContext'
import messageIcon from '/message.svg'
import fileIcon from '/File.svg'

const STATUS_LABELS = {
    todo: 'To Do',
    inProgress: 'In Progress',
    completed: 'Completed',
    onHold: 'On Hold'
}

const TaskCard = ({ task, isClient, onDragStart, onDragEnd, onEdit }) => {
    const { currentUser } = useAuth()
    const [isDragging, setIsDragging] = useState(false)
    const [imgError, setImgError] = useState(false)
    const [showLogInfo, setShowLogInfo] = useState(false)
    
    // Comments state
    const [showComments, setShowComments] = useState(false)
    const [comments, setComments] = useState([])
    const [newComment, setNewComment] = useState('')
    const [showAllComments, setShowAllComments] = useState(false)
    
    // Edit comment state
    const [editingCommentId, setEditingCommentId] = useState(null)
    const [editCommentText, setEditCommentText] = useState('')

    // Load comments from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem(`task_comments_${task.id}`)
        if (stored) {
            try {
                setComments(JSON.parse(stored))
            } catch (e) { console.error('Error parsing comments', e) }
        }
    }, [task.id])

    // Save comments to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(`task_comments_${task.id}`, JSON.stringify(comments))
    }, [comments, task.id])

    const handleAddComment = (e) => {
        e.preventDefault()
        const text = newComment.trim()
        if (!text) return
        
        const commentObj = {
            id: Date.now(),
            text,
            authorName: currentUser.name,
            authorId: currentUser.id,
            timestamp: new Date().toISOString()
        }
        setComments(prev => [commentObj, ...prev])
        setNewComment('')
        // Automatically show all if we just added one so user sees it
        setShowAllComments(true)
    }

    const handleDeleteComment = (commentId) => {
        setComments(prev => prev.filter(c => c.id !== commentId))
    }

    const startEditing = (comment) => {
        setEditingCommentId(comment.id)
        setEditCommentText(comment.text)
    }

    const handleSaveEdit = (commentId) => {
        const text = editCommentText.trim()
        if (!text) return
        setComments(prev => prev.map(c => 
            c.id === commentId ? { ...c, text, timestamp: new Date().toISOString() } : c
        ))
        setEditingCommentId(null)
        setEditCommentText('')
    }

    // Number of comments currently displayed
    const displayedComments = showAllComments ? comments : comments.slice(0, 3)
    const mockBaseComments = Number(task.comments) || 0;
    const totalCommentsCount = mockBaseComments + comments.length;

    return (
        <>
            <div
                draggable={true}
                onDragStart={(e) => {
                    setIsDragging(true)
                    e.dataTransfer.effectAllowed = 'move'
                    e.dataTransfer.setData('text/plain', String(task.id))
                    onDragStart()
                }}
                onDragEnd={() => {
                    setIsDragging(false)
                    if (onDragEnd) onDragEnd()
                }}
                className={`
                bg-white rounded-xl shadow-sm ${!isClient ? 'cursor-grab active:cursor-grabbing' : ''}
                select-none group/card overflow-hidden
                transition-all duration-200
                ${isDragging
                        ? 'opacity-40 scale-95 rotate-1 shadow-lg ring-2 ring-[#5030E5]/20'
                        : 'opacity-100 hover:shadow-md hover:-translate-y-0.5'
                    }
            `}
            >

                <div className="p-4">
                    {/* Priority + drag handle */}
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                            <span className={`text-[11px] font-semibold px-2 py-1 rounded-md ${task.priority === 'Low'
                                ? 'bg-[#DFA874]/15 text-[#D58D49]'
                                : task.priority === 'High'
                                    ? 'bg-[#D8727D]/10 text-[#D8727D]'
                                    : 'bg-[#7AC555]/10 text-[#7AC555]'
                                }`}>
                                {task.priority}
                            </span>
                            {/* Edit Button */}
                            {!isClient && (
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEdit(); }}
                                    className="opacity-0 group-hover/card:opacity-60 hover:!opacity-100 transition-opacity p-1 rounded-md hover:bg-gray-100"
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#787486" strokeWidth="2.5" strokeLinecap="round">
                                        <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
                                    </svg>
                                </button>
                            )}

                            {/* Task Log Button */}
                            {task.stateLogs && task.stateLogs.length > 0 && (
                                <button
                                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowLogInfo(true); }}
                                    className="opacity-0 group-hover/card:opacity-100 transition-opacity p-1 rounded-md bg-blue-50 text-[#5030E5] hover:bg-[#5030E5] hover:text-white flex items-center gap-1"
                                    title="Task Activity Logs"
                                >
                                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="12 8 12 12 14 14" /><circle cx="12" cy="12" r="10" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {/* Drag dots handle */}
                        {!isClient && (
                            <div className="opacity-0 group-hover/card:opacity-40 transition-opacity flex flex-col gap-[3px] mt-0.5 pointer-events-none">
                                {[0, 1, 2].map(i => (
                                    <div key={i} className="flex gap-[3px]">
                                        <div className="h-[3px] w-[3px] rounded-full bg-gray-400" />
                                        <div className="h-[3px] w-[3px] rounded-full bg-gray-400" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <h3 className="font-semibold text-[14px] text-[#0D062D] mt-2 leading-snug">{task.title}</h3>

                    {task.text && (
                        <p className="text-[12px] text-[#787486] mt-1 leading-relaxed line-clamp-2">{task.text}</p>
                    )}

                    {/* Task image — shown at the top if present */}
                    {task.image && !imgError && (
                        <div className="w-full h-[130px] overflow-hidden bg-gray-100">
                            <img
                                src={task.image}
                                alt={task.title}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover/card:scale-105"
                                onError={() => setImgError(true)}
                            />
                        </div>
                    )}

                    {/* Footer: Avatars + stats */}
                    <div className="pt-4 mt-2 border-t border-[#F3F4F6] flex justify-between items-center">

                        <div className="flex -space-x-2">
                            {users.slice(0, 3).map((user) => (
                                <UserAvatar
                                    key={user.id}
                                    user={user}
                                    className="h-6 w-6 rounded-full ring-2 ring-white"
                                />
                            ))}
                        </div>
                        <div className="flex items-center gap-3">
                            <div 
                                className="flex items-center gap-1 text-[#787486] cursor-pointer hover:text-[#5030E5] transition-colors group/stat"
                                onClick={(e) => { e.stopPropagation(); setShowComments(!showComments); }}
                                title="Toggle Comments"
                            >
                                <img src={messageIcon} alt="comments" className="h-3.5 w-3.5 opacity-60 group-hover/stat:opacity-100 group-hover/stat:drop-shadow-md transition-all" />
                                <span className="text-[12px] font-medium transition-colors">{totalCommentsCount}</span>
                            </div>
                            <div className="flex items-center gap-1 text-[#787486] cursor-pointer hover:text-[#5030E5] transition-colors group/stat">
                                <img src={fileIcon} alt="files" className="h-3.5 w-3.5 opacity-60 group-hover/stat:opacity-100 group-hover/stat:drop-shadow-md transition-all" />
                                <span className="text-[12px] font-medium transition-colors">{task.files}</span>
                            </div>
                        </div>
                    </div>
                    {/* Dynamic Comments Section */}
                    {showComments && (
                        <div className="mt-4 pt-3 border-t border-[#F3F4F6] flex flex-col gap-3" onClick={e => e.stopPropagation()}>
                            
                            {/* Comments List */}
                            {comments.length > 0 ? (
                                <div className="flex flex-col gap-3">
                                    {displayedComments.map(c => {
                                        const isEditing = editingCommentId === c.id
                                        const isAuthor = c.authorId === currentUser.id

                                        return (
                                            <div key={c.id} className="flex gap-2 items-start group/comment">
                                                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-indigo-700 capitalize">
                                                    {c.authorName?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex flex-col bg-gray-50 rounded-xl rounded-tl-sm px-3 py-2 flex-1">
                                                    <div className="flex justify-between items-center mb-0.5">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[11px] font-bold text-[#0D062D]">{c.authorName}</span>
                                                            <span className="text-[9px] font-medium text-gray-400">
                                                                {new Date(c.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        
                                                        {isAuthor && !isEditing && (
                                                            <div className="flex items-center gap-1 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                                                                <button 
                                                                    onClick={() => startEditing(c)}
                                                                    className="p-1 hover:bg-indigo-100 rounded text-indigo-600 transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleDeleteComment(c.id)}
                                                                    className="p-1 hover:bg-red-100 rounded text-red-500 transition-colors"
                                                                    title="Delete"
                                                                >
                                                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {isEditing ? (
                                                        <div className="flex flex-col gap-2 mt-1">
                                                            <textarea
                                                                value={editCommentText}
                                                                onChange={e => setEditCommentText(e.target.value)}
                                                                maxLength={200}
                                                                className="w-full text-[12px] bg-white border border-indigo-200 rounded-lg px-2 py-1.5 outline-none focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                                                                rows={2}
                                                            />
                                                            <div className="flex justify-end gap-2">
                                                                <button 
                                                                    onClick={() => setEditingCommentId(null)}
                                                                    className="text-[10px] font-bold text-gray-400 hover:text-gray-600"
                                                                >
                                                                    Cancel
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleSaveEdit(c.id)}
                                                                    disabled={!editCommentText.trim()}
                                                                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 disabled:text-gray-300"
                                                                >
                                                                    Save
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <p className="text-[12px] text-[#0D062D] leading-snug break-words whitespace-pre-wrap">{c.text}</p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                    
                                    {!showAllComments && comments.length > 3 && (
                                        <button 
                                            onClick={() => setShowAllComments(true)}
                                            className="text-[11px] font-semibold text-[#5030E5] hover:text-[#3d22c4] self-start transition-colors"
                                        >
                                            See previous comments ({comments.length - 3})
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <p className="text-[11px] text-gray-400 font-medium italic mb-1">No comments yet. Be the first!</p>
                            )}

                            {/* Add Comment Input */}
                            <form onSubmit={handleAddComment} className="flex gap-2 items-end mt-1">
                                <UserAvatar user={currentUser} className="w-6 h-6 rounded-full flex-shrink-0 mb-1" />
                                <div className="flex-1 relative">
                                    <textarea
                                        value={newComment}
                                        onChange={e => setNewComment(e.target.value)}
                                        placeholder="Write a comment..."
                                        maxLength={200}
                                        rows={Math.min(3, newComment.split('\n').length)}
                                        className="w-full text-[12px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-[#5030E5] focus:bg-white transition-colors resize-none overflow-hidden"
                                        style={{ minHeight: '34px' }}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleAddComment(e);
                                            }
                                        }}
                                    />
                                    <div className="flex justify-between items-center mt-1 px-1">
                                        <span className={`text-[9px] font-medium ${newComment.length >= 200 ? 'text-red-500' : 'text-gray-400'}`}>
                                            {newComment.length}/200
                                        </span>
                                        <button 
                                            type="submit" 
                                            disabled={!newComment.trim()}
                                            className="text-[10px] font-bold text-[#5030E5] disabled:text-gray-300 disabled:cursor-not-allowed hover:text-[#3d22c4] transition-colors"
                                        >
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>

            {/* Task Log Information Modal */}
            {showLogInfo && (
                <div className="fixed inset-0 z-[600] flex items-center justify-center bg-black/40 backdrop-blur-sm px-4" onClick={() => setShowLogInfo(false)}>
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-[420px] p-6 flex flex-col gap-4" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-[#5030E5]/10 flex items-center justify-center">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#5030E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="12 8 12 12 14 14" /><circle cx="12" cy="12" r="10" />
                                    </svg>
                                </div>
                                <h3 className="font-bold text-[#0D062D] text-lg">Activity History</h3>
                            </div>
                            <button onClick={() => setShowLogInfo(false)} className="text-slate-400 hover:text-slate-600">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                            </button>
                        </div>

                        <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-2">
                            {task.stateLogs && task.stateLogs.length > 0 ? (
                                task.stateLogs.map((log, i) => (
                                    <div key={i} className="flex gap-3 text-[13px] items-start relative">
                                        {i !== task.stateLogs.length - 1 && (
                                            <div className="absolute left-[11.5px] top-6 bottom-[-16px] w-[2px] bg-slate-100" />
                                        )}
                                        <div className="w-6 h-6 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 z-10">
                                            <div className="w-2.5 h-2.5 rounded-full bg-[#5030E5]" />
                                        </div>
                                        <div className="flex flex-col flex-1 pb-3">
                                            <span className="text-slate-700">
                                                <span className="font-bold text-[#0D062D]">{log.by}</span> changed state to <span className="font-bold text-[#5030E5]">{STATUS_LABELS[log.status] || log.status}</span>
                                            </span>
                                            <span className="text-[11px] text-slate-400 font-medium mt-0.5">
                                                {new Date(log.date).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-400 italic text-center py-4">No activity recorded.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default TaskCard