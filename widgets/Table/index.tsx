import { CSSProperties, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import Checkbox from 'widgets/Checkbox'
import styles from './table.module.sass'
export interface props {
    data: [any[], any]
    headers: string[]
    template: CSSProperties[]
    contents: (item, index) => JSX.Element[]
    footer?: (item, index) => JSX.Element
    children?: JSX.Element
    addButtonAlias?: string
    isDeletable?: boolean
    minWidth?: string
    className?: string
    headerClassName?: string
    itemClassName?: any
    itemsClassName?: string
    noDataLabel?: string
    id?: string
    dataKey?: string
    showCheckbox?: boolean
    isMultiChecked?: boolean
    lengthLimit?: number
    sortKeys?: string[]
    onSorting?: any
    addHandler?: () => any
    onClick?: (item, index) => void
    onSelect?: (item) => void
    addDirection?: 'top' | 'bottom'
}

const scrollHandler = (id, state: 'up' | 'down') => document.getElementById(id).scrollTo({ top: state === 'up' ? 1000000 : 0, behavior: 'auto' })


const Table = forwardRef(({ sortKeys, onSorting, showCheckbox, isMultiChecked = true, dataKey, onSelect, children, data = [[], () => { }], addHandler, className, itemsClassName, headerClassName, itemClassName, noDataLabel, headers = [], template, contents, addButtonAlias = 'เพิ่ม', minWidth, isDeletable = true, lengthLimit = 50, id = 'id--', onClick, addDirection = 'bottom', footer }: props, ref) => {
    const isScrollable = useState<boolean>(false)

    const [checkbox, setCheckbox] = useState([])
    const checkboxRef = useRef([])
    const isCheckedAll = useState<boolean>(false)
    const checkAllRef = useRef(null)

    const addItemHandler = () => {
        scrollHandler(`table-items-${id}`, addDirection === 'bottom' ? 'up' : 'down')
        let defaultAddValue = addHandler ? addHandler() : undefined
        data[1](current => addDirection === 'bottom' ? [...current, defaultAddValue || {}] : [defaultAddValue || {}, ...current])
    }

    const [sorting, setSorting] = useState<Partial<{ key: string, sortOf: 'asc' | 'desc' | string }>>()

    const sortingHandler = (sortKey, header) => {
        let value = {
            key: sortKey,
            sortOf: sorting?.key !== sortKey ? 'asc' : sorting?.sortOf === 'asc' ? 'desc' : '',
            label: `${header} (${sorting?.key !== sortKey ? 'น้อยไปมาก' : sorting?.sortOf === 'asc' ? 'มากไปน้อย' : ''})`
        }
        setSorting(value?.sortOf ? value : undefined)
        onSorting && onSorting(value?.sortOf ? value : undefined)
    }

    useImperativeHandle(ref, () => ({
        clearCheckbox: () => clearCheckbox(),
        clearSort: () => setSorting(undefined)
    }))

    const onCheckAll = (value) => {
        let _checkbox = [...checkbox]
        if (!checkboxRef.current) return
        checkboxRef.current?.filter(i => i).forEach((item, index) => {
            if (!data[0][index]) return
            if (value) {
                isCheckedAll[1](true)
                checkAllRef.current?.check(true)
                !item.value && _checkbox.push({ id: data[0][index][dataKey], index: index })
                setCheckbox(_checkbox)
            }
            else {
                checkAllRef.current?.check(false)
                isCheckedAll[1](false)
                onConsoleCancel()
                _checkbox = []
            }
            item.check(value)
        })
        onSelect && onSelect(_checkbox)
    }

    const onConsoleCancel = () => {
        const _checkbox = [...checkbox]
        _checkbox.forEach(item => checkboxRef.current[item.index].check(false))
        checkAllRef.current?.check(false)
        setCheckbox([])
        onSelect && onSelect([])
    }


    const onCheckbox = (item, index, value) => {
        const _checkbox = isMultiChecked ? [...checkbox] : []
        if (value) {
            if (!isMultiChecked) checkboxRef.current?.filter(i => i).forEach((item, idx) => idx !== index ? item.check(false) : item.check(true))
            _checkbox.push({ id: item[dataKey], index: index })
        }
        else {
            const checkbox_index = _checkbox.findIndex(item => item.index === index)
            _checkbox.splice(checkbox_index, 1)
        }
        if (showCheckbox) {
            if (_checkbox.length < data[0].length) {
                checkAllRef.current?.check(false)
                isCheckedAll[1](false)
            } else {
                checkAllRef.current?.check(true)
                isCheckedAll[1](true)
            }
        }
        onSelect && onSelect(_checkbox)
        setCheckbox(_checkbox)
    }

    const clearCheckbox = () => {
        if (showCheckbox) {
            checkAllRef.current?.check(false)
        }
        checkbox.forEach(item => checkboxRef.current[item.index] && checkboxRef.current[item.index].check(false))
        setCheckbox([])
        onSelect && onSelect([])
    }


    useEffect(() => {
        if ((checkbox || []).length === 0) {
            if (showCheckbox) {
                checkAllRef.current?.check(false)
            }
            checkbox.forEach(item => checkboxRef.current[item.index] && checkboxRef.current[item.index].check(false))
        }
    }, [checkbox])

    useEffect(() => {
        if (data[0]?.length > 0) {
            let div = document.getElementById(`table-items-${id}`)
            isScrollable[1](div?.scrollHeight > div?.clientHeight);
        }
    }, [data[0]])

    return (
        <div className={`${styles.table} ${className || ''}`} style={minWidth ? { minWidth } : {}}>
            <div style={{ flexDirection: 'column', width: '100%', flex: '1 1', overflow: 'hidden' }}>
                <div style={{ width: '100%' }}>
                    <div className={`${styles.header} ${headerClassName || ''}`} style={{ paddingRight: `${(isDeletable ? 20 : 10) + (isScrollable[0] ? 4 : 0)}px` }}>
                        {showCheckbox &&
                            <div style={{ flex: '0 0 30px', justifyContent: 'flex-start' }} className={`${styles.col} ${styles.checkbox}`} onClick={e => e.stopPropagation()}>
                                {isMultiChecked && <Checkbox ref={checkAllRef} onChange={(value) => onCheckAll(value)} />}
                            </div>
                        }
                        {headers.map((header, index) =>
                            <span key={`table-header-${header}-${index}`} className={styles.item} style={{ ...(template?.[index] || {}), alignItems: 'center', cursor: sortKeys?.[index] ? 'pointer' : 'auto', userSelect: 'none' }} onClick={() => sortKeys?.[index] && sortingHandler(sortKeys?.[index], headers?.[index])}>
                                {header}
                                {sortKeys?.[index] &&
                                    <div style={{ flexDirection: 'column', justifyContent: 'flex-start', padding: '0 0 0 5px' }}>
                                        <i aria-hidden className="fas fa-caret-up" style={{ fontSize: '12px', height: '7px', display: 'flex', alignItems: 'center', color: sorting?.key === sortKeys[index] && sorting?.sortOf === 'asc' ? '#888888' : '#dddddd' }} ></i>
                                        <i aria-hidden className="fas fa-caret-down" style={{ fontSize: '12px', height: '7px', display: 'flex', alignItems: 'center', color: sorting?.key === sortKeys[index] && sorting?.sortOf === 'desc' ? '#888888' : '#dddddd' }} ></i>
                                    </div>
                                }
                            </span>
                        )}
                    </div>
                </div>
                <div id={`table-items-${id}`} className={`${styles.items} ${itemsClassName || null}`} style={{ overflow: 'auto' }}>
                    {data[0].length > 0 ?
                        <>
                            {data[0].map((item, index) =>
                                <div key={`item-table-${index}`} className={`${styles.tableItemWrap} ${(typeof itemClassName === 'string' ? itemClassName : itemClassName(item)) || ''} ${onClick ? styles.isEnableHover : ''}`} onClick={e => onClick && onClick(item, index)} >
                                    <div className={`${styles.tableItem} `} style={{ paddingRight: isDeletable ? '20px' : '10px' }} >
                                        {showCheckbox &&
                                            <div style={{ flex: '0 0 30px', justifyContent: 'flex-start' }} className={`${styles.col} ${styles.checkbox}`} onClick={e => e.stopPropagation()}>
                                                <Checkbox ref={ref => checkboxRef.current[index] = ref} onChange={(value) => onCheckbox(item, index, value)} />
                                            </div>
                                        }
                                        {template.map((temp, tempIndex) =>
                                            <div key={`table-template-${tempIndex}`} className={styles.item} style={temp || {}}>
                                                {contents(item, index)?.[tempIndex] || ''}
                                            </div>
                                        )}
                                    </div>
                                    {footer &&
                                        <div className={`${styles.tablefooter}`} >
                                            {footer(item, index)}
                                        </div>
                                    }
                                </div>
                            )}
                        </>
                        :
                        <div className={`${styles.row} ${itemClassName || ''}`} style={{ backgroundColor: '#ffffff', padding: '5px 0', justifyContent: 'center', alignItems: 'center', color: '#777', border: 'none', fontSize: '0.9rem' }}>{noDataLabel || 'No Data'}</div>
                    }
                </div>
            </div>
            {addButtonAlias && <span className={`${styles.addButton} ${data[0].length >= lengthLimit ? styles.disabled : ''}`} onClick={() => data[0].length < lengthLimit && addItemHandler()}>{addButtonAlias}</span>}
            {
                children && <div style={{ width: '100%' }}>
                    {children}
                </div>
            }
        </div >
    )
})
export default Table
