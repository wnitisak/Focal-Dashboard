import dayjs from 'dayjs'
import 'dayjs/locale/th'
var buddhistEra = require('dayjs/plugin/buddhistEra')
var customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(buddhistEra)
dayjs.extend(customParseFormat)

export const formatDate = (timestamp: number) => {
    return dayjs(timestamp).format(`DD/MM/${'YYYY'}`)
}

export const formatMonth = (timestamp: number) => {
    return dayjs(timestamp).format(`MMMM ${'YYYY'}`)
}

export const formatYear = (timestamp?: number) => {
    return dayjs(timestamp).format(`${'YYYY'}`)
}


export const formatDateTime = (timestamp: number) => {
    return dayjs(timestamp).format(`DD/MM/${'YYYY'} เวลา HH:mm`)
}

export const phaseFormatDate = (string: string, formats?: string[]) => {
    let buffer = string.split(string.includes('/') ? '/' : '-')
    let date = buffer.shift()
    string = ['01', ...buffer].join(string.includes('/') ? '/' : '-')
    let value = formats?.length > 0 ? dayjs(string, formats, true) : dayjs(string)
    return value.date(+date)
}

export const formatShortenDateTime = (timestamp: number) => dayjs(timestamp).format(`D MMM, HH:mm`)

export const getCurrentDate = () => new Date().toISOString().split("T")[0]