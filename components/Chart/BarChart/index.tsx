import CustomizeTooltip from 'components/Chart/ChartTooltip';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Area, ComposedChart, Legend, Tooltip, XAxis, YAxis } from 'recharts';
import useSWR from 'swr';
import { api } from 'utils/general';
import Chart from '..';

// time: item?.date,
// timestamp,
// elevator: item?.elevator || 0,
// others: item?.others || 0,
// server: item?.server || 0,
// hvac: (item?.hvac || 0) + (item?.cpms || 0),
// sanitary: item?.sanitary || 0

const BarChart = ({ dataHandler, title, config, endpoint, body = undefined, labelType = 'timestamp' }) => {

    const [hideKeys, setHideKeys] = useState([])

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

    const data = useMemo(() => chartData ? dataHandler(chartData) : [], [chartData?.data])

    useEffect(() => {
        mutate()
    }, [timeframe])

    const isSameDay = useMemo(() => {
        return new Set(data.map(i => dayjs(i.time).format('DD/MM'))).size === 1
    }, [data])


    const labelDate = useCallback((timestamp: number) => {
        switch (timeframe.value) {
            case 'today':
                return `${dayjs(timestamp).format('DD/MM/YYYY')}`
            default:
                return `${dayjs(timestamp).format('DD/MM/YYYY')}`
        }
    }, [timeframe.value, isSameDay])

    const tooltipDate = useCallback((timestamp) => {
        switch (timeframe.value) {
            case 'today':
                return `${dayjs(timestamp).format('DD/MM/YYYY')}`
            default:
                return `${dayjs(timestamp).format('DD/MM/YYYY')}`
        }
    }, [])

    const CustomLegend = (props) => {
        return (
            <div style={{ alignItems: 'center', userSelect: 'none' }}>
                {
                    Object.keys(config).map((key, index) => key !== 'empty' ? (
                        <div
                            style={{ alignItems: 'center', marginRight: '10px', cursor: 'pointer' }}
                            key={`item-${index}`}
                            onClick={e => {
                                setHideKeys(hideKeys.includes(key) ? hideKeys.filter(i => i !== key) : [...hideKeys, key])
                            }}
                        >
                            <div style={{ width: '14px', height: '10px', background: hideKeys.includes(key) ? '#999999' : config[key]?.color, borderRadius: '5px' }} />
                            <span style={{ width: 'max-content', minWidth: 'fit-content', marginLeft: '5px', fontSize: '0.9rem', color: hideKeys.includes(key) ? '#999999' : '#444444' }}>{`${config?.[key]?.title}`}</span>
                        </div>
                    ) : null
                    )
                }
            </div>
        );
    }

    return (
        <Chart
            loading={isValidating}
            title={typeof title === 'string' ? title : title(chartData?.summary)}
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
            <ComposedChart
                data={isValidating ? [] : data.map(i => ({ ...i, x: labelType === 'timestamp' ? i.timestamp : i.x }))}
                margin={{ left: -10, right: 15, top: 20 }}
            >
                <XAxis
                    dataKey="x"
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={labelType === 'timestamp' ? labelDate : null}
                />
                <YAxis
                    tickCount={1}
                    axisLine={false}
                    tickLine={false}
                    fontSize={'10px'}
                />
                <Legend
                    iconType='rect'
                    verticalAlign="bottom"
                    height={40}
                    formatter={(value) => {
                        return <span style={{ color: '#444444' }}>{config[value].title}</span>
                    }}
                    wrapperStyle={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    content={labelType === 'timestamp' ? CustomLegend : null}
                />
                <Tooltip
                    cursor={false}
                    wrapperStyle={{ outline: 'none' }}
                    content={props => CustomizeTooltip({
                        ...props,
                        label: tooltipDate(props.label),
                        color: Object.keys(config).filter(i => !hideKeys.includes(i)).reduce((a, b) => ({ ...a, [b]: config[b].color }), {}),
                        dataFormat: (value, key) => Object.keys(config).reduce((obj, curr) => ({ ...obj, [curr]: config?.[curr]?.formatter ? config?.[curr]?.formatter(value) : value }), {})
                    } as any)}
                />
                <defs>
                    {!isValidating && Object.keys(config).filter(i => !hideKeys.includes(i)).map((key, index) =>
                        <linearGradient
                            key={`${key}-${index}-color`}
                            id={`${key}-color`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                        >
                            <stop offset="5%" stopColor={config[key].color} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={config[key].color} stopOpacity={0.2} />
                        </linearGradient>
                    )}
                </defs>
                {!isValidating && Object.keys(config).filter(i => !hideKeys.includes(i)).map((key, index) =>
                    <Area
                        key={`${key}-${index}`}
                        dot={false}
                        dataKey={key}
                        // barSize={20}
                        // radius={[6, 6, 6, 6]}
                        // stackId={'a'}
                        type="monotone"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill={`url(#${`${key}-color`})`}
                        stroke={config[key].color}
                    />
                )}
            </ComposedChart>
        </Chart>
    );
}

export default BarChart