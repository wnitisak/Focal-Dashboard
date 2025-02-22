
import { useAuth, useOrganizationList } from '@clerk/nextjs'
import { Notify } from 'components/Notify'
import AppContext from 'contexts/App.context'
import { useInterval } from 'hooks'
import { useRouter } from 'next/router'
import { useEffect, useRef } from 'react'

const AppProvider = ({ pageLoading, initialLoading, children }) => {
    const notify = useRef<any>()

    const { userMemberships, isLoaded, setActive, } = useOrganizationList({
        userMemberships: {
            pageSize: 5,
            keepPreviousData: true,
        }
    })

    const { orgId } = useAuth()
    const router = useRouter();

    useEffect(() => {
        initialLoading[1](false)
    }, [])

    useEffect(() => {
        if (!orgId && userMemberships?.data?.length > 0) {
            const organization = userMemberships.data?.[0]?.organization
            setActive({ organization })
            router.push(`/`)
        }
        if (router.pathname.includes('selection') && orgId && userMemberships?.data?.length > 0) router.push('/')
        pageLoading[1](false)
    }, [userMemberships?.data, isLoaded]);

    useInterval(() => {
        if (!orgId && userMemberships?.revalidate) userMemberships?.revalidate()
    }, 500)


    return (
        <AppContext.Provider value={{
            loading: pageLoading,
            notify
        }}>
            <Notify ref={notify} initialLoading={initialLoading[0]} />
            {children}
        </AppContext.Provider>
    )
}

export default AppProvider
