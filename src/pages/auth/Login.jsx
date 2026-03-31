import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Link, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'

const REMEMBER_KEY = 'pm_remembered_creds'

/* ─── Three.js animated background ─── */
function ThreeBackground({ darkMode }) {
    const mountRef = useRef(null)

    useEffect(() => {
        const el = mountRef.current
        if (!el) return

        /* Scene */
        const scene = new THREE.Scene()
        const w = el.clientWidth || window.innerWidth
        const h = el.clientHeight || window.innerHeight
        const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 1000)
        camera.position.z = 90

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(w, h)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        el.appendChild(renderer.domElement)

        /* Particles */
        const count = 280
        const positions = new Float32Array(count * 3)
        const particleData = []

        for (let i = 0; i < count; i++) {
            const x = (Math.random() - 0.5) * 200
            const y = (Math.random() - 0.5) * 200
            const z = (Math.random() - 0.5) * 80
            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z
            particleData.push({
                velocity: new THREE.Vector3(
                    (Math.random() - 0.5) * 0.08,
                    (Math.random() - 0.5) * 0.08,
                    (Math.random() - 0.5) * 0.02
                ),
            })
        }

        const geoParticles = new THREE.BufferGeometry()
        geoParticles.setAttribute('position', new THREE.BufferAttribute(positions, 3))
        const matParticles = new THREE.PointsMaterial({
            size: 1.2,
            color: darkMode ? 0x6c4ef5 : 0x5030e5,
            transparent: true,
            opacity: 0.75,
        })
        const particles = new THREE.Points(geoParticles, matParticles)
        scene.add(particles)

        /* Lines (neural network) */
        const MAX_LINE_DIST = 30
        const linePositions = new Float32Array(count * count * 6)
        const lineColors = new Float32Array(count * count * 6)
        const geoLines = new THREE.BufferGeometry()
        geoLines.setAttribute('position', new THREE.BufferAttribute(linePositions, 3).setUsage(THREE.DynamicDrawUsage))
        geoLines.setAttribute('color', new THREE.BufferAttribute(lineColors, 3).setUsage(THREE.DynamicDrawUsage))
        const matLines = new THREE.LineSegments(
            geoLines,
            new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.28 })
        )
        scene.add(matLines)

        /* Floating orbs */
        const orbs = []
        const orbData = [
            { r: 12, color: darkMode ? 0x6c4ef5 : 0x5030e5, x: -55, y: 35, z: -10 },
            { r: 7, color: darkMode ? 0x9b7fff : 0x8b5cf6, x: 60, y: -30, z: -20 },
            { r: 5, color: darkMode ? 0x3b82f6 : 0x0089ED, x: 30, y: 50, z: -30 },
        ]
        orbData.forEach(({ r, color, x, y, z }) => {
            const mesh = new THREE.Mesh(
                new THREE.SphereGeometry(r, 32, 32),
                new THREE.MeshBasicMaterial({
                    color,
                    transparent: true,
                    opacity: darkMode ? 0.12 : 0.08,
                    wireframe: true,
                })
            )
            mesh.position.set(x, y, z)
            scene.add(mesh)
            orbs.push({ mesh, speed: 0.003 + Math.random() * 0.002, phase: Math.random() * Math.PI * 2 })
        })

        /* Mouse parallax */
        const mouse = { x: 0, y: 0 }
        const onMouse = (e) => {
            mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
            mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2
        }
        window.addEventListener('mousemove', onMouse)

        /* Resize */
        const onResize = () => {
            const nw = el.clientWidth || window.innerWidth
            const nh = el.clientHeight || window.innerHeight
            camera.aspect = nw / nh
            camera.updateProjectionMatrix()
            renderer.setSize(nw, nh)
        }
        window.addEventListener('resize', onResize)

        /* Animation loop */
        let frame = 0
        let rafId
        const posArr = geoParticles.attributes.position.array

        const animate = () => {
            rafId = requestAnimationFrame(animate)
            frame++

            /* Move particles */
            for (let i = 0; i < count; i++) {
                posArr[i * 3] += particleData[i].velocity.x
                posArr[i * 3 + 1] += particleData[i].velocity.y
                posArr[i * 3 + 2] += particleData[i].velocity.z
                /* Wrap */
                if (Math.abs(posArr[i * 3]) > 100) particleData[i].velocity.x *= -1
                if (Math.abs(posArr[i * 3 + 1]) > 100) particleData[i].velocity.y *= -1
                if (Math.abs(posArr[i * 3 + 2]) > 40) particleData[i].velocity.z *= -1
            }
            geoParticles.attributes.position.needsUpdate = true

            /* Rebuild lines */
            let lineIdx = 0
            const linePos = geoLines.attributes.position.array
            const lineCols = geoLines.attributes.color.array
            const baseColor = darkMode ? new THREE.Color(0x6c4ef5) : new THREE.Color(0x5030e5)

            for (let i = 0; i < count; i++) {
                const ax = posArr[i * 3], ay = posArr[i * 3 + 1], az = posArr[i * 3 + 2]
                for (let j = i + 1; j < count; j++) {
                    const bx = posArr[j * 3], by = posArr[j * 3 + 1], bz = posArr[j * 3 + 2]
                    const dx = ax - bx, dy = ay - by, dz = az - bz
                    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz)
                    if (dist < MAX_LINE_DIST) {
                        const alpha = 1 - dist / MAX_LINE_DIST
                        linePos[lineIdx * 6] = ax; linePos[lineIdx * 6 + 1] = ay; linePos[lineIdx * 6 + 2] = az
                        linePos[lineIdx * 6 + 3] = bx; linePos[lineIdx * 6 + 4] = by; linePos[lineIdx * 6 + 5] = bz
                        lineCols[lineIdx * 6] = baseColor.r * alpha
                        lineCols[lineIdx * 6 + 1] = baseColor.g * alpha
                        lineCols[lineIdx * 6 + 2] = baseColor.b * alpha
                        lineCols[lineIdx * 6 + 3] = baseColor.r * alpha
                        lineCols[lineIdx * 6 + 4] = baseColor.g * alpha
                        lineCols[lineIdx * 6 + 5] = baseColor.b * alpha
                        lineIdx++
                    }
                }
            }
            geoLines.attributes.position.needsUpdate = true
            geoLines.attributes.color.needsUpdate = true
            geoLines.setDrawRange(0, lineIdx * 2)

            /* Orbs float */
            orbs.forEach(({ mesh, speed, phase }) => {
                mesh.rotation.y += speed
                mesh.rotation.x += speed * 0.5
                mesh.position.y += Math.sin(frame * 0.01 + phase) * 0.05
            })

            /* Parallax camera */
            camera.position.x += (mouse.x * 6 - camera.position.x) * 0.03
            camera.position.y += (mouse.y * 4 - camera.position.y) * 0.03
            camera.lookAt(scene.position)

            renderer.render(scene, camera)
        }
        animate()

        return () => {
            cancelAnimationFrame(rafId)
            window.removeEventListener('mousemove', onMouse)
            window.removeEventListener('resize', onResize)
            renderer.dispose()
            if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
        }
    }, [darkMode])

    return <div ref={mountRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />
}

