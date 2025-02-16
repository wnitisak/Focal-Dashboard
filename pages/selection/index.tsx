import { OrganizationList, useSession } from "@clerk/nextjs";

export default function Page() {
    const { session } = useSession()
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {(!session || session?.user?.organizationMemberships?.length > 0) ?
                <OrganizationList
                    hidePersonal={true}
                    afterSelectOrganizationUrl={'/dashboard'}
                />
                :
                <div
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}
                >
                    You are not allowed to see this section.
                </div>
            }
        </div>
    )
}