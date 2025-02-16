import { GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import AppContext from 'contexts/App.context'
import { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import styles from './ModalPreview.module.sass'


interface Props {
}

const ModalPreview = forwardRef(({ }: Props, ref) => {
    const [state, setState] = useState(true)
    const active = useState<any>(undefined)
    const containerRef = useRef<HTMLDivElement>()
    const { s3Client, loading } = useContext(AppContext)
    const imgUrl = useState<string>(undefined)

    useImperativeHandle(ref, () => ({
        close,
        open: onExpand
    }))
    const onExpand = async (url) => {
        loading[1](true)
        const command = new GetObjectCommand({
            Bucket: 'go-hair-submission',
            Key: url
        })
        const res = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        imgUrl[1](res)
        loading[1](false)
        active[1](curr => curr ? undefined : {
            top: '50%',
            left: '50%'
        })
        setState(true)
    }

    const close = useCallback(() => {
        setState(false)
        setTimeout(() => {
            imgUrl[1](undefined)
            active[1](undefined)
        }, 300);
    }, [])

    useEffect(() => {
        if (!containerRef?.current) return
    }, [active[0]])

    return (
        <div className={`${styles.mainContainer}`}>
            {
                active[0] ? ReactDOM.createPortal(
                    <div onMouseDown={e => { close() }} className={`${styles.overlayContainer}  ${!state ? styles.not_active : ''}`}>
                        <div
                            className={`${styles.contentContainer}  ${!state ? styles.not_active : ''}`}
                            style={{
                                top: active[0]?.top,
                                left: active[0]?.left
                            }}
                        >
                            <div
                                className={styles.content}
                                ref={containerRef}
                            >
                                {imgUrl[0] && <img src={imgUrl[0]} />}
                            </div>
                        </div>
                    </div>
                    , document.getElementById('overlay')) : null
            }
        </div >
    )
})
export default ModalPreview

