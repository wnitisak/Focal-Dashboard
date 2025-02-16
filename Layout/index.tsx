import { Protect, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { useRouter } from 'next/router'
import { useState } from 'react'
import styles from './layout.module.sass'

export const Layout = ({ children }) => {
    const router = useRouter()
    const navBar = useState<boolean>(false)
    return (
        <div className={`${styles.layout}`}>
            <div className={styles.header}>
                <SignedIn>
                    <UserButton />
                </SignedIn>
            </div>
            {router.asPath !== '/selection' ? <>
                <SignedIn>
                    <Protect
                        permission="org:dashboard:allow"
                        fallback={
                            <div
                                style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}
                            >
                                You are not allowed to see this section.
                            </div>
                        }
                    >
                        <div
                            className={styles.container}
                            onClick={e => {
                                if (navBar[0]) navBar[1](false)
                            }}
                        >
                            <i aria-hidden className={`fa-solid fa-bars ${styles.navButton}`} onClick={e => { navBar[1](true) }}></i>
                            <ul className={`${styles.navBars} ${navBar[0] ? styles.show : styles.hide}`}>
                                <img src="/logo.jpg" />
                                <li className={router.asPath.includes('/dashboard') ? styles.active : ''}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        router.push('/dashboard')
                                        if (navBar[0]) navBar[1](false)
                                    }}>
                                    <i aria-hidden className="fa-solid fa-chart-line"></i>
                                    Dashboard
                                </li>
                                <li className={router.asPath.includes('/list') ? styles.active : ''}
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        router.push('/list')
                                        if (navBar[0]) navBar[1](false)
                                    }}>
                                    <i aria-hidden className="fa-solid fa-list"></i>
                                    Submission List
                                </li>
                            </ul>
                            <div className={styles.component}>
                                {children}
                            </div>
                        </div>
                    </Protect>
                </SignedIn>
                <SignedOut>
                    <div className={styles.component}>
                        {children}
                    </div>
                </SignedOut>
            </>
                :
                <div className={styles.component}>
                    {children}
                </div>
            }
        </div>
    )
}
