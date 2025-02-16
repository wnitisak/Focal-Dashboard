import axios, { AxiosRequestConfig, Method } from "axios";

export const api = async (url: string, body?: any, method?: Method, config?: AxiosRequestConfig, isRaw?: boolean) => {
    try {
        let res = (await axios(url, { ...(config || {}), method: method || (body ? 'post' : 'get'), data: body }))
        return ((config || {})?.responseType === 'blob' || isRaw) ? res : res.data
    } catch (err) {
        return ({ resCode: "E502" })
    }
}