import { OrganizationProfile, Protect } from "@clerk/nextjs"
import { useRouter } from "next/router"


const Users = () => {

    const router = useRouter()

    return (
        <Protect
            permission="org:management:allow"
            fallback={
                <div
                    style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', flexDirection: 'column' }}
                >
                    You are not allowed to see this section.
                    <button
                        style={{
                            marginTop: '20px',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '5px 12px',
                            border: 'none',
                            backgroundColor: '#0C2756',
                            color: '#ffffff',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            cursor: 'pointer',
                        }}
                        onClick={(e) => {
                            e.stopPropagation()
                            router.push('/')
                        }}
                    >
                        Go back
                    </button>
                </div >
            }
        >
            <div style={{ width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', padding: '50px 10px 10px' }}>
                <OrganizationProfile
                />
            </div>
        </Protect >
    )
}

export default Users
