import React, {useEffect, useState} from "react";
import {createPortal} from "react-dom";

// Modal component base from ChatGPT-3.

interface ModalProps extends React.PropsWithChildren {
    id?: string;
    isOpen: boolean;
    canClose?: boolean;
    requestClose: () => void;
}

const Modal: React.FC<ModalProps> = ({id, isOpen, requestClose, canClose=true, children}) => {

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
        if(canClose) requestClose();
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
                    className={`lxd-modal`}
                    onClick={handleBackdropClick}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                >
                    <div className="modal-content" id={id}  role="document">
                        <div className="modal-body">{children}</div>
                    </div>
                </div>
                , document.body)}
        </>
    );
};

export default Modal