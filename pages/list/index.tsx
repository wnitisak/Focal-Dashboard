

import DropdownWrap from "components/DropdownWrap"
import FieldEditor from "components/FieldEditor"
import ModalQRScanner from "components/ModalQRScanner"
import ModalUser from "components/ModalUser"
import SearchInput from "components/SearchInput"
import AppContext from "contexts/App.context"
import dayjs from "dayjs"
import { useRouter } from "next/router"
import { useContext, useEffect, useRef, useState } from "react"
import { useImmer } from "use-immer"
import { api } from "utils/general"
import DateRangePicker from "widgets/DateRangePicker"
import Pagination from "widgets/Pagination"
import Selector from "widgets/Selector"
import Table from "widgets/Table"
import styles from './index.module.sass'


const Notification = () => {


    const tableRef = useRef<any>()
    const modalScanner = useState<any>(undefined)

    const [sorting, setSorting] = useState([])
    const totalPage = useState(0)
    const totalHits = useState(0)
    const totalItems = useState([])
    const router = useRouter()

    const orderDatePickerRef = useRef<any>()
    const [rangeDate, setRangeDate] = useState<dayjs.Dayjs[]>([])

    const { loading: pageLoading, notify: { current: notify } } = useContext(AppContext)

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

    useEffect(() => {
        router.replace({ pathname: '/list', query: { page: filter.page || 1 } });
        (async () => {
            setItems([])
            setLoading(true)
            let itemPerPage = 20
            let _res = await api(`/api/utils/registrations`)
            totalItems[1](_res?.data || [])
            let _items = _res?.data || []
            _items = _items.filter(i => filter.status === 'all' || i.status === filter.status.toUpperCase())
            _items = _items.filter(i => !filter.startDate || (i.timestamp >= filter.startDate && i.timestamp <= filter.endDate))
            _items = _items.filter(i => !textSearch || Object.values(i).some(v => v?.toString().toLowerCase().includes(textSearch.toLowerCase())))
            _items = _items.sort((a, b) => {
                let sorting = filter?.sorting || 'timestamp:desc'
                let [key, order] = sorting.split(':')
                if (a[key] < b[key]) return order === 'asc' ? -1 : 1
                if (a[key] > b[key]) return order === 'asc' ? 1 : -1
                return 0
            })
            setLoading(false)
            setItems(_items.slice((filter.page - 1) * itemPerPage, filter.page * itemPerPage))
            totalHits[1](_items.length)
            let pages = Math.ceil(_items.length / itemPerPage)
            totalPage[1](pages)
            if (filter.page > pages) setFilter(draft => { draft.page = pages })
        })()
    }, [filter, textSearch])

    const clearFilter = () => {
        setRangeDate([])
        setSorting([])
        tableRef?.current?.clearSort()
        setFilter(draft => {
            draft.status = 'all'
            draft.startDate = null
            draft.endDate = null
            draft.sorting = null
            draft.page = 1
        })
        setItems([])
    }

    const exportHandler = async () => {
        let items = []
        pageLoading[1](true)
        let _res = await api(`/api/utils/registrations`)
        items = _res?.data || []
        items = items.filter(i => filter.status === 'all' || i.status === filter.status.toUpperCase())
        items = items.filter(i => !filter.startDate || (i.timestamp >= filter.startDate && i.timestamp <= filter.endDate))
        const ExcelJs = require('exceljs')
        let newWorkbook = new ExcelJs.Workbook();
        let newWorksheet = newWorkbook.addWorksheet("Sheet1");
        newWorksheet.addRow([
            'Register Date',
            'Code',
            'Guest Of',
            'Company',
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
                    item.code,
                    item.guestOf,
                    item.company,
                    item.firstName,
                    item.lastName,
                    item.email,
                    item.phoneNumber,
                    item.status
                ]);
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

    const saveHandler = async (value, code) => {
        pageLoading[1](true)
        let res = await api(`/api/utils/registrations`, {
            code,
            ...value
        }, 'patch')
        pageLoading[1](false)
        notify.push(res.resCode === '200' ? 'อัพเดทข้อมูลสำเร็จ' : 'อัพเดทข้อมูลไม่สำเร็จ', res.resCode === '200' ? 'success' : 'error')
        if (res.resCode === '200') {
            setItems(curr => curr.map(i => i.code === code ? ({ ...i, ...value }) : i))
        }
    }
    const modalUserRef = useRef<any>()

    const searchHandler = async (code) => {
        pageLoading[1](true)
        let res = await api(`/api/utils/registrations?code=${atob(code)}`)
        pageLoading[1](false)
        let data = res?.data?.[0]
        if (!data) return notify.push('ไม่พบข้อมูลบัตร', 'error')
        if (data?.status === 'REJECTED') return notify.push('บัตรนี้ถูกปฏิเสธแล้ว', 'error')
        if (data?.status === 'PENDING') return notify.push('บัตรนี้ยังไม่มีการลงทะเบียน', 'error')
        if (data?.status === 'REVIEW') return notify.push('บัตรนี้อยู่ในสถานะรอตรวจสอบ', 'error')
        if ((data?.seatNumber || '-') === '-') return notify.push('ไม่พบเลขที่นั่งของบัตรนี้', 'error')
        if (!modalUserRef.current?.getActive()) modalUserRef.current?.open(data)
    }

    return (
        <div className={styles.container}>
            <ModalUser ref={modalUserRef} />
            <ModalQRScanner
                show={modalScanner}
                searchHandler={e => { searchHandler(e) }}
            />
            <div style={{ alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px' }}>
                <div style={{ alignItems: 'center' }}>
                    <p className={styles.title}>
                        Register List
                    </p>
                    <span style={{ paddingLeft: '10px', minWidth: 'fit-content', color: '#aaaaaa' }}>({totalHits[0] ? totalHits[0]?.toLocaleString(undefined) : '-'} รายการ)</span>
                </div>

            </div>
            <div className={styles.content}>
                <div style={{ width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
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
                    <div>
                        <button className={styles.exportButton} onClick={exportHandler} style={{ marginLeft: '10px' }}>
                            <i className="fa-solid fa-download"></i>
                            Export
                        </button>
                        <button className={styles.exportButton} onClick={e => { modalScanner[1](true) }} style={{ marginLeft: '10px' }}>
                            <i className="fa-solid fa-qrcode"></i>
                            Scan Ticket
                        </button>
                    </div>
                </div>
                <div className={styles.filter} style={{ flexWrap: 'wrap' }}>
                    <div style={{ alignItems: 'center' }}>
                        <span style={{ color: '#ffffff', fontSize: '0.8rem' }}>Register Date</span>
                        <DateRangePicker
                            ref={orderDatePickerRef}
                            rangeDate={rangeDate}
                            style={{ marginLeft: '5px' }}
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
                    </div>
                    <span style={{ color: '#ffffff', marginLeft: '20px', fontSize: '0.8rem' }}>Status</span>
                    <Selector
                        className={styles.selector}
                        defaultValue={filter.status}
                        options={[
                            { title: 'All', value: 'all' },
                            { title: 'Pending', value: 'pending' },
                            { title: 'Review', value: 'review' },
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
                        <span style={{ color: '#dddddd', marginLeft: '20px', fontSize: '0.8rem', textDecoration: 'underline', cursor: 'pointer' }} onClick={clearFilter}>Clear filter</span>
                    }
                    <div style={{ flex: '1 1' }} />
                    <div style={{ alignItems: 'center' }}>
                        <span style={{ color: '#888888', fontSize: '0.8rem' }}>{selectedItems.length || 0} of {items.length} selected</span>
                        <div>
                            <DropdownWrap
                                button={(
                                    <button
                                        className={styles.searchButton}
                                        disabled={selectedItems.length === 0 || selectedItems.some(i => items.find(_i => _i.code === i).status === 'PENDING')}
                                        style={{ color: '#35FEAC' }}
                                    >
                                        Action
                                    </button>
                                )}
                                items={[
                                    { value: 'APPROVED', detail: { alias: 'APPROVED' } },
                                    { value: 'REJECTED', detail: { alias: 'REJECTED' } }
                                ]}
                                itemHeight={30}
                                onClick={async (detail, value, e) => {
                                    let _items = selectedItems?.map(i => ({ code: i, status: value }))
                                    pageLoading[1](true)
                                    let responses = await Promise.all(_items.map(async i => {
                                        return await api(`/api/utils/registrations`, {
                                            ...i
                                        }, 'patch')
                                    }))
                                    pageLoading[1](false)
                                    notify.push(responses.every(res => res.resCode === '200') ? 'อัพเดทสถานะสำเร็จ' : 'อัพเดทสถานะไม่สำเร็จ', responses.every(res => res.resCode === '200') ? 'success' : 'error')
                                    if (responses.every(res => res.resCode === '200')) {
                                        setItems(curr => curr.map(i => selectedItems.includes(i.code) ? ({ ...i, status: value }) : i))
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
                </div>
                <div style={{ flex: '1 1', overflow: 'hidden' }}>
                    <div className={styles.tableContainer}>
                        <div style={{ overflow: 'hidden', overflowX: 'auto', flex: '1 1' }}>
                            <Table
                                className={styles.table}
                                minWidth="1300px"
                                ref={tableRef}
                                id={'table'}
                                data={[items, null]}
                                showCheckbox={true}
                                noDataLabel={loading ? 'Loading...' : items.length === 0 ? 'No data' : ''}
                                dataKey="code"
                                itemClassName={i => { return `${styles.item} ${selectedItems.includes(i.code) ? styles.selected : ''}` }}
                                onSelect={e => setSelectedItems(e.map(i => i.id))}
                                sortKeys={[
                                    'timestamp',
                                    'code',
                                    'guestOf',
                                    'company',
                                    'firstName',
                                    'lastName',
                                    'email',
                                    'phoneNumber',
                                    'checkInTimestamp',
                                    'status'
                                ]}
                                onSorting={(value) => {
                                    setSorting(value?.sortOf ? [`${value?.key}:${value?.sortOf}`] : [])
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
                                    'Guest Of',
                                    'Company',
                                    'First Name',
                                    'Last Name',
                                    'Email',
                                    'Phone',
                                    'Check-In Date',
                                    'Status'
                                ]}
                                template={[
                                    { minHeight: '30px', alignItems: 'center', flex: '0 0 115px', maxWidth: '115px', justifyContent: 'start', textAlign: 'start' },
                                    { minHeight: '30px', alignItems: 'center', flex: '0 0 115px', maxWidth: '115px', justifyContent: 'start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 220px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 220px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 220px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 220px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 350px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 170px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', alignItems: 'center', flex: '0 0 115px', maxWidth: '115px', justifyContent: 'start', textAlign: 'start' },
                                    { minHeight: '30px', alignItems: 'center', flex: '1 1 100px', minWidth: '100px', maxWidth: '110px', justifyContent: 'center', textAlign: 'center' }
                                ]}
                                addButtonAlias=''
                                isDeletable={false}
                                contents={(item, index) => {
                                    return [
                                        <span>{dayjs(item.timestamp).format('DD/MM/YYYY HH:mm')}</span>,
                                        <span>{item.code}</span>,
                                        <FieldEditor
                                            id={`guestOf.${item.code}`}
                                            name={`guestOf.${item.code}`}
                                            defaultValue={item.guestOf || ''}
                                            type={'text'}
                                            saveHandler={async value => { await saveHandler(value, item.code) }}
                                        />,
                                        <FieldEditor
                                            id={`company.${item.code}`}
                                            name={`company.${item.code}`}
                                            defaultValue={item.company || ''}
                                            type={'text'}
                                            saveHandler={async value => { await saveHandler(value, item.code) }}
                                        />,
                                        <FieldEditor
                                            id={`firstName.${item.code}`}
                                            name={`firstName.${item.code}`}
                                            defaultValue={item.firstName || ''}
                                            type={'text'}
                                            saveHandler={async value => { await saveHandler(value, item.code) }}
                                        />,
                                        <FieldEditor
                                            id={`lastName.${item.code}`}
                                            name={`lastName.${item.code}`}
                                            defaultValue={item.lastName || ''}
                                            type={'text'}
                                            saveHandler={async value => { await saveHandler(value, item.code) }}
                                        />,
                                        <FieldEditor
                                            id={`email.${item.code}`}
                                            name={`email.${item.code}`}
                                            defaultValue={item.email || ''}
                                            type={'text'}
                                            saveHandler={async value => { await saveHandler(value, item.code) }}
                                        />,
                                        <FieldEditor
                                            id={`phoneNumber.${item.code}`}
                                            name={`phoneNumber.${item.code}`}
                                            defaultValue={item.phoneNumber || ''}
                                            type={'text'}
                                            saveHandler={async value => { await saveHandler(value, item.code) }}
                                        />,
                                        <span>{item.checkInTimestamp ? dayjs(item.checkInTimestamp).format('DD/MM/YYYY HH:mm') : '-'}</span>,
                                        <span style={{ padding: '0px 7px', borderRadius: '20px', background: `${item.status === 'REVIEW' ? '#888888' : item.status === 'REJECTED' ? '#ee6a6a' : item.status === 'PENDING' ? 'none' : '#4AA785'}`, color: '#ffffff', display: 'flex', alignItems: 'center', textTransform: 'capitalize' }}>
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
                </div>
            </div>
        </div >
    )
}

export default Notification
