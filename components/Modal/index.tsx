import ReactDOM from 'react-dom'

import styles from './modal.module.sass'

interface Props {
    showState: any
    children?: any
    closeHandler?: any
    hideCloseModalButton?: boolean
    className?: string
    slideIn?: boolean
    disabledOverlayCloseModal?: boolean
}

const Modal = ({ closeHandler, showState, children = <></>, hideCloseModalButton = false, className, slideIn, disabledOverlayCloseModal = false }: Props) => {

    const closeModal = () => {
        closeHandler && closeHandler()
        showState[1](undefined)
    }
    // const active = useState<boolean>(false)

    // useEffect(() => {
    //     if (showState[0]) active[1](true)
    //     else {
    //         setTimeout(() => active[1](false), 300)
    //     }
    // }, [showState[0]])

    // return active[0] ? ReactDOM.createPortal(
    //     <>
    //         <div className={`${styles.bg}  ${showState[0] ? '_show' : '_hidden'}`} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }} />
    //         <div className={`${styles.contentWrap} printReport`}>
    //             <div className={`${styles.content} ${showState[0] ? styles.show : styles.hidden} ${slideIn ? styles.slide : ''} ${className ?? ''} printReport`}>
    //                 {!hideCloseModalButton && <i aria-hidden className={`fas fa-times ${styles.closeButton}`} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }} />}
    //                 {active[0] && children}
    //             </div>
    //         </div>
    //     </>
    //     , document.getElementById('overlay')) : null
    return showState[0] ? ReactDOM.createPortal(
        <>
            <div className={`${styles.bg}  ${showState[0] ? '_show' : '_hidden'}`} onClick={(e) => { if (e.target === e.currentTarget && !disabledOverlayCloseModal) closeModal() }} />
            <div className={`${styles.contentWrap} printReport`}>
                <div className={`${styles.content} ${showState[0] ? styles.show : styles.hidden} ${slideIn ? styles.slide : ''} ${className ?? ''} printReport`}>
                    {!hideCloseModalButton && <i aria-hidden className={`fas fa-times ${styles.closeButton}`} onClick={(e) => { if (e.target === e.currentTarget) closeModal() }} />}
                    {showState[0] && children}
                </div>
            </div>
        </>
        , document.getElementById('overlay')) : null
}

export default Modal