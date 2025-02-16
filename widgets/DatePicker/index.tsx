import dayjs from "dayjs"
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import DateRangePicker from "widgets/DateRangePicker"
import styles from './DatePicker.module.sass'

type props = {
    defaultValue?: dayjs.Dayjs[]
    onChange?: (value: number[]) => void
    onClear?: () => void
    showSelector?: boolean
    height?: string
    className?: string
    hideInput?: boolean
}

const DatePicker = forwardRef(({ height, defaultValue, onChange, onClear, showSelector, className, hideInput }: props, ref) => {
    const [rangeDate, setRangeDate] = useState<dayjs.Dayjs[]>(defaultValue || [])
    const dateRef = useRef<any>()
    useImperativeHandle(ref, () => ({
        clear: () => {
            setRangeDate([])
            onChange([])
            onClear && onClear()
        }
    }))
    useEffect(() => dateRef.current.close(), [rangeDate])
    return (
        <div className={`${styles.container} ${className || ''}`} >
            <DateRangePicker hideInput={hideInput} style={{ height: height ?? '35px', width: '100%' }} ref={dateRef} rangeDate={rangeDate} setRangeDate={setRangeDate} onChange={data => onChange(data.map(i => i.valueOf()))} setFocus={null} focus={null} showSelector={showSelector} />
        </div>
    )
})

export default DatePicker