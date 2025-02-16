import { useEffect, useRef } from "react"
import styles from './SearchInput.module.sass'

export const SearchInput = (props) => {
    const searchBox = useRef<HTMLInputElement>()
    let timeout = null

    const keyup = () => {
        clearTimeout(timeout)
        timeout = setTimeout(() => {
            props.searchFunction(searchBox.current.value)
        }, 300)
    }

    const clearHandler = () => {
        searchBox.current.value = ''
        props.searchFunction('')
    }
    useEffect(() => {
        searchBox.current.value = props.defaultValue
    }, [props.defaultValue])

    return (
        <div className={`${styles.container} ${props.className}`}>
            <i aria-hidden className={`fas fa-search ${styles.icon}`}></i>
            <input placeholder={props.placeholder} onKeyUp={() => { keyup() }} ref={searchBox} className={styles.input} required defaultValue={props?.defaultValue} />
            <i aria-hidden className={`fa-solid fa-times-circle ${styles.clearIcon}`} onClick={() => clearHandler()}></i>
        </div>
    )
}

export default SearchInput