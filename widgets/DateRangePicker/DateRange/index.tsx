import dayjs from 'dayjs'
import 'dayjs/locale/th'
import isBetween from 'dayjs/plugin/isBetween'
import { Dispatch, FC, SetStateAction, useCallback, useEffect, useMemo, useState } from 'react'
import { formatMonth } from 'utils/formatData'
import styles from './index.module.sass'
dayjs.extend(isBetween)
interface CalendarProps {
    position: string
    className?: string
    date: dayjs.Dayjs
    onArrow: (number) => void
    current: dayjs.Dayjs[]
    onSelect: (date: dayjs.Dayjs) => void
    tempDate: dayjs.Dayjs
    setTempDate: Dispatch<SetStateAction<dayjs.Dayjs>>

}
const Calendar: FC<CalendarProps> = ({ className, position, date, onArrow, onSelect, current, tempDate, setTempDate }) => {
    const datePadding = useMemo(() => dayjs(date).date(1).day(), [date])
    const dayInMonth = useMemo(() => dayjs(date).daysInMonth(), [date])
    const dayInPrevMonth = useMemo(() => dayjs(date).subtract(1, 'month').daysInMonth(), [date])
    const isCurrentDay = useCallback((index: number) => dayjs().isSame(date.date(index + 1), 'day'), [date])
    const isStart = useCallback((index: number) => dayjs(current[0]).isSame(date.date(index + 1), 'day') && !dayjs(current[1]).isSame(dayjs(current[0])), [current, date])
    const isEnd = useCallback((index: number) => dayjs(current[1]).isSame(date.date(index + 1), 'day') && !dayjs(current[1]).isSame(dayjs(current[0])), [current, date])
    const isStartOrEnd = useCallback((index: number) => {
        if (!current.length) return
        return dayjs(current[0]).isSame(date.date(index + 1), 'day') || dayjs(current[1]).isSame(date.date(index + 1), 'day') || dayjs(tempDate).isSame(date.date(index + 1), 'day')
    }, [current, date, tempDate])

    const isBetween = useCallback((index: number) => {
        if (tempDate) return date.date(index + 1).isBetween(dayjs(current[0]), tempDate)
        else return date.date(index + 1).isBetween(dayjs(current[0]), dayjs(current[1]))
    }, [current, date, tempDate])

    return (
        <div className={`${styles.calendar} ${className || ''}`}>
            <div className={styles.month}>
                <i aria-hidden onClick={() => onArrow(-1)} className={`fas fa-chevron-left ${styles.arrow} ${position === 'right' && styles.show}`}></i>
                <span >{formatMonth(date.valueOf())}</span>
                <i aria-hidden onClick={() => onArrow(1)} className={`fas fa-chevron-right ${styles.arrow} ${position === 'left' && styles.show}`}></i>
            </div>
            <div className={styles.days}>
                <span>Su</span><span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span>
            </div>
            <div className={styles.numbers}>
                {[...Array(datePadding)].map((_, index) =>
                    <div key={index} className={`${styles.number} ${styles.padding}`}></div>
                )}
                {[...Array(dayInMonth)].map((_, index) => (
                    <div
                        onClick={() => onSelect(dayjs(date).date(index + 1))} key={index}
                        onMouseOver={() => !current.every(item => item) && setTempDate(date.date(index + 1))}
                        className={
                            `${styles.number} ` +
                            `${isStartOrEnd(index) ? current.every(item => item) ? styles.active : styles.active_pre : ''} ` +
                            `${dayjs(tempDate).isSame(date.date(index + 1), 'day') ? (date.date(index + 1).isAfter(current[0]) ? styles.end : styles.start) : ''} ` +
                            `${(isBetween(index) && !isEnd(index)) ? styles.fade : ''} ` +
                            `${(isEnd(index) && !isStart(index)) ? styles.end : ''} ` +
                            `${(isStart(index) && !isEnd(index)) ? date.date(index + 1).isAfter(tempDate) ? styles.end : styles.start : ''} ` +
                            `${isCurrentDay(index) ? styles.isDay : ''} `
                        }>
                        <span>{index + 1}</span></div>
                ))}
            </div>
        </div>
    )
}
const DateRange = ({ onChange, defaultValue = [], border = true, showSelector = true }) => {
    const [rageDate, setRageDate] = useState<dayjs.Dayjs[]>([])
    const [currentMonth, setCurrentMonth] = useState<dayjs.Dayjs>(dayjs(defaultValue[0]) || dayjs())
    const [currentRageDate, setCurrentRangeDate] = useState<dayjs.Dayjs[]>(defaultValue)
    const [tempDate, setTempDate] = useState<dayjs.Dayjs>(null)
    const [selector, setSelector] = useState<string>(undefined)

    const setDate = (value: number) => {
        const num = Math.abs(value)
        setCurrentMonth(value > 0 ? currentMonth.add(num, 'month') : currentMonth.subtract(num, 'month'))
    }
    const onDateSelect = (date: dayjs.Dayjs) => {
        if (currentRageDate.every(item => item)) setCurrentRangeDate([date, null])
        else {
            let dateRange = [currentRageDate[0], date].sort((a, b) => a?.valueOf() - b?.valueOf())
            setCurrentRangeDate([dateRange[0].startOf('day'), dateRange[1].endOf('day')])
            setTempDate(null)
        }
    }

    useEffect(() => {
        if (currentRageDate.every(item => item)) {
            setRageDate(currentRageDate)
            if (onChange) onChange(currentRageDate)
        }
    }, [currentRageDate])

    useEffect(() => {
        if (!selector) return
        let value = selector.split('-')[0]
        let unit = selector.split('-')[1]
        value = value.replaceAll('+', '')
        let startDate = selector.split('-')[0]?.[0] === '+' ? dayjs().add(Number(value), unit as any).startOf(unit as any) : dayjs().subtract(Number(value), unit as any).startOf(unit as any)
        let endDate = selector.split('-')[0]?.[0] === '+' ? dayjs().add(Number(value), unit as any).endOf(unit as any) : dayjs().subtract(Number(['7', '14', '30'].includes(value) ? 0 : value), unit as any).endOf(unit as any)
        setCurrentRangeDate([startDate, endDate])
    }, [selector])

    return (
        <div className={styles.container}>
            <div className={`${styles.date_picker} ${border ? '' : styles.borderless} ${showSelector ? '' : styles.hiddenSelector}`}>
                <Calendar className={styles.calendarLeft} tempDate={tempDate} setTempDate={setTempDate} onSelect={onDateSelect} current={currentRageDate} date={currentMonth} onArrow={(number) => setDate(number)} position='right' />
                <Calendar className={styles.calendarRight} tempDate={tempDate} setTempDate={setTempDate} onSelect={onDateSelect} current={currentRageDate} date={currentMonth.add(1, 'month')} onArrow={(number) => setDate(number)} position='left' />
                {/* {showSelector && <div className={styles.dateRangeSelector}>
                    <span className={`${styles.button} ${selector === '0-day' ? styles.active : ''}`} onClick={() => setSelector('0-day')}>วันนี้</span>
                    <span className={`${styles.button} ${selector === '1-day' ? styles.active : ''}`} onClick={() => setSelector('1-day')}>เมื่อวานนี้</span>
                    <span className={`${styles.button} ${selector === '7-day' ? styles.active : ''}`} onClick={() => setSelector('7-day')}>7 วันที่ผ่านมา</span>
                    <span className={`${styles.button} ${selector === '14-day' ? styles.active : ''}`} onClick={() => setSelector('14-day')}>14 วันที่ผ่านมา</span>
                    <span className={`${styles.button} ${selector === '30-day' ? styles.active : ''}`} onClick={() => setSelector('30-day')}>30 วันที่ผ่านมา</span>
                    <span className={`${styles.button} ${selector === '0-week' ? styles.active : ''}`} onClick={() => setSelector('0-week')}>สัปดาห์นี้</span>
                    <span className={`${styles.button} ${selector === '1-week' ? styles.active : ''}`} onClick={() => setSelector('1-week')}>สัปดาห์นี้ที่แล้ว</span>
                    <span className={`${styles.button} ${selector === '0-month' ? styles.active : ''}`} onClick={() => setSelector('0-month')}>เดือนนี้</span>
                    <span className={`${styles.button} ${selector === '1-month' ? styles.active : ''}`} onClick={() => setSelector('1-month')}>เดือนที่แล้ว</span>
                    <span className={`${styles.button} ${selector === '+1-month' ? styles.active : ''}`} onClick={() => setSelector('+1-month')}>เดือนหน้า</span>
                    <span className={`${styles.button} ${selector === '0-year' ? styles.active : ''}`} onClick={() => setSelector('0-year')}>ปีนี้</span>
                    <span className={`${styles.button} ${selector === '1-year' ? styles.active : ''}`} onClick={() => setSelector('1-year')}>ปีที่แล้ว</span>
                </div>
                } */}
            </div >
        </div >
    )
}

export default DateRange
