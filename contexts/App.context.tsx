
import { createContext } from 'react'

type AppContextType = {
    loading: [boolean, any]
    credentials: any
    s3Client: any
    notify: any
}

export default createContext<Partial<AppContextType>>({})