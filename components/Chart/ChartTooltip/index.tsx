
import { useEffect } from 'react';
import styles from './ChartTooltip.module.sass';

const CustomizeTooltip = ({ active, payload, label, dataFormat = (value, key) => value, color, onActive = (payload: any) => { } }) => {

    useEffect(() => {
        onActive(payload)
    }, [active, payload])

    if (active && payload && payload.length) {
        return (
            <div className={styles.tooltipContainer}>
                {label && <span className={styles.date}>{label}</span>}
                {Object.keys(color).map(key =>
                    <div key={`tooltip-item-${key}`} className={styles.item}>
                        <i aria-hidden className="fa-solid fa-circle" style={{ color: color?.[key] || '#444444', fontSize: '12px', display: 'flex', alignItems: 'center' }}></i>
                        <span className={styles.value}>{dataFormat(payload.find(i => i.dataKey === key)?.value || 0, key)?.[key] || ''}</span>
                    </div>
                )}
            </div>
        );
    }

    return null;
}
export default CustomizeTooltip
