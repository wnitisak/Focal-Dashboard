import { useState } from 'react'
import styles from './Field.module.sass'

interface props extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    title?: string
    titleAlert?: string
    items?: string[]
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const Field = (props: props) => {
    let [file, setFile] = useState<string>('')

    return (
        <div className={`${styles.container} ${props.className ?? ''}`} style={props?.style || {}}>
            {props?.title && <p className={styles.title}>{props?.title}{(props?.required && !props?.disabled) ? <span style={{ color: '#BD1212' }}> *</span> : null}</p>}
            {props?.type === 'select' ?
                <div style={{ alignItems: 'center', flex: '1 1', width: '100%' }}>
                    <select
                        id={props?.name}
                        name={props?.name}
                        required
                        items
                        {...props as any}
                        style={{}}
                        className={styles.input}
                        defaultValue={''}
                    >
                        {props.placeholder && <option value="" hidden style={{ fontSize: '0.9rem', color: '#09090966' }}>{props.placeholder}</option>}
                        {(props?.items || []).map(i => (
                            <option value={i} key={`${props?.name}-${i}`}>{i}</option>
                        ))}
                    </select>
                    <i aria-hidden className={`fa-solid fa-angle-down ${styles.icon}`}></i>
                </div>
                :
                props.type === 'radio' ?
                    <div style={{ width: '100%' }}>
                        {(props?.items || []).map(i => (
                            <div key={`${props?.name}-${i}`} style={{ alignItems: 'center', flex: '1 1', width: '100%' }}>
                                <input
                                    type={props?.type}
                                    id={`${props?.name}-${i}`}
                                    name={props?.name}
                                    value={i}
                                    required
                                    style={{}}
                                    className={styles.input}
                                />
                                <label htmlFor={`${props?.name}-${i}`} >{i}</label>
                            </div>
                        ))}
                    </div>
                    :
                    <div style={{ alignItems: 'center', flex: '1 1', width: '100%' }}>
                        <input
                            type={props?.type}
                            id={props?.name}
                            name={props?.name}
                            required
                            {...props as any}
                            onChange={
                                props.type === 'file' ?
                                    e => {
                                        const [file] = e?.currentTarget?.files
                                        if (file) {
                                            setFile(URL.createObjectURL(file))
                                        }
                                        props.onChange && props.onChange(e)
                                    }
                                    :
                                    props.onChange
                            }
                            style={{}}
                            className={styles.input}
                        />
                        <i aria-hidden className={`fa-solid fa-${props?.type === 'date' ? 'calendar' : 'clock'} ${styles.icon}`}></i>
                        {props.type === 'file' &&
                            <label className={styles.inputFile} htmlFor={props?.name}>
                                {file ?
                                    <img className={styles.previewImage} src={file} />
                                    :
                                    <>
                                        <img className={styles.icon} src="/camera-icon.png" />
                                        <p>Drop <span>image</span> here</p>
                                    </>
                                }
                            </label>
                        }
                    </div>
            }
        </div >
    )
}

export default Field