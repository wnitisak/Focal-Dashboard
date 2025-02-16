import { useSession } from '@clerk/nextjs';
import BarChart from 'components/Chart/BarChart';
import HorizontalBarChart from 'components/Chart/HorizontalBarChart';
import VerticalBarChart from 'components/Chart/VerticalBarChart';
import styles from './index.module.sass';

// 1. pre-regis
// - จำนวนยอดผู้สมัครทุก 3 ชม (12pm,3pm,6pm,9pm,0am)
// - graph line
// - timeframe
// - amount 
// - country 
// - gender

export const MainPage = () => {
    const { session } = useSession();
    // useEffect(() => {
    //     (async () => {
    //         let res = await api(`/api/search`, {
    //             page: 1,
    //             hitsPerPage: 0,
    //             filter: [
    //             ],
    //             sort: [],
    //             facets: ['channel']
    //         })
    //         console.log(res?.facetDistribution)
    //     })()
    // })
    return (

        <div className={styles.container}>
            <div style={{ alignItems: 'center', width: '100%' }}>
                <p className={styles.title}>
                    Dashboard
                </p>
            </div>
            <div className={styles.chart} style={{ flex: '1 1 600px', height: '500px' }}>
                <BarChart
                    endpoint={'/api/utils/dashboard/registration/general'}
                    dataHandler={data => data?.data}
                    title={(summary) => `ยอดคนสมัคร ( ${summary?.total ? summary?.total?.toLocaleString(undefined) : '-'} คน )`}
                    config={{
                        female: {
                            formatter: (value) => `หญิง ${(+value).toLocaleString(undefined)} คน`,
                            title: 'หญิง',
                            color: '#82ca9d'
                        },
                        male: {
                            formatter: (value) => `ชาย ${(+value).toLocaleString(undefined)} คน`,
                            title: 'ชาย',
                            color: '#00ACDB'
                        },
                        other: {
                            formatter: (value) => `ไม่ระบุ ${(+value).toLocaleString(undefined)} คน`,
                            title: 'ไม่ระบุ',
                            color: '#8884d8'
                        }
                    }}
                />
            </div>
            {/* <div className={styles.chart}>
                <PieChart
                    title={'Channels'}
                    config={{
                        hvac: {
                            title: 'HVAC',
                            color: '#FF6B00'
                        },
                        server: {
                            title: 'Server',
                            color: '#FFB800'
                        },
                        elevator: {
                            title: 'elevator',
                            color: '#04BEFE'
                        },
                        sanitary: {
                            title: 'Sanitary',
                            color: '#9843ff'
                        },
                        others: {
                            title: 'Others',
                            color: '#4FD18B'
                        },
                        empty: {
                            title: '',
                            color: '#f5f5f5'
                        }
                    }}
                    data={{
                        hvac: 10,
                        server: 20
                    }}
                />
            </div> */}
            <div className={styles.chart} style={{ flex: '1 1 600px', height: '500px' }}>
                <VerticalBarChart
                    dataHandler={data => Object.keys(data?.data || {}).map(key => ({ name: key, value: data?.data[key] })).sort((a, b) => b.value - a.value)}
                    label='ประเทศ'
                    endpoint='/api/utils/dashboard/registration/country'
                    title={'อันดับประเทศที่สมัคร'}
                />
            </div>
            <div style={{ width: '100%', flexWrap: 'wrap' }}>
                <div className={styles.chart} style={{ flex: '1 1 600px', height: '600px' }}>
                    <VerticalBarChart
                        dataHandler={data => Object.keys(data?.facetDistribution?.channel || {}).map(key => ({ name: key, value: data?.facetDistribution?.channel?.[key] })).sort((a, b) => b.value - a.value)}
                        yAxisWidth={200}
                        body={{
                            page: 1,
                            hitsPerPage: 0,
                            filter: [
                                'status != REJECTED'
                            ],
                            facets: ['channel']
                        }}
                        label='ช่องทาง'
                        endpoint={`/api/search#channels`}
                        title={'อันดับช่องทางขาย'}
                    />
                </div>
                <div className={styles.chart} style={{ flex: '1 1 600px', height: '600px' }}>
                    <VerticalBarChart
                        limit={20}
                        dataHandler={data => Object.keys(data?.facetDistribution?.province || {}).map(key => ({ name: key, value: data?.facetDistribution?.province?.[key] })).sort((a, b) => b.value - a.value)}
                        yAxisWidth={100}
                        body={{
                            page: 1,
                            hitsPerPage: 0,
                            filter: [
                                'status != REJECTED'
                            ],
                            facets: ['province']
                        }}
                        label='จังหวัด'
                        endpoint={`/api/search#provinces`}
                        title={'อันดับจังหวัด (20 อันดับ)'}
                    />
                </div>
            </div>
            <div style={{ width: '100%', flexWrap: 'wrap' }}>
                <div className={styles.chart} style={{ flex: '1 1 300px', height: '400px' }}>
                    <VerticalBarChart
                        dataHandler={data => Object.keys(data?.facetDistribution?.gender || {}).map(key => ({ name: key, value: data?.facetDistribution?.gender?.[key] })).sort((a, b) => b.value - a.value)}
                        body={{
                            page: 1,
                            hitsPerPage: 0,
                            filter: [
                                'status != REJECTED'
                            ],
                            facets: ['gender']
                        }}
                        label='เพศ'
                        endpoint={`/api/search#genders`}
                        title={'อันดับเพศ'}
                    />
                </div>
                <div className={styles.chart} style={{ flex: '1 1 600px', height: '400px' }}>
                    <HorizontalBarChart
                        dataHandler={data => Object.keys(data?.facetDistribution?.age || {}).map(key => ({ name: key, value: data?.facetDistribution?.age?.[key] })).sort((a, b) => +a.name - +b.name)}
                        body={{
                            page: 1,
                            hitsPerPage: 0,
                            filter: [
                                'status != REJECTED'
                            ],
                            facets: ['age']
                        }}
                        endpoint={`/api/search#ages`}
                        label='อายุ'
                        title={'อันดับอายุ'}
                    />
                </div>
            </div>
            <div className={styles.chart} style={{ flex: '1 1 600px', height: '1000px' }}>
                <VerticalBarChart
                    dataHandler={data => {
                        let _items = Object.keys(data?.facetDistribution?.totalAmount || {}).map(key => ({ name: key, value: data?.facetDistribution?.totalAmount?.[key] }))
                        let items = [{ name: '0 - 750', value: _items.reduce((a, b) => a + (+b.name <= 750 ? +b.value : 0), 0) }]
                        let start = 751
                        let maxAmount = Math.max(..._items.map(i => +i.name))
                        while (start <= maxAmount && start <= 15000) {
                            let end = start + 249
                            if (end > 15000) end = 15000
                            items.push({
                                name: `${start?.toLocaleString(undefined)} - ${end?.toLocaleString(undefined)}`,
                                value: _items.reduce((a, b) => a + (+b.name >= start && +b.name <= end ? +b.value : 0), 0)
                            })
                            start = end + 1
                        }
                        if (maxAmount > 15000) {
                            items.push({
                                name: `> 15,000`,
                                value: _items.reduce((a, b) => a + (+b.name > 15000 ? +b.value : 0), 0)
                            })
                        }
                        return items?.filter(i => i.value > 0)
                    }}
                    yAxisWidth={100}
                    body={{
                        page: 1,
                        hitsPerPage: 0,
                        filter: [
                            'status != REJECTED'
                        ],
                        facets: ['totalAmount']
                    }}
                    label='ยอดซื้อ'
                    endpoint={`/api/search#totalAmount`}
                    title={'Basket Size'}
                />
            </div>
        </div >
    )
}

export default MainPage