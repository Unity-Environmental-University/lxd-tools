import React, {useEffect, useState} from "react";
import {createPortal} from "react-dom";

// modal component base from ChatGPT-3.

interface ModalProps extends React.PropsWithChildren {
    id?: string,
    isOpen: boolean;
    requestClose: () => void;
}

const Modal: React.FC<ModalProps> = ({id, isOpen, requestClose, children}) => {
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                handleClose();
            }
        };

        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, []);

    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setIsClosing(false);
            requestClose();
        }, 300); // Adjust the duration to match your CSS transition duration
    };

    const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        if (event.target === event.currentTarget) {
            handleClose();
        }
    };

    return (
        <>
            {isOpen && createPortal(
                <div
                    className={`lxd-modal ${isClosing ? 'closing' : ''}`}
                    onClick={handleBackdropClick}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="modal-content container" id={id}  role="document">
                        <div className="modal-body">{children}</div>
                    </div>
                </div>
                , document.body)}
        </>
    );
};

export default Modal