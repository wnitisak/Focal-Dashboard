import { forwardRef, InputHTMLAttributes, MouseEvent, useEffect, useImperativeHandle, useRef, useState } from 'react'
import styles from './Checkbox.module.sass'

interface CheckBoxProps extends InputHTMLAttributes<HTMLInputElement> {
    name?: string
    check?: (value: boolean) => void
}
const Checkbox = forwardRef(({ onChange = null, defaultValue = false, name = null, ...props }: any, ref) => {
    const [state, setState] = useState(defaultValue)
    const inputRef = useRef<HTMLInputElement>()
    // const setCheck = (state) => {
    //     inputRef.current.checked = false
    // }
    useImperativeHandle(ref, () => ({
        check: (value: boolean) => {
            inputRef.current.checked = value
            setState(value)
        },
        value: state
    }))
    const change = (e: MouseEvent<HTMLLabelElement>) => {
        if (props.disabled) return
        inputRef.current.checked = !state
        setState(!state)
        if (onChange) onChange(!state)
    }
    useEffect(() => {
        inputRef.current.checked = defaultValue
    }, [defaultValue])
    return (
        <label
            onMouseDown={change}
            className={`${styles.checkbox} ${state ? styles.active : ''} ${props.disabled ? styles.disabled : ''} ${props.className || ''}`}
            style={{
                ...(state && props?.color ?
                    { background: props?.color }
                    :
                    {}
                ),
                ...(props.size ?
                    { minHeight: `${props.size}px`, minWidth: `${props.size}px` }
                    :
                    {}
                )
            }}
        >
            <input {...props} ref={inputRef} name={name} defaultChecked={state} type="checkbox" />
            <i
                aria-hidden
                className="fas fa-check"
                style={{
                    ...(props.size ?
                        { fontSize: `${props.size * 0.45}px` }
                        :
                        {}
                    )
                }}
            ></i>
        </label>
    )
})

export default Checkbox
