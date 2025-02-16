import { useRouter } from 'next/router';
import { useMemo, useState } from 'react';
import { Cell, Legend, Pie, PieChart as PieChartRechart, ResponsiveContainer, Tooltip } from 'recharts';
import Chart from '..';
import CustomizeTooltip from '../ChartTooltip';

const PieChart = ({ config, title = '', data = {}, timeframe = '' }: any) => {
    const [hideKeys, setHideKeys] = useState([])
    const router = useRouter()
    const chartData = useMemo(() => {
        return Object.keys(config).map(key => ({ name: key, value: data?.[key] ?? 0 }))
    }, [data, hideKeys])

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
            style={{
                padding: '0 0'
            }}
            title={title}
        >
            <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <ResponsiveContainer width={'100%'} height={'100%'}>
                    <PieChartRechart width={180} height={180} >
                        <Tooltip
                            cursor={false}
                            wrapperStyle={{ outline: 'none', zIndex: 1 }}
                            content={props => CustomizeTooltip({
                                ...props,
                                label: props.label,
                                color: {
                                    value: config[props?.payload?.[0]?.name]?.color
                                },
                                dataFormat: (value) => ({
                                    value: `${value?.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })} คน ( ${(value * 100 / +Object.values(data).reduce((a, b) => +a + +(b || 0), 0)).toFixed(1)}  %)`,
                                })
                            } as any)}
                        />
                        <Pie
                            animationBegin={0}
                            dataKey="value"
                            data={chartData.filter(i => !hideKeys.includes(i.name) && i.value !== 0)}
                            // innerRadius={70}
                            cornerRadius={8}
                            outerRadius={90}
                        >
                            {chartData.filter(i => !hideKeys.includes(i.name) && i.value !== 0).map((item, index) => (
                                <Cell style={{ outline: 'none' }} key={`cell-${index}`} fill={config[item.name].color} />
                            ))}
                        </Pie>
                        <Legend
                            iconType='rect'
                            verticalAlign="bottom"
                            formatter={(value) => {
                                return <span style={{ color: '#444444' }}>{config?.[value]?.title}</span>
                            }}
                            wrapperStyle={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}
                            content={CustomLegend}
                        />
                    </PieChartRechart>
                </ResponsiveContainer >
            </div>
        </Chart>
    );
}

export default PieChart