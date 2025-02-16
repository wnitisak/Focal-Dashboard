import dayjs from 'dayjs';
import { useEffect, useMemo, useState } from 'react';
import { Bar, ComposedChart, Legend, XAxis, YAxis } from 'recharts';
import useSWR from 'swr';
import { api } from 'utils/general';
import Chart from '..';

interface props {
    title: string
    label: string
    endpoint: string
    limit?: number
    yAxisWidth?: number
    body?: any
    dataHandler: (data: any) => {
        name: string
        value: number
    }[]
}

const HorizontalBarChart = ({ limit, yAxisWidth, title, label, dataHandler, body, endpoint }: props) => {


    const [timeframe, setTimeframe] = useState<any>(
        {
            value: 'custom',
            range: [
                dayjs().date(1).month(8).startOf('day').valueOf(),
                dayjs().endOf('day').valueOf()
            ]
        }
    )


    const { data: chartData, mutate, isValidating } = useSWR(timeframe?.range ? `${endpoint}?from=${timeframe?.range?.[0]}&to=${timeframe?.range?.[1]}` : null, url => api(url, body ? { ...body, filter: [...(body?.filter || []), `timestamp ${timeframe?.range?.[0]} TO ${timeframe?.range?.[1]}`] } : null).then(data => data), { revalidateOnMount: false, revalidateOnFocus: false })

    const data = useMemo(() => chartData ? dataHandler(chartData) : [], [chartData])

    useEffect(() => {
        mutate()
    }, [timeframe])


    return (
        <Chart
            title={title}
            loading={isValidating}
            defaultTimeframe={timeframe.value}
            defaultRangeDate={timeframe.range}
            onTimeframeChange={(value, range) => {
                setTimeframe(value)
                switch (value) {
                    case 'today':
                        setTimeframe({
                            value: 'today',
                            range: [
                                dayjs().startOf('day').valueOf(),
                                dayjs().endOf('day').valueOf()
                            ]
                        })
                        break
                    case 'custom':
                        setTimeframe({
                            value: 'custom',
                            range
                        })
                        break
                }
            }}
            timeframes={[
                { alias: 'Today', value: 'today' },
                { alias: 'Custom', value: 'custom' }
            ]}
        >
            {(data || []).length > 0 ?
                <ComposedChart
                    data={data.slice(0, limit || data.length)}
                    margin={{ left: 10, right: 40, top: 20 }}
                >
                    <Legend
                        iconType='square'
                        verticalAlign="bottom"
                        align='center'
                        height={30}
                        formatter={(value) => {
                            return <span style={{ color: '#888888' }}>{label}</span>
                        }}
                        wrapperStyle={{ left: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    />
                    <YAxis
                        width={yAxisWidth || 50}
                        axisLine={false}
                        tickLine={false}
                        fontSize={'12px'}
                        tick={{
                            fill: '#767676'
                        }}
                        type='number'
                    />
                    <XAxis
                        interval={0}
                        dataKey="name"
                        type='category'
                        axisLine={false}
                        tickLine={false}
                        fontSize={'12px'}
                        tick={{ fill: '#888888' }}
                    />
                    <Bar
                        dataKey="value"
                        barSize={25}
                        radius={[6, 6, 6, 6]}
                        fill={'#0C2756'}
                        label={{
                            position: 'top',
                            fill: '#888888',
                            fontSize: '12px'
                        }}
                    />
                </ComposedChart>
                :
                <span style={{ fontSize: '18px', color: '#A1A0BD', margin: 'auto auto', textAlign: 'center' }}>
                    No data
                </span>
            }
        </Chart >
    );
}

export default HorizontalBarChart