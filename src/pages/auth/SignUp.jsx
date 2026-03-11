import React, { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import { Link, useNavigate } from 'react-router-dom'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'

/* ─── Three.js animated background (rotating torus + floating rings) ─── */
function ThreeBackground({ darkMode }) {
    const mountRef = useRef(null)

    useEffect(() => {
        const el = mountRef.current
        if (!el) return

        const w = el.clientWidth || window.innerWidth
        const h = el.clientHeight || window.innerHeight

        const scene = new THREE.Scene()
        const camera = new THREE.PerspectiveCamera(65, w / h, 0.1, 800)
        camera.position.z = 100

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
        renderer.setSize(w, h)
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
        el.appendChild(renderer.domElement)

        const accent = darkMode ? 0x6c4ef5 : 0x5030e5
        const accent2 = darkMode ? 0x3b82f6 : 0x0089ED
        const accent3 = darkMode ? 0x9b7fff : 0x8b5cf6

        /* Main wireframe torus knot */
        const torusKnot = new THREE.Mesh(
            new THREE.TorusKnotGeometry(22, 5, 120, 16),
            new THREE.MeshBasicMaterial({ color: accent, wireframe: true, transparent: true, opacity: 0.18 })
        )
        torusKnot.position.set(45, -10, -30)
        scene.add(torusKnot)

        /* Icosahedron */
        const icosa = new THREE.Mesh(
            new THREE.IcosahedronGeometry(18, 1),
            new THREE.MeshBasicMaterial({ color: accent3, wireframe: true, transparent: true, opacity: 0.13 })
        )
        icosa.position.set(-55, 25, -40)
        scene.add(icosa)

        /* Octahedron */
        const octa = new THREE.Mesh(
            new THREE.OctahedronGeometry(10, 0),
            new THREE.MeshBasicMaterial({ color: accent2, wireframe: true, transparent: true, opacity: 0.2 })
        )
        octa.position.set(20, 45, -20)
        scene.add(octa)

        /* Small floating spheres */
        const smallSpheres = []
        for (let i = 0; i < 6; i++) {
            const s = new THREE.Mesh(
                new THREE.SphereGeometry(2.5 + Math.random() * 3, 12, 12),
                new THREE.MeshBasicMaterial({
                    color: [accent, accent2, accent3][i % 3],
                    transparent: true,
                    opacity: 0.15,
                    wireframe: true,
                })
            )
            s.position.set(
                (Math.random() - 0.5) * 160,
                (Math.random() - 0.5) * 120,
                (Math.random() - 0.5) * 60
            )
            scene.add(s)
            smallSpheres.push({ mesh: s, phase: Math.random() * Math.PI * 2, speed: 0.008 + Math.random() * 0.008 })
        }

        /* Particles */
        const count = 200
        const pos = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            pos[i * 3] = (Math.random() - 0.5) * 220
            pos[i * 3 + 1] = (Math.random() - 0.5) * 180
            pos[i * 3 + 2] = (Math.random() - 0.5) * 80
        }
        const gp = new THREE.BufferGeometry()
        gp.setAttribute('position', new THREE.BufferAttribute(pos, 3))
        const points = new THREE.Points(gp, new THREE.PointsMaterial({
            size: 1.4,
            color: accent,
            transparent: true,
            opacity: 0.55,
        }))
        scene.add(points)

        /* Mouse parallax */
        const mouse = { x: 0, y: 0 }
        const onMouse = e => {
            mouse.x = (e.clientX / window.innerWidth - 0.5) * 2
            mouse.y = -(e.clientY / window.innerHeight - 0.5) * 2
        }
        window.addEventListener('mousemove', onMouse)

        const onResize = () => {
            const nw = el.clientWidth || window.innerWidth
            const nh = el.clientHeight || window.innerHeight
            camera.aspect = nw / nh
            camera.updateProjectionMatrix()
            renderer.setSize(nw, nh)
        }
        window.addEventListener('resize', onResize)

        let frame = 0
        let rafId

        const animate = () => {
            rafId = requestAnimationFrame(animate)
            frame++

            torusKnot.rotation.x += 0.003
            torusKnot.rotation.y += 0.005
            torusKnot.rotation.z += 0.002

            icosa.rotation.x -= 0.004
            icosa.rotation.y += 0.006

            octa.rotation.x += 0.007
            octa.rotation.z += 0.004

            points.rotation.y += 0.0008

            smallSpheres.forEach(({ mesh, phase, speed }) => {
                mesh.rotation.x += speed
                mesh.rotation.y += speed * 0.7
                mesh.position.y += Math.sin(frame * 0.012 + phase) * 0.06
            })

            camera.position.x += (mouse.x * 8 - camera.position.x) * 0.03
            camera.position.y += (mouse.y * 5 - camera.position.y) * 0.03
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

/* ─── Check icon ─── */
const CheckIcon = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"
        strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

/* ─── Password strength ─── */
const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong']
const strengthColor = ['', '#ef4444', '#f59e0b', '#3b82f6', '#22c55e']

function getStrength(pw) {
    let score = 0
    if (pw.length >= 8) score++
    if (/[A-Z]/.test(pw)) score++
    if (/[0-9]/.test(pw)) score++
    if (/[^A-Za-z0-9]/.test(pw)) score++
    return score
}

/* ─── Main SignUp Page ─── */
const SignUp = () => {
    const { darkMode, toggleTheme } = useTheme()
    const { register } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirm: '', terms: false,
    })
    const [showPw, setShowPw] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState({})

    const accent = darkMode ? '#6C4EF5' : '#5030E5'
    const strength = getStrength(form.password)

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Full name is required.'
        if (!form.email) e.email = 'Email is required.'
        else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email.'
        if (!form.password) e.password = 'Password is required.'
        else if (form.password.length < 8) e.password = 'At least 8 characters.'
        if (!form.confirm) e.confirm = 'Please confirm your password.'
        else if (form.confirm !== form.password) e.confirm = 'Passwords do not match.'
        if (!form.terms) e.terms = 'You must accept the terms.'
        return e
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }
        setLoading(true)
        await new Promise(r => setTimeout(r, 400)) // small UX delay
        const result = register({ name: form.name, email: form.email, password: form.password })
        setLoading(false)
        if (result.success) {
            toast.success('Account created! Welcome aboard 🎉', { duration: 3500 })
            navigate('/', { replace: true })
        } else {
            setErrors({ general: result.message })
        }
    }

    const inputStyle = (name) => ({
        width: '100%',
        padding: '12px 16px',
        borderRadius: 12,
        border: `1.5px solid ${errors[name] ? '#ef4444' : darkMode ? '#2D3148' : '#DBDBDB'}`,
        background: darkMode ? '#1E2438' : '#F8F9FB',
        color: darkMode ? '#fff' : '#0D062D',
        fontSize: 14,
        outline: 'none',
        transition: 'border-color 0.2s',
        boxSizing: 'border-box',
        fontFamily: 'Inter, sans-serif',
    })

    const labelStyle = {
        display: 'block',
        marginBottom: 7,
        fontSize: 13,
        fontWeight: 600,
        color: darkMode ? '#A8B2C8' : '#5A5472',
        transition: 'color 0.3s',
    }

    const handleFocus = (e, name) => {
        e.target.style.borderColor = accent
        e.target.style.boxShadow = `0 0 0 3px ${accent}22`
    }
    const handleBlur = (e, name) => {
        e.target.style.borderColor = errors[name] ? '#ef4444' : darkMode ? '#2D3148' : '#DBDBDB'
        e.target.style.boxShadow = 'none'
    }

    return (
        <div style={{
            position: 'relative',
            minHeight: '100vh',
            width: '100%',
            overflow: 'hidden',
            background: darkMode
                ? 'linear-gradient(135deg, #0F1117 0%, #1a1040 50%, #0d1626 100%)'
                : 'linear-gradient(135deg, #f5f0ff 0%, #e8f4ff 50%, #f0f4ff 100%)',
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
                    maxWidth: '1000px',
                    borderRadius: '28px',
                    overflow: 'hidden',
                    boxShadow: darkMode
                        ? '0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(108,78,245,0.2)'
                        : '0 32px 80px rgba(80,48,229,0.16), 0 0 0 1px rgba(80,48,229,0.08)',
                    transition: 'box-shadow 0.4s ease',
                }}>
                    {/* Left — Form */}
                    <div style={{
                        flex: '1 1 58%',
                        background: darkMode ? 'rgba(22,27,46,0.97)' : 'rgba(255,255,255,0.97)',
                        backdropFilter: 'blur(20px)',
                        padding: '52px 52px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        transition: 'background 0.4s ease',
                    }}>
                        {/* Logo */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
                            <img src="/logo.svg" alt="" style={{ width: 30, height: 30 }} />
                            <span style={{ fontWeight: 800, fontSize: 16, color: darkMode ? '#fff' : '#0D062D' }}>
                                TaskFlow
                            </span>
                        </div>

                        <h1 style={{
                            margin: 0,
                            marginBottom: 6,
                            fontSize: 26,
                            fontWeight: 800,
                            color: darkMode ? '#fff' : '#0D062D',
                        }}>
                            Create your account
                        </h1>
                        <p style={{
                            margin: 0,
                            marginBottom: 28,
                            color: darkMode ? '#8892A4' : '#787486',
                            fontSize: 14,
                        }}>
                            Already have an account?{' '}
                            <Link to="/login" style={{ color: accent, fontWeight: 600, textDecoration: 'none' }}>
                                Sign in
                            </Link>
                        </p>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {/* Name + Email row */}
                            <div style={{ display: 'flex', gap: 14 }}>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Full name</label>
                                    <input
                                        id="signup-name"
                                        name="name"
                                        type="text"
                                        autoComplete="name"
                                        placeholder="John Doe"
                                        value={form.name}
                                        onChange={handleChange}
                                        style={inputStyle('name')}
                                        onFocus={e => handleFocus(e, 'name')}
                                        onBlur={e => handleBlur(e, 'name')}
                                    />
                                    {errors.name && <p style={{ margin: '5px 0 0', color: '#ef4444', fontSize: 12 }}>{errors.name}</p>}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label style={labelStyle}>Work email</label>
                                    <input
                                        id="signup-email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        placeholder="you@company.com"
                                        value={form.email}
                                        onChange={handleChange}
                                        style={inputStyle('email')}
                                        onFocus={e => handleFocus(e, 'email')}
                                        onBlur={e => handleBlur(e, 'email')}
                                    />
                                    {errors.email && <p style={{ margin: '5px 0 0', color: '#ef4444', fontSize: 12 }}>{errors.email}</p>}
                                </div>
                            </div>

                            {/* Password */}
                            <div>
                                <label style={labelStyle}>Password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        id="signup-password"
                                        name="password"
                                        type={showPw ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="Min. 8 characters"
                                        value={form.password}
                                        onChange={handleChange}
                                        style={{ ...inputStyle('password'), paddingRight: 48 }}
                                        onFocus={e => handleFocus(e, 'password')}
                                        onBlur={e => handleBlur(e, 'password')}
                                    />
                                    <button type="button" onClick={() => setShowPw(v => !v)}
                                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: darkMode ? '#555F7A' : '#A8A8B3', display: 'flex', alignItems: 'center', padding: 0 }}>
                                        <EyeIcon open={showPw} />
                                    </button>
                                </div>
                                {/* Strength meter */}
                                {form.password && (
                                    <div style={{ marginTop: 8 }}>
                                        <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} style={{
                                                    flex: 1, height: 3, borderRadius: 4,
                                                    background: i <= strength ? strengthColor[strength] : darkMode ? '#2D3148' : '#DBDBDB',
                                                    transition: 'background 0.3s',
                                                }} />
                                            ))}
                                        </div>
                                        <span style={{ fontSize: 11, color: strengthColor[strength], fontWeight: 600 }}>
                                            {strengthLabel[strength]}
                                        </span>
                                    </div>
                                )}
                                {errors.password && <p style={{ margin: '5px 0 0', color: '#ef4444', fontSize: 12 }}>{errors.password}</p>}
                            </div>

                            {/* Confirm password */}
                            <div>
                                <label style={labelStyle}>Confirm password</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        id="signup-confirm"
                                        name="confirm"
                                        type={showConfirm ? 'text' : 'password'}
                                        autoComplete="new-password"
                                        placeholder="Repeat your password"
                                        value={form.confirm}
                                        onChange={handleChange}
                                        style={{ ...inputStyle('confirm'), paddingRight: 48 }}
                                        onFocus={e => handleFocus(e, 'confirm')}
                                        onBlur={e => handleBlur(e, 'confirm')}
                                    />
                                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: darkMode ? '#555F7A' : '#A8A8B3', display: 'flex', alignItems: 'center', padding: 0 }}>
                                        <EyeIcon open={showConfirm} />
                                    </button>
                                </div>
                                {errors.confirm && <p style={{ margin: '5px 0 0', color: '#ef4444', fontSize: 12 }}>{errors.confirm}</p>}
                            </div>

                            {/* Terms */}
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                <input
                                    id="signup-terms"
                                    name="terms"
                                    type="checkbox"
                                    checked={form.terms}
                                    onChange={handleChange}
                                    style={{ marginTop: 2, width: 16, height: 16, accentColor: accent, cursor: 'pointer' }}
                                />
                                <label htmlFor="signup-terms" style={{ fontSize: 13, color: darkMode ? '#8892A4' : '#787486', lineHeight: 1.5, cursor: 'pointer' }}>
                                    I agree to the{' '}
                                    <span style={{ color: accent, fontWeight: 600 }}>Terms of Service</span>
                                    {' '}and{' '}
                                    <span style={{ color: accent, fontWeight: 600 }}>Privacy Policy</span>
                                </label>
                            </div>
                            {errors.terms && <p style={{ margin: '-10px 0 0', color: '#ef4444', fontSize: 12 }}>{errors.terms}</p>}

                            {/* General message */}
                            {errors.general && (
                                <div style={{
                                    background: errors.general.includes('already') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
                                    border: `1px solid ${errors.general.includes('already') ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
                                    borderRadius: 10,
                                    padding: '10px 14px',
                                    color: errors.general.includes('already') ? '#ef4444' : '#22c55e',
                                    fontSize: 13,
                                    fontWeight: 500,
                                }}>
                                    {errors.general}
                                </div>
                            )}

                            {/* Submit */}
                            <button
                                id="signup-submit"
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
                                    marginTop: 4,
                                }}
                                onMouseEnter={e => { if (!loading) { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = `0 12px 36px ${accent}70` } }}
                                onMouseLeave={e => { e.target.style.transform = 'translateY(0)'; e.target.style.boxShadow = `0 8px 28px ${accent}55` }}
                            >
                                {loading ? 'Creating account…' : 'Create Account →'}
                            </button>
                        </form>
                    </div>

                    {/* Right — Branding panel */}
                    <div style={{
                        flex: '1 1 42%',
                        background: `linear-gradient(150deg, ${darkMode ? '#6C4EF5' : '#5030E5'} 0%, ${darkMode ? '#1a0c56' : '#3b22c4'} 100%)`,
                        padding: '52px 44px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        position: 'relative',
                        overflow: 'hidden',
                    }}>
                        {/* BG blobs */}
                        <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: -50, left: -50 }} />
                        <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', bottom: 60, right: -30 }} />

                        {/* Header */}
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
                            }}>Free to start</div>
                            <h2 style={{
                                color: '#fff',
                                fontSize: 'clamp(24px, 2.5vw, 34px)',
                                fontWeight: 800,
                                lineHeight: 1.25,
                                margin: 0,
                                marginBottom: 16,
                            }}>
                                Manage projects<br />like a pro 🚀
                            </h2>
                            <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, lineHeight: 1.7, margin: 0 }}>
                                Join thousands of teams that use TaskFlow to ship products faster and smarter.
                            </p>
                        </div>

                        {/* Feature list */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
                            {[
                                'Kanban & Scrum boards',
                                'Real-time team collaboration',
                                'Analytics & progress tracking',
                                'Integrations with 50+ tools',
                            ].map(f => (
                                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        width: 24, height: 24, borderRadius: '50%',
                                        background: 'rgba(255,255,255,0.2)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#fff', flexShrink: 0,
                                    }}>
                                        <CheckIcon />
                                    </div>
                                    <span style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14 }}>{f}</span>
                                </div>
                            ))}
                        </div>

                        {/* Bottom testimonial */}
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            borderRadius: 14,
                            padding: '18px 20px',
                            position: 'relative',
                        }}>
                            <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 13, lineHeight: 1.6, margin: 0, marginBottom: 12 }}>
                                "TaskFlow transformed how our team collaborates — we shipped 2x faster within a month."
                            </p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '50%',
                                    background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    color: '#fff', fontWeight: 700, fontSize: 13,
                                }}>
                                    S
                                </div>
                                <div>
                                    <div style={{ color: '#fff', fontWeight: 600, fontSize: 13 }}>Sarah K.</div>
                                    <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 11 }}>CTO at Nexova</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SignUp