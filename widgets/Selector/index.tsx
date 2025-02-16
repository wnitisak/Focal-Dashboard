import styles from './Selector.module.sass';

import { CSSProperties, useEffect, useMemo, useState } from 'react';

export interface props {
    options: { title: string, value: string }[];
    onSelect: (option: string) => void;
    defaultValue?: string;
    className?: string;
    style?: CSSProperties;
}


const Selector = ({ className, style, options, onSelect, defaultValue }: props) => {

    const [current, setCurrent] = useState(defaultValue)

    useEffect(() => {
        if (!defaultValue) return;
        setCurrent(defaultValue)
    }, [defaultValue])

    const currentIndex = useMemo(() => current ? options.findIndex(o => o.value === current) : -3, [current])


    return (
        <div className={`${styles.container} ${className || ''}`} style={style || {}}>
            {options.map((option, index) => (
                <div
                    key={index}
                    className={`${styles.option} ${current === option.value ? styles.selected : ''} ${currentIndex - 1 === index ? styles.before : ''} ${currentIndex + 1 === index ? styles.after : ''}`}
                    onClick={() => {
                        if (current === option.value) return;
                        setCurrent(option.value);
                        onSelect(option.value);
                    }}
                >
                    {option.title}
                </div>
            ))}
        </div>
    );
};

export default Selector;
