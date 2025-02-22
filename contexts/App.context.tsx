
import { createContext } from 'react'

type AppContextType = {
    loading: [boolean, any]
    notify: any
}

export default createContext<Partial<AppContextType>>({})