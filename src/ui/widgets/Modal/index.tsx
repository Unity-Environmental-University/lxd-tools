import React, {useEffect, useState} from "react";
import {createPortal} from "react-dom";
import "./modal.scss"
// Modal component base from ChatGPT-3.5

interface ModalProps extends React.PropsWithChildren {
    id?: string;
    isOpen: boolean;
    canClose?: boolean;
    requestClose?: () => void | undefined;
}

const Modal: React.FC<ModalProps> = ({id, isOpen, requestClose = undefined, canClose=true, children}) => {

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
        if(canClose && requestClose) requestClose();
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