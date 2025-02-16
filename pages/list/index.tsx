

import DropdownWrap from "components/DropdownWrap"
import FieldEditor from "components/FieldEditor"
import SearchInput from "components/SearchInput"
import AppContext from "contexts/App.context"
import dayjs from "dayjs"
import { useRouter } from "next/router"
import { useContext, useEffect, useMemo, useRef, useState } from "react"
import { useImmer } from "use-immer"
import { api } from "utils/general"
import DateRangePicker from "widgets/DateRangePicker"
import Pagination from "widgets/Pagination"
import Selector from "widgets/Selector"
import Table from "widgets/Table"
import styles from './index.module.sass'


const Notification = () => {


    const tableRef = useRef<any>()
    const currentImageUrl = useState<any>(undefined)
    const submitDatePickerRef = useRef<any>()
    const [submitRangeDate, setSubmitRangeDate] = useState<dayjs.Dayjs[]>([])

    const [sorting, setSorting] = useState([])
    const [sortingLabel, setSortingLabel] = useState('')
    const totalPage = useState(0)
    const totalHits = useState(0)

    const router = useRouter()

    const orderDatePickerRef = useRef<any>()
    const [rangeDate, setRangeDate] = useState<dayjs.Dayjs[]>([])

    const { loading: pageLoading, s3Client, notify: { current: notify } } = useContext(AppContext)

    const [loading, setLoading] = useState<boolean>(false)
    const [selectedItems, setSelectedItems] = useState<any[]>([])
    const [items, setItems] = useState<any[]>([])
    const [textSearch, setTextSearch] = useState<string>('')
    const [filter, setFilter] = useImmer({
        status: 'all',
        page: +router.query.page || 1,
        startDate: null,
        endDate: null,
        sorting: null
    })

    const pageMap = useState<any>({})

    const meiliEnabled = useMemo(() => true || textSearch || sorting.length > 0 || filter.status !== 'all' || filter.startDate || filter.endDate, [filter, sorting, textSearch])

    const getList = async ({ status, page, channel, orderStartDate, orderEndDate, submitStartDate, submitEndDate, sorting }: any) => {
        tableRef.current?.clearCheckbox()
        setLoading(true)
        let res
        let pages = 0
        let hits = 0
        if (!meiliEnabled) {
            hits = await api(`/api/search`, { limit: 0 }).then(_ => _?.estimatedTotalHits || 0)
            pages = Math.ceil(hits / 100)
            let _res = await api(`/api/utils/redeem/list?${new URLSearchParams({
                limit: '100',
                ...(pageMap[0]?.[page] ? { start: pageMap[0]?.[page] } : {}),
            }).toString()}`)
            res = _res?.data || []
            pageMap[1](curr => ({ ...curr, [`${page + 1}`]: _res?.next }))
        } else {
            let _items = await api(`/api/search`, {
                page,
                hitsPerPage: 100,
                q: textSearch || '',
                filter: [
                    ...((status && status !== 'all') ? [`status = ${status}`] : []),
                    ...((channel) ? [`channel = \"${channel}\"`] : []),
                    ...(orderStartDate ? [`purchasedTimestamp ${orderStartDate} TO ${orderEndDate}`] : []),
                    ...(submitStartDate ? [`timestamp ${submitStartDate} TO ${submitEndDate}`] : []),
                ],
                sort: sorting ? [sorting] : []
            }, 'post')
            hits = _items?.totalHits || 0
            pages = _items?.totalPages
            res = _items?.hits || []
        }
        if (filter.page > pages) setFilter(draft => { draft.page = pages })
        totalHits[1](hits)
        totalPage[1](pages)
        setItems(res || [])
        setSelectedItems([])
        setLoading(false)
    }

    useEffect(() => {
        router.replace({ pathname: '/list', query: { page: filter.page || 1 } });
        (async () => {
            setItems([])
            let res = await getList(filter)
        })()
    }, [filter, textSearch])

    const clearFilter = () => {
        setRangeDate([])
        setSorting([])
        setSortingLabel('')
        tableRef?.current?.clearSort()
        setFilter(draft => {
            draft.status = 'all'
            draft.sorting = null
            draft.page = 1
        })
        setItems([])
    }

    const exportHandler = async () => {
        let items = []
        pageLoading[1](true)
        let res = await api(`/api/search`, {
            page: 1,
            q: textSearch || '',
            hitsPerPage: 10000,
            filter: [
                ...((filter.status && filter.status !== 'all') ? [`status = ${filter.status}`] : [])
            ],
            sort: filter.sorting ? [filter.sorting] : []
        }, 'post')
        items = res?.hits || []
        const ExcelJs = require('exceljs')
        let newWorkbook = new ExcelJs.Workbook();
        let newWorksheet = newWorkbook.addWorksheet("Sheet1");
        newWorksheet.addRow([
            'Register Date',
            'First name',
            'Last name',
            'Email',
            'Phone',
            'Status'
        ]);
        newWorksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
        await Promise.all(
            items.map(async (item, index) => {
                await newWorksheet.addRow([
                    dayjs(item.timestamp).format('DD/MM/YYYY HH:mm'),
                    item.firstName,
                    item.lastName,
                    item.email,
                    item.phoneNumber,
                    item.status
                ]);
                newWorksheet.getRow(index + 2).alignment = { vertical: 'middle', horizontal: 'center' }
                newWorksheet.columns[16].width = 20;
                newWorksheet.getRow(index + 2).alignment = { vertical: 'middle', horizontal: 'center' }
            })
        );
        await newWorkbook.xlsx.writeBuffer({ useStyles: true }).then(data => {
            let blob = new Blob([data], {
                type:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            });
            var a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = `export-${dayjs().format('DD/MM/YYYY_HH:mm:ss')}.xlsx`;
            a.click();
            a.remove()
        });
        pageLoading[1](false)
    }

    const saveHandler = async (value, id) => {
        pageLoading[1](true)
        let res = await api(`/api/utils/redeem`, {
            id,
            ...value
        }, 'patch')
        pageLoading[1](false)
        notify.push(res.resCode === '200' ? 'อัพเดทข้อมูลสำเร็จ' : 'อัพเดทข้อมูลไม่สำเร็จ', res.resCode === '200' ? 'success' : 'error')
        if (res.resCode === '200') {
            setItems(curr => curr.map(i => i.id === id ? ({ ...i, ...value }) : i))
        }
    }

    return (
        <div className={styles.container}>
            <div style={{ alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px' }}>
                <div style={{ alignItems: 'center' }}>
                    <p className={styles.title}>
                        Register List
                    </p>
                    <span style={{ paddingLeft: '10px', minWidth: 'fit-content', color: '#666666' }}>({totalHits[0] ? totalHits[0]?.toLocaleString(undefined) : '-'} รายการ)</span>
                </div>
                <button className={styles.exportButton} onClick={exportHandler}>
                    <i className="fa-solid fa-download"></i>
                    Export
                </button>
            </div>
            <div className={styles.content}>
                <div style={{ width: '100%' }}>
                    <SearchInput
                        className={styles.searchInput}
                        placeholder='Search'
                        searchFunction={async (e) => {
                            setFilter(draft => {
                                draft.page = 1
                            })
                            setTextSearch(e)
                        }}
                        defaultValue={''}
                    />
                </div>
                <div className={styles.filter}>
                    <span style={{ color: '#0C2756', fontSize: '0.8rem' }}>Register Date</span>
                    <DateRangePicker
                        ref={orderDatePickerRef}
                        rangeDate={rangeDate}
                        style={{ height: '100%', marginLeft: '5px' }}
                        onChange={value => {
                            let range = value.map(i => i.valueOf())
                            if (range.every((date, index) => date === rangeDate[index]?.valueOf())) return
                            pageMap[1]({})
                            setFilter(draft => {
                                draft.page = 1
                                draft.startDate = range[0].valueOf()
                                draft.endDate = range[1].valueOf()
                            })
                            orderDatePickerRef.current?.close()
                        }}
                        setRangeDate={setRangeDate}
                    />
                    <span style={{ color: '#0C2756', marginLeft: '20px', fontSize: '0.8rem' }}>Status</span>
                    <Selector
                        className={styles.selector}
                        defaultValue={filter.status}
                        options={[
                            { title: 'All', value: 'all' },
                            { title: 'Pending', value: 'pending' },
                            { title: 'Approved', value: 'approved' },
                            { title: 'Rejected', value: 'rejected' }
                        ]}
                        onSelect={e => {
                            pageMap[1]({})
                            setFilter(draft => {
                                draft.page = 1
                                draft.status = e
                            })
                        }}
                    />
                    {(filter.status !== 'all' || filter.startDate || filter.endDate) &&
                        <span style={{ color: '#666666', marginLeft: '20px', fontSize: '0.85rem', textDecoration: 'underline', cursor: 'pointer' }} onClick={clearFilter}>ล้างตัวกรอง</span>
                    }
                    <div style={{ flex: '1 1' }} />
                    <span style={{ color: '#888888', fontSize: '0.8rem' }}>{selectedItems.length || 0} of {items.length} selected</span>
                    <div>
                        <DropdownWrap
                            button={(
                                <button
                                    className={styles.searchButton}
                                    disabled={selectedItems.length === 0}
                                    style={{ color: '#0C2756' }}
                                >
                                    Action
                                </button>
                            )}
                            items={[
                                { value: 'APPROVED', detail: { alias: 'Approved' } },
                                { value: 'REJECTED', detail: { alias: 'Rejected' } },
                                { value: 'PENDING', detail: { alias: 'Pending' } }
                            ]}
                            itemHeight={30}
                            onClick={async (detail, value, e) => {
                                let _items = selectedItems?.map(i => ({ id: i, status: value }))
                                pageLoading[1](true)
                                let res = await api(`/api/utils/redeem/status`, _items, 'patch')
                                pageLoading[1](false)
                                notify.push(res.resCode === '200' ? 'อัพเดทสถานะสำเร็จ' : 'อัพเดทสถานะไม่สำเร็จ', res.resCode === '200' ? 'success' : 'error')
                                if (res.resCode === '200') {
                                    setItems(curr => curr.map(i => selectedItems.includes(i.id) ? ({ ...i, status: value }) : i))
                                    tableRef.current?.clearCheckbox()
                                }
                            }}
                            itemWidth={100}
                            align='end'
                        >
                            {(detail, value) => (
                                <div className={styles.actionButton}>
                                    <span>{detail.alias}</span>
                                </div>
                            )}
                        </DropdownWrap>
                    </div>
                </div>
                <div style={{ flex: '1 1', overflow: 'hidden' }}>
                    <div className={styles.tableContainer}>
                        <div style={{ overflow: 'hidden', overflowX: 'auto', flex: '1 1' }}>
                            <Table
                                className={styles.table}
                                minWidth="1000px"
                                ref={tableRef}
                                id={'table'}
                                data={[items, null]}
                                showCheckbox={true}
                                noDataLabel={loading ? 'Loading...' : items.length === 0 ? 'No data' : ''}
                                dataKey="id"
                                itemClassName={i => { return `${styles.item} ${currentImageUrl[0]?.id === i.id ? styles.selected : ''}` }}
                                onSelect={e => setSelectedItems(e.map(i => i.id))}
                                sortKeys={[
                                    'timestamp',
                                    'code',
                                    'company',
                                    'firstName',
                                    'lastName',
                                    'email',
                                    'phoneNumber',
                                    'status'
                                ]}
                                onSorting={(value) => {
                                    setSorting(value?.sortOf ? [`${value?.key}:${value?.sortOf}`] : [])
                                    setSortingLabel(value?.label || '')
                                    setItems([])
                                    pageMap[1]({})
                                    setFilter(draft => {
                                        draft.page = 1
                                        draft.sorting = value?.sortOf ? `${value?.key}:${value?.sortOf}` : null
                                    })
                                }}
                                headers={[
                                    'Register Date',
                                    'Code',
                                    'Company',
                                    'First Name',
                                    'Last Name',
                                    'Email',
                                    'Phone',
                                    'Status'
                                ]}
                                template={[
                                    { minHeight: '30px', alignItems: 'center', flex: '0 0 115px', maxWidth: '115px', justifyContent: 'start', textAlign: 'start' },
                                    { minHeight: '30px', alignItems: 'center', flex: '0 0 115px', maxWidth: '115px', justifyContent: 'start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 220px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 220px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 220px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 350px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 170px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', alignItems: 'center', flex: '1 1 100px', minWidth: '100px', maxWidth: '110px', justifyContent: 'center', textAlign: 'center' }
                                ]}
                                addButtonAlias=''
                                isDeletable={false}
                                contents={(item, index) => {
                                    return [
                                        <span>{dayjs(item.timestamp).format('DD/MM/YYYY HH:mm')}</span>,
                                        <span>{item.code}</span>,
                                        <FieldEditor
                                            id={`company.${item.id}`}
                                            name={`company.${item.id}`}
                                            defaultValue={item.company || ''}
                                            type={'text'}
                                            saveHandler={async value => { await saveHandler(value, item.id) }}
                                        />,
                                        <FieldEditor
                                            id={`firstName.${item.id}`}
                                            name={`firstName.${item.id}`}
                                            defaultValue={item.firstName || ''}
                                            type={'text'}
                                            saveHandler={async value => { await saveHandler(value, item.id) }}
                                        />,
                                        <FieldEditor
                                            id={`lastName.${item.id}`}
                                            name={`lastName.${item.id}`}
                                            defaultValue={item.lastName || ''}
                                            type={'text'}
                                            saveHandler={async value => { await saveHandler(value, item.id) }}
                                        />,
                                        <FieldEditor
                                            id={`email.${item.id}`}
                                            name={`email.${item.id}`}
                                            defaultValue={item.email || ''}
                                            type={'email'}
                                            saveHandler={async value => { await saveHandler(value, item.id) }}
                                        />,
                                        <FieldEditor
                                            id={`phoneNumber.${item.id}`}
                                            name={`phoneNumber.${item.id}`}
                                            defaultValue={item.phoneNumber || ''}
                                            type={'text'}
                                            saveHandler={async value => { await saveHandler(value, item.id) }}
                                            autoComplete="off"
                                            inputMode='numeric'
                                            onChange={e => {
                                                let _numbers = [...e.target.value]
                                                e.target.value = _numbers.filter((i, index) => !isNaN(+i)).join('')
                                            }}
                                        />,
                                        <span style={{ padding: '0px 7px', borderRadius: '20px', background: `${item.status === 'PENDING' ? '#888888' : item.status === 'REJECTED' ? '#ee6a6a' : '#4AA785'}`, color: '#ffffff', display: 'flex', alignItems: 'center', textTransform: 'capitalize' }}>
                                            <i aria-hidden className="fa-solid fa-circle" style={{ color: '#ffffff', padding: '0 5px 0 0', fontSize: '7px' }}></i>
                                            {item.status}
                                        </span>
                                    ]
                                }}
                                headerClassName={styles.header}
                            />
                        </div>
                        <div style={{ width: '100%', justifyContent: 'flex-end', padding: '10px 5px 0 0' }}>
                            <Pagination
                                className={styles.pagination}
                                page={filter.page}
                                totalPage={totalPage[0]}
                                onChange={async e => {
                                    setFilter(draft => { draft.page = e })
                                }}
                            />
                        </div>
                    </div>
                    {currentImageUrl[0] &&
                        <div className={`${styles.image}`}>
                            <i aria-hidden className="fa-solid fa-circle-xmark" onClick={e => { currentImageUrl[1](undefined) }}></i>
                            <img src={currentImageUrl[0]?.url} />
                        </div>
                    }
                </div>
            </div>
        </div >
    )
}

export default Notification
