

import { GetObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
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


const COUNTRIES = [
    'Thailand',
    'Afghanistan',
    'Albania',
    'Algeria',
    'American Samoa',
    'Andorra',
    'Angola',
    'Anguilla',
    'Antarctica',
    'Antigua and Barbuda',
    'Argentina',
    'Armenia',
    'Aruba',
    'Australia',
    'Austria',
    'Azerbaijan',
    'Bahamas',
    'Bahrain',
    'Bangladesh',
    'Barbados',
    'Belarus',
    'Belgium',
    'Belize',
    'Benin',
    'Bermuda',
    'Bhutan',
    'Bolivia',
    'Bosnia and Herzegowina',
    'Botswana',
    'Bouvet Island',
    'Brazil',
    'British Indian Ocean Territory',
    'Brunei Darussalam',
    'Bulgaria',
    'Burkina Faso',
    'Burundi',
    'Cambodia',
    'Cameroon',
    'Canada',
    'Cape Verde',
    'Cayman Islands',
    'Central African Republic',
    'Chad',
    'Chile',
    'China',
    'Christmas Island',
    'Cocos (Keeling) Islands',
    'Colombia',
    'Comoros',
    'Congo',
    'Congo, the Democratic Republic of the',
    'Cook Islands',
    'Costa Rica',
    "Cote d'Ivoire",
    'Croatia (Hrvatska)',
    'Cuba',
    'Cyprus',
    'Czech Republic',
    'Denmark',
    'Djibouti',
    'Dominica',
    'Dominican Republic',
    'East Timor',
    'Ecuador',
    'Egypt',
    'El Salvador',
    'Equatorial Guinea',
    'Eritrea',
    'Estonia',
    'Ethiopia',
    'Falkland Islands (Malvinas)',
    'Faroe Islands',
    'Fiji',
    'Finland',
    'France',
    'Gabon',
    'Gambia',
    'Georgia',
    'Germany',
    'Ghana',
    'Gibraltar',
    'Greece',
    'Greenland',
    'Grenada',
    'Guadeloupe',
    'Guam',
    'Guatemala',
    'Guinea',
    'Guinea-Bissau',
    'Guyana',
    'Haiti',
    'Honduras',
    'Hong Kong',
    'Hungary',
    'Iceland',
    'India',
    'Indonesia',
    'Iran',
    'Iraq',
    'Ireland',
    'Israel',
    'Italy',
    'Jamaica',
    'Japan',
    'Jordan',
    'Kazakhstan',
    'Kenya',
    'Kiribati',
    'Korea',
    'Kuwait',
    'Kyrgyzstan',
    "Lao",
    'Latvia',
    'Lebanon',
    'Lesotho',
    'Liberia',
    'Libyan Arab Jamahiriya',
    'Liechtenstein',
    'Lithuania',
    'Luxembourg',
    'Macau',
    'Macedonia, The Former Yugoslav Republic of',
    'Madagascar',
    'Malawi',
    'Malaysia',
    'Maldives',
    'Mali',
    'Malta',
    'Marshall Islands',
    'Martinique',
    'Mauritania',
    'Mauritius',
    'Mayotte',
    'Mexico',
    'Micronesia, Federated States of',
    'Moldova, Republic of',
    'Monaco',
    'Mongolia',
    'Montserrat',
    'Morocco',
    'Mozambique',
    'Myanmar',
    'Namibia',
    'Nauru',
    'Nepal',
    'Netherlands',
    'Netherlands Antilles',
    'New Caledonia',
    'New Zealand',
    'Nicaragua',
    'Niger',
    'Nigeria',
    'Niue',
    'Norfolk Island',
    'Northern Mariana Islands',
    'Norway',
    'Oman',
    'Pakistan',
    'Palau',
    'Panama',
    'Papua New Guinea',
    'Paraguay',
    'Peru',
    'Philippines',
    'Pitcairn',
    'Poland',
    'Portugal',
    'Puerto Rico',
    'Qatar',
    'Reunion',
    'Romania',
    'Russian Federation',
    'Rwanda',
    'Saint Kitts and Nevis',
    'Saint LUCIA',
    'Saint Vincent and the Grenadines',
    'Samoa',
    'San Marino',
    'Sao Tome and Principe',
    'Saudi Arabia',
    'Senegal',
    'Seychelles',
    'Sierra Leone',
    'Singapore',
    'Slovakia (Slovak Republic)',
    'Slovenia',
    'Solomon Islands',
    'Somalia',
    'South Africa',
    'South Georgia and the South Sandwich Islands',
    'Spain',
    'Sri Lanka',
    'St. Helena',
    'St. Pierre and Miquelon',
    'Sudan',
    'Suriname',
    'Svalbard and Jan Mayen Islands',
    'Swaziland',
    'Sweden',
    'Switzerland',
    'Syrian Arab Republic',
    'Taiwan, Province of China',
    'Tajikistan',
    'Tanzania, United Republic of',
    'Togo',
    'Tokelau',
    'Tonga',
    'Trinidad and Tobago',
    'Tunisia',
    'Turkey',
    'Turkmenistan',
    'Turks and Caicos Islands',
    'Tuvalu',
    'Uganda',
    'Ukraine',
    'United States',
    'United Arab Emirates',
    'United Kingdom',
    'United States Minor Outlying Islands',
    'Uruguay',
    'Uzbekistan',
    'Vanuatu',
    'Venezuela',
    'Viet Nam',
    'Virgin Islands (British)',
    'Virgin Islands (U.S.)',
    'Wallis and Futuna Islands',
    'Western Sahara',
    'Yemen',
    'Serbia',
    'Zambia',
    'Zimbabwe'
]

const CHANNELS = [
    "Shopify",
    "7-ELEVEN ทุกสาขา",
    "Beautrium",
    "Eveandboy",
    "CJ",
    "Big C",
    "Watsons",
    "Lotus’s",
    "Tops",
    "Konvy",
    "Shopee : GO HAIR OFFICIAL",
    "Lazada GO HAIR",
    "TikTok : GO HAIR OFFICIAL",
    "ร้านค้าทั่วไป"
]

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
    const [orderRangeDate, setOrderRangeDate] = useState<dayjs.Dayjs[]>([])

    const { loading: pageLoading, s3Client, notify: { current: notify } } = useContext(AppContext)

    const [loading, setLoading] = useState<boolean>(false)
    const [selectedItems, setSelectedItems] = useState<any[]>([])
    const [items, setItems] = useState<any[]>([])
    const [textSearch, setTextSearch] = useState<string>('')
    const [filter, setFilter] = useImmer({
        status: 'all',
        page: +router.query.page || 1,
        orderStartDate: null,
        orderEndDate: null,
        submitStartDate: null,
        submitEndDate: null,
        sorting: null,
        channel: null
    })

    const pageMap = useState<any>({})

    const meiliEnabled = useMemo(() => true || textSearch || sorting.length > 0 || filter.status !== 'all' || filter.channel || filter.orderStartDate || filter.orderEndDate || filter.submitStartDate || filter.submitEndDate, [filter, sorting, textSearch])

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
        setOrderRangeDate([])
        setSubmitRangeDate([])
        setSorting([])
        setSortingLabel('')
        tableRef?.current?.clearSort()
        setFilter(draft => {
            draft.status = 'all'
            draft.sorting = null
            draft.page = 1
            draft.orderStartDate = null
            draft.channel = null
            draft.orderEndDate = null
            draft.submitStartDate = null
            draft.submitEndDate = null
        })
        setItems([])
    }

    const getImageDimensions = async (file) => {
        return await new Promise(function (resolved, rejected) {
            var i = new Image()
            i.onload = function () {
                resolved({ w: i.width, h: i.height })
            };
            i.src = file
        })
    }

    const exportHandler = async () => {
        let items = []
        pageLoading[1](true)
        let res = await api(`/api/search`, {
            page: 1,
            q: textSearch || '',
            hitsPerPage: 10000,
            filter: [
                ...((filter.status && filter.status !== 'all') ? [`status = ${filter.status}`] : []),
                ...((filter.channel) ? [`channel = \"${filter.channel}\"`] : []),
                ...(filter.orderStartDate ? [`purchasedTimestamp ${filter.orderStartDate} TO ${filter.orderEndDate}`] : []),
                ...(filter.submitStartDate ? [`timestamp ${filter.submitStartDate} TO ${filter.submitEndDate}`] : []),
            ],
            sort: filter.sorting ? [filter.sorting] : []
        }, 'post')
        items = res?.hits || []
        const ExcelJs = require('exceljs')
        let newWorkbook = new ExcelJs.Workbook();
        let newWorksheet = newWorkbook.addWorksheet("Sheet1");
        newWorksheet.addRow([
            'Submission Date',
            'Purchase Date',
            'Channel',
            'Receipt No.',
            'First name',
            'Last name',
            'Id',
            'Province',
            'Country',
            'BirthDate',
            'Gender',
            'Email',
            'Phone',
            'Right Count',
            'Total Amount',
            'Status',
            'Evidence'
        ]);
        newWorksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' }
        // let images = await Promise.all(items.map(async (i) => {
        //     let base64
        //     if (!i.image) return ({ id: i.redeemId, base64: '' })
        //     const command = new GetObjectCommand({
        //         Bucket: 'go-hair-submission',
        //         Key: i.image
        //     })
        //     const res = await s3Client.send(command)
        //     base64 = await res?.Body?.transformToString('base64');
        //     let size: any = await getImageDimensions(`data:${res.ContentType};base64,` + base64)
        //     return ({ id: i.redeemId, base64, size })
        // }))
        await Promise.all(
            items.map(async (item, index) => {
                await newWorksheet.addRow([
                    dayjs(item.timestamp).format('DD/MM/YYYY HH:mm'),
                    dayjs(item.purchasedTimestamp).format('DD/MM/YYYY HH:mm'),
                    item.channel,
                    item.receiptNumber,
                    item.firstName,
                    item.lastName,
                    item.id,
                    item.province,
                    item.country,
                    item.birthDate,
                    item.gender,
                    item.email,
                    item.phoneNumber,
                    item.rightCount || 0,
                    item.totalAmount,
                    item.status,
                    ""
                ]);
                newWorksheet.getRow(index + 2).alignment = { vertical: 'middle', horizontal: 'center' }
                newWorksheet.columns[16].width = 20;
                // if (item?.image) {
                //     let { base64, size } = images.find(i => item.redeemId === i.id)
                //     let _image = await newWorkbook.addImage({
                //         base64,
                //         extension: "png"
                //     });
                //     let imageHeight = 120
                //     newWorksheet.getRow(index + 2).height = imageHeight;
                //     await newWorksheet.addImage(_image, {
                //         tl: { col: 16, row: index + 1 },
                //         ext: { width: size.w * (imageHeight * 1.25) / size.h, height: imageHeight * 1.25 },
                //         editAs: 'oneCell'
                //     });
                // }
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

    const saveHandler = async (value, redeemId) => {
        pageLoading[1](true)
        let res = await api(`/api/utils/redeem`, {
            redeemId,
            ...value
        }, 'patch')
        pageLoading[1](false)
        notify.push(res.resCode === '200' ? 'อัพเดทข้อมูลสำเร็จ' : 'อัพเดทข้อมูลไม่สำเร็จ', res.resCode === '200' ? 'success' : 'error')
        if (res.resCode === '200') {
            setItems(curr => curr.map(i => i.redeemId === redeemId ? ({ ...i, ...value }) : i))
        }
    }

    return (
        <div className={styles.container}>
            <div style={{ alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px' }}>
                <div style={{ alignItems: 'center' }}>
                    <p className={styles.title}>
                        Submission List
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
                        placeholder='ค้นหา'
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
                    <span style={{ color: '#0F865E', fontSize: '0.8rem' }}>วันที่ซื้อ</span>
                    <DateRangePicker
                        ref={orderDatePickerRef}
                        rangeDate={orderRangeDate}
                        style={{ height: '100%', marginLeft: '5px' }}
                        onChange={value => {
                            let range = value.map(i => i.valueOf())
                            if (range.every((date, index) => date === orderRangeDate[index]?.valueOf())) return
                            pageMap[1]({})
                            setFilter(draft => {
                                draft.page = 1
                                draft.orderStartDate = range[0].valueOf()
                                draft.orderEndDate = range[1].valueOf()
                            })
                            orderDatePickerRef.current?.close()
                        }}
                        setRangeDate={setOrderRangeDate}
                    />
                    <span style={{ color: '#0F865E', marginLeft: '20px', fontSize: '0.8rem' }}>วันที่ Submission</span>
                    <DateRangePicker
                        ref={submitDatePickerRef}
                        rangeDate={submitRangeDate}
                        style={{ height: '100%', marginLeft: '5px' }}
                        onChange={value => {
                            let range = value.map(i => i.valueOf())
                            if (range.every((date, index) => date === submitRangeDate[index]?.valueOf())) return
                            pageMap[1]({})
                            setFilter(draft => {
                                draft.page = 1
                                draft.submitStartDate = range[0].valueOf()
                                draft.submitEndDate = range[1].valueOf()
                            })
                            submitDatePickerRef.current?.close()
                        }}
                        setRangeDate={setSubmitRangeDate}
                    />
                    <span style={{ color: '#0F865E', marginLeft: '20px', fontSize: '0.8rem' }}>สถานะ</span>
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
                    <span style={{ color: '#0F865E', marginLeft: '20px', fontSize: '0.8rem' }}>Channel</span>
                    <div style={{ width: '210px', height: '100%' }}>
                        <DropdownWrap
                            button={(
                                <div className={styles.channelSelected} style={{ marginLeft: '5px' }}>
                                    <span>{filter?.channel || 'เลือก Channel'}</span>
                                    <i aria-hidden className="fa-solid fa-sort-down"></i>
                                </div>
                            )}
                            items={CHANNELS.map(i => ({ detail: { alias: i }, value: i }))}
                            itemHeight={30}
                            onClick={(detail, value, e) => {
                                setFilter(draft => {
                                    draft.page = 1
                                    draft.channel = value
                                })
                            }}
                            itemWidth={210}
                            align='end'
                        >
                            {(detail, value) => (
                                <div className={styles.channelButton}>
                                    <span>{detail.alias}</span>
                                </div>
                            )}
                        </DropdownWrap>
                    </div>
                    {(filter.status !== 'all' || filter.channel || filter.orderStartDate || filter.orderEndDate || filter.submitStartDate || filter.submitEndDate) &&
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
                                    style={{ color: '#0F865E' }}
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
                                let _items = selectedItems?.map(i => ({ redeemId: i, status: value }))
                                pageLoading[1](true)
                                let res = await api(`/api/utils/redeem/status`, _items, 'patch')
                                pageLoading[1](false)
                                notify.push(res.resCode === '200' ? 'อัพเดทสถานะสำเร็จ' : 'อัพเดทสถานะไม่สำเร็จ', res.resCode === '200' ? 'success' : 'error')
                                if (res.resCode === '200') {
                                    setItems(curr => curr.map(i => selectedItems.includes(i.redeemId) ? ({ ...i, status: value }) : i))
                                    tableRef.current?.clearCheckbox()
                                }
                                // setItems([])
                                // pageMap[1]({})
                                // setFilter(draft => {
                                //     draft.page = 1
                                // })
                                // await getList(filter)
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
                                minWidth="2400px"
                                ref={tableRef}
                                id={'table'}
                                data={[items, null]}
                                showCheckbox={true}
                                noDataLabel={loading ? 'Loading...' : items.length === 0 ? 'No data' : ''}
                                dataKey="redeemId"
                                itemClassName={i => { return `${styles.item} ${currentImageUrl[0]?.id === i.redeemId ? styles.selected : ''}` }}
                                onSelect={e => setSelectedItems(e.map(i => i.id))}
                                sortKeys={[
                                    'timestamp',
                                    'purchasedTimestamp',
                                    'receiptNumber',
                                    'channel',
                                    'firstName',
                                    'lastName',
                                    'id',
                                    'province',
                                    'country',
                                    'email',
                                    'phoneNumber',
                                    'birthDate',
                                    'gender',
                                    'rightCount',
                                    'totalAmount',
                                    'status',
                                    ''
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
                                    'Submission Date',
                                    'Purchase Date',
                                    'Receipt No.',
                                    'Channel',
                                    'First Name',
                                    'Last Name',
                                    'Id',
                                    'Province',
                                    'Country',
                                    'Email',
                                    'Phone',
                                    'BirthDate',
                                    'Gender',
                                    'Right Count',
                                    'Total Amount',
                                    'Status',
                                    'Receipt'
                                ]}
                                template={[
                                    { minHeight: '30px', alignItems: 'center', flex: '0 0 115px', maxWidth: '115px', justifyContent: 'start', textAlign: 'start' },
                                    { minHeight: '30px', alignItems: 'center', flex: '0 0 115px', maxWidth: '115px', justifyContent: 'start', textAlign: 'start' },
                                    { minHeight: '30px', alignItems: 'center', flex: '0 0 150px', justifyContent: 'start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 0 250px', maxWidth: '200px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 220px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 220px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 200px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 200px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 200px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 350px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', padding: '0 4px', alignItems: 'center', flex: '1 1 170px', justifyContent: 'flex-start', textAlign: 'start' },
                                    { minHeight: '30px', alignItems: 'center', flex: '0 0 90px', justifyContent: 'center', textAlign: 'center' },
                                    { minHeight: '30px', alignItems: 'center', flex: '0 0 80px', justifyContent: 'center', textAlign: 'center' },
                                    { minHeight: '30px', alignItems: 'center', flex: '1 1 100px', minWidth: '100px', maxWidth: '110px', justifyContent: 'flex-end', textAlign: 'end' },
                                    { minHeight: '30px', alignItems: 'center', flex: '1 1 100px', minWidth: '100px', maxWidth: '110px', justifyContent: 'flex-end', textAlign: 'end' },
                                    { minHeight: '30px', alignItems: 'center', flex: '1 1 100px', minWidth: '100px', maxWidth: '110px', justifyContent: 'center', textAlign: 'center' },
                                    { minHeight: '30px', alignItems: 'center', flex: '0 0 50px', justifyContent: 'center', textAlign: 'center' },
                                ]}
                                addButtonAlias=''
                                isDeletable={false}
                                contents={(item, index) => {
                                    return [
                                        <span>{dayjs(item.timestamp).format('DD/MM/YYYY HH:mm')}</span>,
                                        <span>{dayjs(item.purchasedTimestamp).format('DD/MM/YYYY HH:mm')}</span>,
                                        <FieldEditor
                                            id={`receiptNumber.${item.redeemId}`}
                                            name={`receiptNumber.${item.redeemId}`}
                                            defaultValue={item.receiptNumber || ''}
                                            type="text"
                                            saveHandler={async value => { await saveHandler(value, item.redeemId) }}
                                        />,
                                        <FieldEditor
                                            id={`channel.${item.redeemId}`}
                                            name={`channel.${item.redeemId}`}
                                            defaultValue={item.channel || ''}
                                            type="select"
                                            items={CHANNELS}
                                            saveHandler={async value => { await saveHandler(value, item.redeemId) }}
                                        />,
                                        <FieldEditor
                                            id={`firstName.${item.redeemId}`}
                                            name={`firstName.${item.redeemId}`}
                                            defaultValue={item.firstName || ''}
                                            type={'text'}
                                            saveHandler={async value => { await saveHandler(value, item.redeemId) }}
                                        />,
                                        <FieldEditor
                                            id={`lastName.${item.redeemId}`}
                                            name={`lastName.${item.redeemId}`}
                                            defaultValue={item.lastName || ''}
                                            type={'text'}
                                            saveHandler={async value => { await saveHandler(value, item.redeemId) }}
                                        />,
                                        <FieldEditor
                                            id={`id.${item.redeemId}`}
                                            name={`id.${item.redeemId}`}
                                            defaultValue={item.id || ''}
                                            type={'text'}
                                            saveHandler={async value => { await saveHandler(value, item.redeemId) }}
                                        />,
                                        <FieldEditor
                                            id={`province.${item.redeemId}`}
                                            name={`province.${item.redeemId}`}
                                            defaultValue={item.province || ''}
                                            type={'text'}
                                            saveHandler={async value => { await saveHandler(value, item.redeemId) }}
                                        />,
                                        <FieldEditor
                                            id={`country.${item.redeemId}`}
                                            name={`country.${item.redeemId}`}
                                            defaultValue={item.country || ''}
                                            type="select"
                                            saveHandler={async value => { await saveHandler(value, item.redeemId) }}
                                            items={COUNTRIES}
                                        />,
                                        <FieldEditor
                                            id={`email.${item.redeemId}`}
                                            name={`email.${item.redeemId}`}
                                            defaultValue={item.email || ''}
                                            type={'email'}
                                            saveHandler={async value => { await saveHandler(value, item.redeemId) }}
                                        />,
                                        <FieldEditor
                                            id={`phoneNumber.${item.redeemId}`}
                                            name={`phoneNumber.${item.redeemId}`}
                                            defaultValue={item.phoneNumber || ''}
                                            type={'text'}
                                            saveHandler={async value => { await saveHandler(value, item.redeemId) }}
                                            autoComplete="off"
                                            inputMode='numeric'
                                            onChange={e => {
                                                let _numbers = [...e.target.value]
                                                e.target.value = _numbers.filter((i, index) => !isNaN(+i)).join('')
                                            }}
                                        />,
                                        <span style={{ width: '100%', wordBreak: 'break-all' }}>{`${item.birthDate ? dayjs(item.birthDate).format('DD/MM/YYYY') : ''}`}</span>,
                                        <span style={{ width: '100%', wordBreak: 'break-all' }}>{`${item.gender || ''}`}</span>,
                                        <span style={{ textAlign: 'end' }}>{`${(item.rightCount || 0).toLocaleString(undefined)}`}</span>,
                                        <span style={{ textAlign: 'end' }}>{`${(item.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}</span>,
                                        <span style={{ padding: '0px 7px', borderRadius: '20px', background: `${item.status === 'PENDING' ? '#888888' : item.status === 'REJECTED' ? '#ee6a6a' : '#4AA785'}`, color: '#ffffff', display: 'flex', alignItems: 'center', textTransform: 'capitalize' }}>
                                            <i aria-hidden className="fa-solid fa-circle" style={{ color: '#ffffff', padding: '0 5px 0 0', fontSize: '7px' }}></i>
                                            {item.status}
                                        </span>,
                                        <span>
                                            {item.image &&
                                                <i
                                                    aria-hidden
                                                    className={`fa-solid fa-receipt ${styles.receipt}`}
                                                    style={{ color: item.image ? '#0F865E' : '#666666', cursor: 'pointer' }}
                                                    onClick={async () => {
                                                        pageLoading[1](true)
                                                        const command = new GetObjectCommand({
                                                            Bucket: 'go-hair-submission',
                                                            Key: item.image
                                                        })
                                                        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
                                                        currentImageUrl[1]({ url, id: item.redeemId })
                                                        pageLoading[1](false)
                                                    }}
                                                />
                                            }
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
                        </div>}
                </div>
            </div>
        </div >
    )
}

export default Notification
