import { SignIn } from "@clerk/nextjs";

export default function Page() {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <SignIn
                signUpUrl="" // Disable sign-up redirect
                appearance={{
                    elements: {
                        footerActionLink: "hidden"
                    }
                }}
            />
        </div>
    )
}