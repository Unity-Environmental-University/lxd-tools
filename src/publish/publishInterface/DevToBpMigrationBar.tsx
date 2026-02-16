import { genCourseMigrationProgress, IProgressData } from "@ueu/ueu-canvas";
import { Course } from "@ueu/ueu-canvas";
import { useState } from "react";
import { useEffectAsync } from "../../ui/utils";
import { Button, Col, Row } from "react-bootstrap";
import { SavedMigration } from "@ueu/ueu-canvas";

type MigrationBarProps = {
  migration: SavedMigration;
  onFinishMigration?: (migration: SavedMigration) => any;
  course: Course;
};

export function DevToBpMigrationBar({ migration, course, onFinishMigration }: MigrationBarProps) {
  const [progress, setProgress] = useState<IProgressData>();

  useEffectAsync(async () => {
    const progressGen = genCourseMigrationProgress(migration, 2500);
    for await (const progress of progressGen) {
      setProgress(progress);
    }
  }, [migration]);

  return (
    <Row>
      <Col sm={4} style={{ fontSize: "0.75em" }}>
        <Row>Status: {progress?.workflow_state}</Row>
        <Row>Started: {migration.started_at}</Row>
      </Col>
      <Col sm={3}>{progress?.completion ? `${progress.completion}%` : ""}</Col>
      <Col sm={5}>
        {progress?.workflow_state === "completed" && (
          <Button onClick={(e) => onFinishMigration && onFinishMigration(migration)}>Finish Migration</Button>
        )}
      </Col>
    </Row>
  );
}
