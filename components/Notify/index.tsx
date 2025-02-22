import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import styles from './Notify.module.sass'
const timeout = ms => new Promise(res => setTimeout(res, ms))


export const Notify = forwardRef(({ initialLoading }: any, ref: any) => {
    const isActive = useRef(false)
    const timeoutRef = useRef<NodeJS.Timeout>()
    const [label, setLabel] = useState('')
    const [desc, setDesc] = useState('')
    const [style, setStyle] = useState('error')
    const notifyRef = useRef<HTMLDivElement>()
    useImperativeHandle(ref, () => ({
        push: (label, style = 'success', desc = '') => {
            if (isActive.current) {
                clearTimeout(timeoutRef.current)
                notifyRef.current.style.transform = 'translateX(200%)'
                setTimeout(() => {
                    isActive.current = false
                    ref.current.push(label, style, desc)
                }, 400);
                return
            }
            setLabel(label)
            setStyle(style)
            setDesc(desc)
            isActive.current = true
            notifyRef.current.style.transform = 'translateX(0)'
            timeoutRef.current = setTimeout(() => {
                if (!notifyRef.current) return
                notifyRef.current.style.transform = 'translateX(200%)'
                isActive.current = false
            }, desc ? 7000 : 4000);
        }
    }))
    return !initialLoading ? ReactDOM.createPortal(
        <div ref={notifyRef} className={`${styles.notify} ${styles[style]}`}>
            <div style={{ alignItems: 'center', justifyContent: 'center' }}>
                <i aria-hidden className={`fas fa-${style === 'error' ? 'exclamation-circle' : 'check-circle'}`}></i>
                <span>{label}</span>
            </div>
            {desc &&
                <div>
                    <i aria-hidden className={`fas fa-${style === 'error' ? 'exclamation-circle' : 'check-circle'}`} style={{ visibility: 'hidden' }}></i>
                    <span>
                        {desc}
                    </span>
                </div>
            }
        </div>
        , document.getElementById('overlay')) : null
})