/* ─── Eye icon ─── */
const EyeIcon = ({ open }) =>
    open ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
    )

/* ─── Main Login Page ─── */
const Login = () => {
    const { darkMode, toggleTheme } = useTheme()
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ email: '', password: '', remember: false })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    /* ── Pre-fill saved credentials on mount ── */
    useEffect(() => {
        try {
            const saved = localStorage.getItem(REMEMBER_KEY)
            if (saved) {
                const { email, password } = JSON.parse(saved)
                setForm(prev => ({ ...prev, email: email || '', password: password || '', remember: true }))
            }
        } catch { }
    }, [])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
        if (error) setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.email || !form.password) { setError('Please fill in all fields.'); return }
        setLoading(true)
        await new Promise(r => setTimeout(r, 400))
        const result = login(form.email, form.password, form.remember)
        setLoading(false)
        if (result.success) {
            /* Persist or clear saved credentials based on checkbox */
            if (form.remember) {
                localStorage.setItem(REMEMBER_KEY, JSON.stringify({ email: form.email, password: form.password }))
            } else {
                localStorage.removeItem(REMEMBER_KEY)
            }
            toast.success('Welcome back! Signed in successfully.', { duration: 3000 })
            navigate('/', { replace: true })
        } else {
            setError(result.message)
        }
    }

    const accent = darkMode ? '#6C4EF5' : '#5030E5'
    const accentHover = darkMode ? '#8B6FFF' : '#3d22c4'

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            overflow: 'hidden',
            background: darkMode
                ? 'linear-gradient(135deg, #0F1117 0%, #161B2E 50%, #1a1040 100%)'
                : 'linear-gradient(135deg, #f0f4ff 0%, #e8ecff 50%, #f5f0ff 100%)',
            fontFamily: 'Inter, sans-serif',
            transition: 'background 0.4s ease',
        }}>
            <ThreeBackground darkMode={darkMode} />

            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="theme-toggle-btn"
                data-tooltip={darkMode ? 'Switch to Light' : 'Switch to Dark'}
                aria-label="Toggle dark mode"
            >
                <div className="icon-wrap">
                    <svg className="sun-icon" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="5" />
                        <line x1="12" y1="1" x2="12" y2="3" />
                        <line x1="12" y1="21" x2="12" y2="23" />
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                        <line x1="1" y1="12" x2="3" y2="12" />
                        <line x1="21" y1="12" x2="23" y2="12" />
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </svg>
                    <svg className="moon-icon" width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="#9B7FFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                </div>
            </button>

            {/* Main content */}
            <div style={{
                position: 'relative',
                zIndex: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                padding: '24px',
            }}>
                <div style={{
                    display: 'flex',
                    width: '100%',
                    maxWidth: '960px',
                    minHeight: '580px',
                    borderRadius: '28px',
                    overflow: 'hidden',
                    boxShadow: darkMode
                        ? '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,78,245,0.2)'
                        : '0 32px 80px rgba(80,48,229,0.16), 0 0 0 1px rgba(80,48,229,0.08)',
                    transition: 'box-shadow 0.4s ease',
                }}>
                    {/* Left panel — branding */}
                    <div style={{
                        flex: '1 1 45%',
                        background: `linear-gradient(150deg, ${accent} 0%, ${darkMode ? '#1a0c56' : '#3b22c4'} 100%)`,
                        padding: '56px 48px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* Decorative blobs */}
                        <div style={{
                            position: 'absolute', width: 240, height: 240, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.06)', top: -60, right: -60,
                        }} />
                        <div style={{
                            position: 'absolute', width: 160, height: 160, borderRadius: '50%',
                            background: 'rgba(255,255,255,0.04)', bottom: 40, left: -40,
                        }} />

                        {/* Logo row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
                            <img src="/logo.svg" alt="TaskFlow" style={{ width: 36, height: 36 }} />
                            <span style={{ color: '#fff', fontWeight: 700, fontSize: 18, letterSpacing: '0.02em' }}>
                                TaskFlow
                            </span>
                        </div>

                        {/* Centre text */}
                        <div style={{ position: 'relative' }}>
                            <div style={{
                                display: 'inline-block',
                                background: 'rgba(255,255,255,0.12)',
                                borderRadius: 10,
                                padding: '6px 14px',
                                color: 'rgba(255,255,255,0.85)',
                                fontSize: 12,
                                fontWeight: 600,
                                letterSpacing: '0.08em',
                                textTransform: 'uppercase',
                                marginBottom: 20,
                            }}>Project Management</div>
                            <h2 style={{
                                color: '#fff',
                                fontSize: 'clamp(28px, 3vw, 38px)',
                                fontWeight: 800,
                                lineHeight: 1.2,
                                margin: 0,
                                marginBottom: 16,
                            }}>
                                Welcome back!
                            </h2>
                            <p style={{
                                color: 'rgba(255,255,255,0.72)',
                                fontSize: 15,
                                lineHeight: 1.7,
                                margin: 0,
                            }}>
                                Sign in to manage your projects, collaborate with your team, and track progress — all in one place.
                            </p>
                        </div>

                        {/* Stats row */}
                        <div style={{
                            display: 'flex', gap: 24, position: 'relative',
                        }}>
                            {[['500+', 'Projects'], ['12k+', 'Tasks done'], ['98%', 'Uptime']].map(([v, l]) => (
                                <div key={l}>
                                    <div style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>{v}</div>
                                    <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 12 }}>{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right panel — form */}
                    <div style={{
                        flex: '1 1 55%',
                        background: darkMode ? 'rgba(22,27,46,0.97)' : 'rgba(255,255,255,0.97)',
                        backdropFilter: 'blur(20px)',
                        padding: '56px 52px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        transition: 'background 0.4s ease',
                    }}>
                        <h1 style={{
                            margin: 0,
                            marginBottom: 8,
                            fontSize: 28,
                            fontWeight: 800,
                            color: darkMode ? '#fff' : '#0D062D',
                            transition: 'color 0.3s',
                        }}>
                            Sign In
                        </h1>
                        <p style={{
                            margin: 0,
                            marginBottom: 36,
                            color: darkMode ? '#8892A4' : '#787486',
                            fontSize: 14,
                            transition: 'color 0.3s',
                        }}>
                            Don't have an account?{' '}
                            <Link to="/signup" style={{ color: accent, fontWeight: 600, textDecoration: 'none' }}>
                                Create one
                            </Link>
                        </p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                            {/* Email */}
                            <div>
                                <label style={{
                                    display: 'block',
                                    marginBottom: 8,
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: darkMode ? '#A8B2C8' : '#5A5472',
                                    transition: 'color 0.3s',
                                }}>
                                    Email address
                                </label>
                                <input
                                    id="login-email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="admin@taskflow.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    style={{
                                        width: '100%',
                                        padding: '13px 16px',
                                        borderRadius: 12,
                                        border: `1.5px solid ${error ? '#ef4444' : darkMode ? '#2D3148' : '#DBDBDB'}`,
                                        background: darkMode ? '#1E2438' : '#F8F9FB',
                                        color: darkMode ? '#fff' : '#0D062D',
                                        fontSize: 14,
                                        outline: 'none',
                                        transition: 'border-color 0.2s, box-shadow 0.2s',
                                        boxSizing: 'border-box',
                                    }}
                                    onFocus={e => e.target.style.borderColor = accent}
                                    onBlur={e => e.target.style.borderColor = error ? '#ef4444' : darkMode ? '#2D3148' : '#DBDBDB'}
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <label style={{
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: darkMode ? '#A8B2C8' : '#5A5472',
                                        transition: 'color 0.3s',
                                    }}>
                                        Password
                                    </label>
                                    <button type="button" style={{
                                        background: 'none',
                                        border: 'none',
                                        color: accent,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        padding: 0,
                                        fontFamily: 'inherit',
                                    }}>
                                        Forgot password?
                                    </button>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        id="login-password"
                                        name="password"
                                        type={showPw ? 'text' : 'password'}
                                        autoComplete="current-password"
                                        placeholder="admin123"
                                        value={form.password}
                                        onChange={handleChange}
                                        style={{
                                            width: '100%',
                                            padding: '13px 48px 13px 16px',
                                            borderRadius: 12,
                                            border: `1.5px solid ${error ? '#ef4444' : darkMode ? '#2D3148' : '#DBDBDB'}`,
                                            background: darkMode ? '#1E2438' : '#F8F9FB',
                                            color: darkMode ? '#fff' : '#0D062D',
                                            fontSize: 14,
                                            outline: 'none',
                                            transition: 'border-color 0.2s',
                                            boxSizing: 'border-box',
                                        }}
                                        onFocus={e => e.target.style.borderColor = accent}
                                        onBlur={e => e.target.style.borderColor = error ? '#ef4444' : darkMode ? '#2D3148' : '#DBDBDB'}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(v => !v)}
                                        style={{
                                            position: 'absolute',
                                            right: 14,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: darkMode ? '#555F7A' : '#A8A8B3',
                                            display: 'flex',
                                            alignItems: 'center',
                                            padding: 0,
                                        }}
                                        aria-label={showPw ? 'Hide password' : 'Show password'}
                                    >
                                        <EyeIcon open={showPw} />
                                    </button>
                                </div>
                            </div>

                            {/* Remember me */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <input
                                    id="login-remember"
                                    name="remember"
                                    type="checkbox"
                                    checked={form.remember}
                                    onChange={handleChange}
                                    style={{ width: 16, height: 16, accentColor: accent, cursor: 'pointer' }}
                                />
                                <label htmlFor="login-remember" style={{
                                    fontSize: 13,
                                    color: darkMode ? '#8892A4' : '#787486',
                                    cursor: 'pointer',
                                }}>
                                    Keep me signed in
                                </label>
                            </div>

                            {/* Error */}
                            {error && (
                                <div style={{
                                    background: 'rgba(239,68,68,0.1)',
                                    border: '1px solid rgba(239,68,68,0.3)',
                                    borderRadius: 10,
                                    padding: '10px 14px',
                                    color: '#ef4444',
                                    fontSize: 13,
                                    fontWeight: 500,
                                }}>
                                    {error}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                id="login-submit"
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '14px',
                                    borderRadius: 12,
                                    border: 'none',
                                    background: `linear-gradient(135deg, ${accent}, ${darkMode ? '#9b7fff' : '#8B5CF6'})`,
                                    color: '#fff',
                                    fontWeight: 700,
                                    fontSize: 15,
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    opacity: loading ? 0.75 : 1,
                                    transition: 'transform 0.15s, box-shadow 0.15s, opacity 0.15s',
                                    boxShadow: `0 8px 28px ${accent}55`,
                                    fontFamily: 'inherit',
                                    letterSpacing: '0.02em',
                                }}
                                onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = `0 12px 36px ${accent}70` } }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 8px 28px ${accent}55` }}
                            >
                                {loading ? 'Signing in…' : 'Sign In →'}
                            </button>

                            {/* Divider */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                                color: darkMode ? '#555F7A' : '#A8A8B3',
                                fontSize: 12,
                            }}>
                                <div style={{ flex: 1, height: 1, background: darkMode ? '#2D3148' : '#DBDBDB' }} />
                                or continue with
                                <div style={{ flex: 1, height: 1, background: darkMode ? '#2D3148' : '#DBDBDB' }} />
                            </div>

                            {/* Social buttons */}
                            <div style={{ display: 'flex', gap: 12 }}>
                                {[
                                    {
                                        label: 'Google',
                                        icon: (
                                            <svg width="18" height="18" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                        ),
                                    },
                                    {
                                        label: 'GitHub',
                                        icon: (
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill={darkMode ? '#fff' : '#0D062D'}>
                                                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                                            </svg>
                                        ),
                                    },
                                ].map(({ label, icon }) => (
                                    <button
                                        key={label}
                                        type="button"
                                        style={{
                                            flex: 1,
                                            padding: '11px',
                                            border: `1.5px solid ${darkMode ? '#2D3148' : '#DBDBDB'}`,
                                            borderRadius: 12,
                                            background: darkMode ? '#1E2438' : '#fff',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 8,
                                            fontSize: 13,
                                            fontWeight: 600,
                                            color: darkMode ? '#A8B2C8' : '#0D062D',
                                            transition: 'border-color 0.2s, background 0.2s',
                                            fontFamily: 'inherit',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = accent}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = darkMode ? '#2D3148' : '#DBDBDB'}
                                    >
                                        {icon} {label}
                                    </button>
                                ))}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login
