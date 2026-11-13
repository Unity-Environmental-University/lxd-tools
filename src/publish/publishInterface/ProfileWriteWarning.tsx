import React from "react";
import { Button } from "react-bootstrap";
import Modal from "@/ui/widgets/Modal/index";

interface ProfileWriteWarningProps {
  problems: string[];
  onClose: () => void;
}

export function ProfileWriteWarning({ problems, onClose }: ProfileWriteWarningProps) {
  return (
    <Modal isOpen={problems.length > 0} requestClose={onClose}>
      <h3>Profile was not written</h3>
      <ul>
        {problems.map((problem) => (
          <li key={problem}>{problem}</li>
        ))}
      </ul>
      <Button onClick={onClose}>OK</Button>
    </Modal>
  );
}
