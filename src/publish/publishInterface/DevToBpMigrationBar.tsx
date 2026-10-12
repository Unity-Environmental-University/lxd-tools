import { genCourseMigrationProgress, IProgressData } from "@ueu/ueu-canvas/course/migration";
import { Course } from "@ueu/ueu-canvas/course/Course";
import { useState } from "react";
import { useEffectAsync } from "../../ui/utils";
import { Button, Col, Row } from "react-bootstrap";
import { SavedMigration } from "@ueu/ueu-canvas/course/migration/migrationCache";

type MigrationBarProps = {
  migration: SavedMigration;
  onFinishMigration?: (migration: SavedMigration, callbacks?: { setFinishStatus: (s: string) => void; setFinishCompletion: (n: number) => void }) => any;
  course: Course;
};

export function DevToBpMigrationBar({ migration, onFinishMigration }: MigrationBarProps) {
  const [progress, setProgress] = useState<IProgressData>();
  const [finishStatus, setFinishStatus] = useState<string>("");
  const [finishCompletion, setFinishCompletion] = useState<number>(0);

  useEffectAsync(async () => {
    const progressGen = genCourseMigrationProgress(migration, 2500);
    for await (const progress of progressGen) {
      setProgress(progress);
    }
  }, [migration]);

  const displayStatus = finishStatus || progress?.workflow_state;
  const displayCompletion = finishCompletion || progress?.completion;

  const handleFinish = async () => {
    if (onFinishMigration) {
      await onFinishMigration(migration, { setFinishStatus, setFinishCompletion });
    }
  };

  return (
    <Row>
      <Col sm={4} style={{ fontSize: "0.75em" }}>
        <Row>Status: {displayStatus}</Row>
        <Row>Started: {migration.started_at}</Row>
      </Col>
      <Col sm={3}>{displayCompletion ? `${displayCompletion}%` : ""}</Col>
      <Col sm={5}>
        {progress?.workflow_state === "completed" && !finishStatus && (
          <Button onClick={handleFinish}>Finish Migration</Button>
        )}
        {finishStatus && (
          <span style={{ fontSize: "0.75em" }}>{finishStatus}</span>
        )}
      </Col>
    </Row>
  );
}
