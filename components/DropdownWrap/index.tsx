import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import styles from './DropdownWrap.module.sass'


interface Props {
    button: JSX.Element
    items: { detail: any, value: string }[]
    itemHeight: number
    itemWidth: number
    disabled?: boolean
    isAlignEnd?: boolean
    align?: 'start' | 'end' | 'center'
    children: (detail: any, value: string) => JSX.Element
    onClick?: (detail: any, value: string, e) => any
}

const DropdownWrap = forwardRef(({ disabled, items, itemHeight, itemWidth, button, children, onClick, isAlignEnd, align = 'start' }: Props, ref) => {
    const active = useState<any>(undefined)
    const containerRef = useRef<HTMLDivElement>()

    useImperativeHandle(ref, () => ({
        close: () => active[1](undefined)
    }))

    const onExpand = () => {
        var rect = containerRef.current.getBoundingClientRect();
        var itemsHeight = Math.min(items.length * itemHeight + 10, 300)
        const width = itemWidth
        active[1](active[0] ? undefined : {
            top: `${(rect.top + rect.height + 5) + itemsHeight > window.innerHeight ? window.innerHeight - itemsHeight : rect.top + rect.height + 5}px`,
            left: (align === 'end' || isAlignEnd) ?
                `${rect.left - width + rect.width}px`
                :
                align === 'start' ?
                    `${rect.left + width > window.innerWidth ? window.innerWidth - width - 5 : rect.left}px`
                    :
                    `${(rect.left + (rect.width / 2) - (width / 2))}px`
            ,
            ...(width ? { width: `${width}px` } : {}),
            maxHeight: `${itemsHeight}px`
        })
    }

    return (
        <div style={{ position: 'relative', flex: '1 1' }}>
            <div className={`${styles.buttonContainer} ${disabled ? styles.disabled : ''}`} onClick={e => { if (!disabled) onExpand() }}>
                {button}
            </div>
            <div ref={containerRef} className={styles.mainContainer}>
                {
                    active[0] ? ReactDOM.createPortal(
                        <div onMouseDown={e => { active[1](undefined) }} className={styles.overlayContainer}>
                            <div className={styles.itemContainer} style={{ top: active[0]?.top, left: active[0]?.left, width: active[0]?.width, maxHeight: active[0]?.maxHeight }} onMouseDown={e => e.stopPropagation()} >
                                {items.map((item, index) =>
                                    <div
                                        key={`${item.value}-${index}`}
                                        onClick={async (e) => {
                                            let ignore = onClick && await onClick(item.detail, item.value, e)
                                            !ignore && active[1](undefined)
                                        }}
                                    >
                                        {children(item.detail, item.value)}
                                    </div>
                                )}
                            </div>
                        </div>
                        , document.getElementById('overlay')) : null
                }
            </div>
        </div>
    )
})
export default DropdownWrap

