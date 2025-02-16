import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import styles from './loading.module.sass'

export const LoadingPage = ({ active }: { active: boolean }) => {
    const [loaded, setLoaded] = useState(false)
    useEffect(() => setLoaded(true), [])
    return loaded && active ? ReactDOM.createPortal(
        <div className={`${styles.loading} ${styles.active}`}>
            <div className={`${styles.loader}`}></div>
        </div >
        , document?.getElementById('loading')) : null;
}

export default LoadingPage
