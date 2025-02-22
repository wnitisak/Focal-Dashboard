import dayjs from 'dayjs'
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { formatDate } from 'utils/formatData'
import DateRange from './DateRange'
import styles from './index.module.sass'

const DateRangeWrapper = forwardRef(({ active, setActive, onDateChange, rangeDate, showSelector }: any, ref) => {
    return (active ? ReactDOM.createPortal(
        <div onMouseDown={e => setActive(undefined)} className={styles.pickerContainer}>
            <div ref={ref as any} style={{ top: active?.top, left: active?.left }} onMouseDown={e => e.stopPropagation()} className={styles.picker}>
                <DateRange onChange={onDateChange} defaultValue={rangeDate} showSelector={showSelector} />
            </div>
        </div>,
        document.getElementById('overlay')) : null)
})

const DateRangePicker = forwardRef(({ style, onChange, setFocus, focus, rangeDate, setRangeDate, showSelector = false, hideInput = false }: any, ref) => {
    const inputRef = useRef<HTMLDivElement>(null)
    const [active, setActive] = useState(undefined)
    useImperativeHandle(ref, () => ({
        close: () => {
            setActive(undefined)
        },
        open: (ref) => {
            var rect = ref.getBoundingClientRect();
            let width = 570
            setActive(active ? undefined : {
                top: `${rect.bottom + 320 > window.innerHeight ? window.innerHeight - 320 : rect.bottom}px`,
                left: `${rect.left + width > window.innerWidth ? (window.innerWidth < width ? 5 : window.innerWidth - width) : rect.left}px`,
            })
        }
    }))

    const onDateChange = (date: dayjs.Dayjs[]) => {
        if (!date?.length) return
        if (onChange) {
            onChange(date)
            setRangeDate(date)
        }
    }

    const onMouseDownHandler = (e) => {
        var rect = inputRef.current.getBoundingClientRect();
        let width = (window.innerWidth > (showSelector ? 650 : 540) ? 646 : 371) - (showSelector ? 0 : 111)
        setActive(active ? undefined : {
            top: `${rect.bottom + 320 > window.innerHeight ? window.innerHeight - 320 : rect.bottom}px`,
            left: `${rect.left + width > window.innerWidth ? (window.innerWidth < width ? 5 : window.innerWidth - width) : rect.left}px`,
        })
    }

    return (
        <>
            {!hideInput &&
                <div style={style ? style : {}} ref={inputRef} onMouseDown={onMouseDownHandler} className={styles.date_picker}>
                    <div className={styles.info}>
                        <div style={{ flex: '1 1', justifyContent: 'center', alignItems: 'center' }}><i aria-hidden className="far fa-calendar" /> <span style={{ flex: '1 1', color: !rangeDate[0] && '#010101', minWidth: 'fit-content', fontSize: '0.85rem' }}>{rangeDate[0] ? formatDate(rangeDate[0]) : 'Select'}</span></div>
                        <div className={styles.line} />
                        <div style={{ flex: '1 1', justifyContent: 'center', alignItems: 'center' }}><i aria-hidden className="far fa-calendar" /><span style={{ flex: '1 1', color: !rangeDate[1] && '#010101', minWidth: 'fit-content', fontSize: '0.85rem' }}>{rangeDate[1] ? formatDate(rangeDate[1]) : 'Select'}</span></div>
                    </div>
                </div>
            }
            <DateRangeWrapper active={active} setActive={setActive} onDateChange={onDateChange} rangeDate={rangeDate} showSelector={showSelector} />
        </>
    )
})

export default DateRangePicker