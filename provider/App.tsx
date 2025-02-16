
import { Notify } from 'components/Notify'
import AppContext from 'contexts/App.context'
import { useEffect, useRef, useState } from 'react'

const AppProvider = ({ pageLoading, children }) => {
    const s3Client = useRef<any>()
    const [credentials, setCredentials] = useState<any>(null)
    const notify = useRef<any>()

    useEffect(() => {
        (async () => {
            pageLoading[1](true)
            // let res = await api(`/api/getAccessParams`)
            // setCredentials(res?.credentials)
            // s3Client.current = new S3Client({
            //     region: "ap-southeast-1",
            //     credentials: res?.credentials
            // })
            pageLoading[1](false)
        })()
    }, [])

    return (
        <AppContext.Provider value={{
            credentials,
            s3Client: s3Client.current,
            loading: pageLoading,
            notify
        }}>
            <Notify ref={notify} />
            {children}
        </AppContext.Provider>
    )
}

export default AppProvider
