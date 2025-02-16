import { useEffect } from "react"

export interface props {

}

const Page404 = ({ }: props) => {
    useEffect(() => {
        window.location.href = '/'
    })
    return null
}
export default Page404
