import Field from 'components/Field'
import AppContext from 'contexts/App.context'
import { forwardRef, useCallback, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { api } from 'utils/general'
import styles from './ModalUser.module.sass'


interface Props {
    onClose?: () => void
}
const ModalUser = forwardRef(({ onClose }: Props, ref) => {
    const [state, setState] = useState(true)
    const active = useState<any>(undefined)
    const currentData = useState<any>({})
    const containerRef = useRef<HTMLDivElement>()
    const { loading: pageLoading, notify: { current: notify } } = useContext(AppContext)

    useImperativeHandle(ref, () => ({
        close,
        open: onExpand,
        getActive: () => active[0]
    }))

    const onExpand = (data) => {
        active[1](curr => curr ? undefined : {
            top: '50%',
            left: '50%'
        })
        setState(true)
        currentData[1](data)
    }

    const close = useCallback(() => {
        setState(false)
        onClose && onClose()
        setTimeout(() => {
            active[1](undefined)
        }, 100);
    }, [])

    useEffect(() => {
        if (!containerRef?.current) return
    }, [active[0]])

    const checkInHandler = async () => {
        pageLoading[1](true)
        let res = await api(`/api/utils/registrations`, {
            code: currentData[0]?.code,
            status: 'CHECKED_IN'
        }, 'patch')
        pageLoading[1](false)
        notify.push(res.resCode === '200' ? 'CheckIn สำเร็จ' : 'CheckIn ไม่สำเร็จ', res.resCode === '200' ? 'success' : 'error')
        close()
    }

    return (
        <div className={`${styles.mainContainer}`}>
            {
                active[0] ? ReactDOM.createPortal(
                    <div onMouseDown={e => { close() }} className={`${styles.overlayContainer}  ${!state ? styles.not_active : ''}`}>
                        <div
                            className={`${styles.contentContainer}  ${!state ? styles.not_active : ''}`}
                            style={{
                                top: active[0]?.top,
                                left: active[0]?.left,
                                width: active[0]?.width,
                                maxHeight: active[0]?.maxHeight
                            }}
                            onMouseDown={e => currentData[0]?.status === 'CHECKED_IN' ? null : e.stopPropagation()}
                        >
                            <div
                                className={styles.content}
                            >
                                <div className={styles.fields}>
                                    <div style={{ flex: '1 1 100%', flexWrap: 'wrap' }}>
                                        <Field
                                            type="text"
                                            title="Name"
                                            name="firstName"
                                            value={currentData[0]?.firstName}
                                            className={styles.input}
                                            disabled={true}
                                            placeholder='First Name'
                                            required
                                            onChange={e => currentData[1]({ ...currentData[0], firstName: e.target.value })}
                                        />
                                        <Field
                                            type="text"
                                            name="lastName"
                                            value={currentData[0]?.lastName}
                                            className={styles.input}
                                            disabled={true}
                                            placeholder='Last Name'
                                            required
                                            onChange={e => currentData[1]({ ...currentData[0], lastName: e.target.value })}
                                        />
                                    </div>
                                    <Field
                                        type="text"
                                        title="Company"
                                        name="company"
                                        value={currentData[0]?.company}
                                        className={styles.input}
                                        disabled={true}
                                        placeholder='Your Company'
                                        required
                                        onChange={e => currentData[1]({ ...currentData[0], company: e.target.value })}
                                    />
                                    <Field
                                        type="text"
                                        title="Phone Number"
                                        name="phoneNumber"
                                        value={currentData[0]?.phoneNumber}
                                        className={styles.input}
                                        disabled={true}
                                        placeholder='Please Type Your Phone Number'
                                        inputMode='numeric'
                                        pattern='[0-9]{10}'
                                        onChange={e => {
                                            let _numbers = [...e.target.value]
                                            e.target.value =
                                                _numbers.filter((i, index) =>
                                                    (index === 9 && i === '-') ?
                                                        true
                                                        :
                                                        (index >= 10 && !_numbers.includes('-')) ?
                                                            false
                                                            :
                                                            !isNaN(+i)
                                                ).join('')
                                            currentData[1]({ ...currentData[0], phoneNumber: e.target.value })
                                        }}
                                        maxLength={10}
                                        required
                                    />
                                    <div style={{ flexDirection: 'column', width: '100%', margin: '7px 10px' }}>
                                        <Field
                                            type="text"
                                            title="E-mail"
                                            name="email"
                                            className={styles.input}
                                            disabled={true}
                                            style={{ margin: '0 0' }}
                                            value={currentData[0]?.email}
                                            placeholder='Please Type Your E-mail'
                                            required
                                        />
                                    </div>
                                    <Field
                                        type="text"
                                        title="Seat"
                                        name="seat"
                                        value={currentData[0]?.seat || '-'}
                                        className={styles.input}
                                        placeholder='Your Seat'
                                        required={false}
                                        disabled
                                    />
                                </div>
                                {currentData[0]?.status === 'CHECKED_IN' ?
                                    <button className={`${styles.button} ${styles.highlight}`} style={{ marginLeft: '20px' }} >Checked-In</button>
                                    :
                                    <div className={styles.buttons}>
                                        <button className={`${styles.button} ${styles.highlight}`} onClick={e => { checkInHandler() }}>CHECK-IN</button>
                                        <button className={`${styles.button} ${styles.cancel}`} style={{ marginLeft: '20px' }} onClick={e => { close() }}>CANCEL</button>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                    , document.getElementById('overlay')) : null
            }
        </div >
    )
})
export default ModalUser

