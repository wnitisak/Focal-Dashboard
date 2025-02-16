import Field from "components/Field"
import { useRef, useState } from "react"
import styles from './FieldEditor.module.sass'


const FieldEditor = (props) => {
    const editing = useState<boolean>(false)
    const formRef = useRef<HTMLFormElement>()
    return (
        <form
            ref={formRef}
            className={styles.formContainer}
            onSubmit={async e => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget);
                let submit: any = {}
                formData.forEach((value, key) => {
                    submit = { ...submit, [key.split('.')?.[0]]: value }
                })
                props.saveHandler && await props.saveHandler(submit)
                editing[1](false)
            }}
        >
            {
                editing[0] ?
                    <Field {...props} />
                    :
                    <span style={{ width: '100%', wordBreak: 'break-all' }}>{props?.defaultValue || ''}</span>
            }
            <div className={styles.editContainer}>
                {editing[0] ?
                    <>
                        <button>
                            <i aria-hidden className={`fa-solid fa-circle-check ${styles.confirmIcon}`}></i>
                        </button>
                        <i aria-hidden className={`fa-solid fa-times-circle ${styles.cancelIcon}`} onClick={() => editing[1](false)}></i>
                    </>
                    :
                    <i aria-hidden className={`fa-solid fa-pen-to-square ${styles.editIcon}`} onClick={e => { editing[1](true) }}></i>
                }
            </div>
        </form>
    )
}

export default FieldEditor