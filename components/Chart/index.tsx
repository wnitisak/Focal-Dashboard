import DropdownWrap from 'components/DropdownWrap';
import dayjs from 'dayjs';
import { useRef, useState } from 'react';
import { ResponsiveContainer } from 'recharts';
import DateRangePicker from 'widgets/DateRangePicker';
import styles from './Chart.module.sass';

const Chart = ({ loading = false, children, title = null, hideHeader = false, defaultRangeDate = null, headerStyle = {}, style = {}, defaultTimeframe = '', timeframes = [], onTimeframeChange = (value, range) => { } }) => {

    const [timeframe, setTimeframe] = useState(defaultTimeframe || timeframes[0]?.value)
    const dropdownRef = useRef()
    const containerRef = useRef()
    const datePickerRef = useRef(null)
    const [rangeDate, setRangeDate] = useState<dayjs.Dayjs[]>(defaultRangeDate || [])

    return (
        <div className={styles.container} style={style} ref={containerRef}>
            {!hideHeader &&
                <div className={styles.header} style={headerStyle}>
                    <DateRangePicker
                        ref={datePickerRef}
                        hideInput={true}
                        rangeDate={rangeDate}
                        onChange={value => {
                            let range = value.map(i => i.valueOf())
                            if (range.every((date, index) => date === rangeDate[index]?.valueOf())) return
                            onTimeframeChange(`custom`, range)
                            datePickerRef.current?.close()
                        }}
                        setRangeDate={setRangeDate}
                    />
                    {title && <p>{title}</p>}
                    <div>
                        {timeframes?.length > 0 &&
                            <div style={{ alignItems: 'center' }}>
                                {(timeframe === 'custom' && rangeDate?.length > 0) &&
                                    <span style={{ fontSize: '1rem', paddingRight: '5px', color: '#0C2756' }}>
                                        {`${dayjs(rangeDate[0]).format('DD/MM/YYYY')} - ${dayjs(rangeDate[1]).format('DD/MM/YYYY')}`}
                                    </span>
                                }
                                <DropdownWrap
                                    button={(
                                        <div className={styles.timeframeSelect} ref={dropdownRef}>
                                            <span>{timeframes.find(i => i.value === timeframe)?.alias || ''}</span>
                                            <i aria-hidden className="fa-solid fa-sort-down"></i>
                                        </div>
                                    )}
                                    items={timeframes.map(i => ({ value: i.value, detail: { alias: i.alias } }))}
                                    itemHeight={30}
                                    onClick={(detail, value, e) => {
                                        setTimeframe(value)
                                        if (value !== 'custom') {
                                            onTimeframeChange(value, [])
                                            setRangeDate([])
                                        } else {
                                            datePickerRef.current?.open(dropdownRef.current)
                                        }
                                    }}
                                    itemWidth={120}
                                    align='end'
                                >
                                    {(detail, value) => (
                                        <div
                                            className={`${styles.timeframeItem} ${timeframe === value ? styles.isActive : ''}`}
                                        >
                                            <span>{detail.alias}</span>
                                        </div>
                                    )}
                                </DropdownWrap>
                            </div>
                        }
                    </div>
                </div>
            }
            <div className={styles.content}>
                {loading &&
                    <div className={styles.loaderContainer}>
                        <div className={styles.loader}></div>
                    </div>
                }
                <ResponsiveContainer width="100%" height="100%">
                    {children}
                </ResponsiveContainer>
            </div>
        </div >
    );
}

export default Chart