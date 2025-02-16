import axios from 'axios';
import { nanoid } from 'nanoid';

export const getSignedMediaUrl = async (filename, folder) => {
    let type = filename.split('.').slice(-1)?.[0] || ''
    let key = nanoid()
    const url = "/api/getSignedUrl"
    let bodyReq = {
        folder: folder,
        fileName: `${key}${type ? `.${type}` : ''}`
    }
    try {
        const res = (await axios.post(url, { ...bodyReq })).data
        return res
    } catch (e) {
        console.log(`get signedUrl : ${folder} error`)
        return ''
    }
}


export const uploadingMedia = async (file, uploading, url) => {
    const data = {
        'Content-Type': file.type,
        file: file
    }
    const formData = new FormData();
    for (const name in data) {
        formData.append(name, data[name])
    }
    const config = {
        headers: {
            "x-amz-acl": "public-read",
        },
        onUploadProgress: (event) => {
            uploading[1]({ url: URL.createObjectURL(file), progress: Math.round((100 * event.loaded) / event.total), type: file.type })
        }
    }
    await axios.put(url, file, config)
    uploading[1](undefined)
}