import Modal from 'components/Modal'
import AppContext from 'contexts/App.context'
import QrScanner from 'qr-scanner'
import { useContext, useEffect, useState } from 'react'
import styles from './ModalQRScanner.module.sass'

const ModalQRScanner = ({ show, searchHandler }) => {
    const { notify: { current: notify }, loading: loading } = useContext(AppContext)
    const scanner = useState<any>(undefined)
    const startLoading = useState<boolean>(false)
    const currentCode = useState<string>('')

    useEffect(() => {
        (async () => {
            if (!show[0]) {
                if (scanner[0]) {
                    currentCode[1]('')
                    scanner[0]?.stop();
                    scanner[0]?.destroy();
                }
                scanner[1](undefined)
                return
            }
            if (await QrScanner.hasCamera()) {
                scanner[1](new QrScanner(
                    document.getElementById('qr-scanner-video-tag') as HTMLVideoElement,
                    result => {
                        currentCode[1](result.data)
                    },
                    {
                        onDecodeError: error => {
                            currentCode[1]('')
                            return ''
                        },
                        calculateScanRegion: (elem) => {
                            let b = 300
                            return { x: Math.round((elem.videoWidth - b) / 2), y: Math.round((elem.videoHeight - b) / 2), width: b, height: b }
                        },
                        highlightScanRegion: true,
                        highlightCodeOutline: true,
                    }
                ))
            } else {
                currentCode[1]('')
                notify.push('ตรวจไม่พบกล้อง', 'error')
                show[1](undefined)
            }
        })()
        // QrScanner.listCameras(true);
    }, [show[0]])

    useEffect(() => {
        if (currentCode[0]) searchHandler(currentCode[0])
    }, [currentCode[0]])

    useEffect(() => {
        (async () => {
            loading[1](true)
            startLoading[1](true)
            if (scanner[0]) await scanner[0].start()
            loading[1](false)
            startLoading[1](false)
        })()
        return () => currentCode[1]('')
    }, [scanner[0]])

    return (
        <>
            <Modal showState={show} hideCloseModalButton={true} className={styles.modal} slideIn={true}>
                <div className={styles.container}>
                    <div className='video-container' style={{ opacity: startLoading[0] ? '0' : '1' }}>
                        <video id='qr-scanner-video-tag' controls={false} autoPlay={false} webkit-playsinline playsInline></video>
                    </div>
                </div>
            </Modal>
        </>
    )
}
export default ModalQRScanner