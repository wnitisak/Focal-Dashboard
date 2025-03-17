import { NextApiRequest, NextApiResponse } from "next"
const SUFFIX = process.env.VERCEL_ENV === "production" ? '' : '-dev'


export default async (req: NextApiRequest, res: NextApiResponse) => {
    const { index, offset = 0, company }: any = req.query
    let data = undefined
    try {
        let url = `http://157.245.146.38/indexes/registrations/search`
        let body = { ...req.body, offset: Number(offset) }
        let headers = {
            'Authorization': `Bearer MzlhMTY0NDM0MTgwMjUwNGM5ZjQ5OThi`
        }
        // data = (await axios.post(url, body, { headers }))?.data
        data = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...headers
            },
            body: JSON.stringify(body)
        }).then(response => response.json())
    } catch (err) {
        console.log({ ...req.body, offset: Number(offset) })
        console.log(err?.code);
        console.log(err);
        console.log(err?.config?.data);
    }
    return res.status(200).json(data || {
        estimatedTotalHits: 0,
        isError: true,
        hits: [],
        limit: req.body?.limit || 20,
        offset: 0,
        processingTimeMs: 0
    })
}
// export const config = {
//     api: {
//         responseLimit: '8mb'
//     },
// }