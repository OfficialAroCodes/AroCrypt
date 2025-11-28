import React, { useState } from 'react'

interface ModalAlertBoxProps {
    header: string;
    text_info: string;
    type: number;
    changeable: boolean;
}

const ModalAlertBox: React.FC<ModalAlertBoxProps> = ({ header, text_info, type, changeable }) => {
    const [isInfoBlockOpen, setIsInfoBlockOpen] = useState(false);

    const toggleBox = () => {
        if (changeable) {
            setIsInfoBlockOpen(!isInfoBlockOpen);
        }
    }

    return (
        <div
            className={`info_block ${type === 0 ? "info" : "warning"} ${changeable && 'cp'}  ${isInfoBlockOpen || !changeable ? "open" : ""}`}
            onClick={toggleBox}
        >
            <div className='modal_info_block_textes'>
                <div className='modal_info_top'>
                    <p className='modal_text_header'>
                        {
                            type === 0 ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M224,128a96,96,0,1,1-96-96A96,96,0,0,1,224,128Z" opacity="0.2"></path><path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256"><path d="M215.46,216H40.54C27.92,216,20,202.79,26.13,192.09L113.59,40.22c6.3-11,22.52-11,28.82,0l87.46,151.87C236,202.79,228.08,216,215.46,216Z" opacity="0.2"></path><path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM222.93,203.8a8.5,8.5,0,0,1-7.48,4.2H40.55a8.5,8.5,0,0,1-7.48-4.2,7.59,7.59,0,0,1,0-7.72L120.52,44.21a8.75,8.75,0,0,1,15,0l87.45,151.87A7.59,7.59,0,0,1,222.93,203.8ZM120,144V104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm20,36a12,12,0,1,1-12-12A12,12,0,0,1,140,180Z"></path></svg>
                            )
                        }
                        {header}
                    </p>
                    {
                        changeable && (
                            <div className={`modal_info_top_icon ${isInfoBlockOpen ? "open" : ""}`}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path stroke="none" d="M0 0h24v24H0z" fill="none" /><path d="M6 9l6 6l6 -6" /></svg>
                            </div>
                        )
                    }
                </div>
                <p className="modal_text_info">{text_info}</p>
            </div>
        </div>
    )
}

export default ModalAlertBox