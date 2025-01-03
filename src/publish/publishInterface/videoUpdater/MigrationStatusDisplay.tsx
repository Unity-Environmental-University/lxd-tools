import React from 'react';
import {Alert, Spinner, ProgressBar, Card, Row, Col} from 'react-bootstrap';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowRight} from '@fortawesome/free-solid-svg-icons';
import styles from './MigrationStatusDisplay.module.css';
import {KalturaMigrationDetails, KalturaMigrationsState} from "@publish/publishInterface/videoUpdater/data/types"; // Import the CSS module

type MigrationStatus = KalturaMigrationsState['status']

interface MigrationStatusDisplayProps {
    status: MigrationStatus;
    error?: string;
    migrations: Record<string, KalturaMigrationDetails>;
}

const MigrationStatusDisplay: React.FC<MigrationStatusDisplayProps> = ({status, error, migrations}) => {
    const totalMigrations = Object.keys(migrations).length;
    const completedMigrations = React.useMemo(() =>
            Object.values(migrations).filter(m => m.status === 'successful').length,
        [migrations]
    );
   // const pendingMigrations = totalMigrations - completedMigrations;
    const steps = [
        {label: 'Scan Pages or Assignments', key: 'initial_scan'},
        {label: 'Scanning in Progress', key: 'scanning'},
        {label: 'Scan Succeeded', key: 'scan_succeeded'},
        {label: 'Pending Individual Migrations', key: 'pending_individual_migrations'},
        {label: 'Migrations Finished', key: 'migrations_finished'},
    ];

    const getStepStyle = (stepKey: string) => {
        if (status === stepKey) return styles['status-in-progress'];
        if (steps.findIndex(step => step.key === stepKey) < steps.findIndex(step => step.key === status))
            return styles['status-completed'];

        const style = styles['status-pending']; // default style
        console.log(`Status: ${status}, StepKey: ${stepKey}, Style: ${style}`);
        return style;
    };

    console.log(`Current status: ${status}, Migrations: ${JSON.stringify(migrations)}`);
    const progressNow = totalMigrations > 0 ? (completedMigrations / totalMigrations) * 100 : 0;

    return (
        <Card className={styles['status-card']}>
            <Card.Body>
                <h5>Migration Status</h5>
                <div role="status" aria-live="polite">
                    <Row className="text-center">
                        {steps.map((step, index) => (
                            <Col key={step.key} xs={3} className="position-relative" style={{padding: '10px'}}>
                                <div className={`${styles['status-box']} ${getStepStyle(step.key)}`}>
                                    <span style={{fontSize: '14px'}}>{step.label}</span>
                                    {status === step.key && (
                                        <>
                                            {status === 'initial_scan' && <Spinner animation="border" size="sm"/>}
                                            {status === 'scanning' && <Spinner animation="border" size="sm"/>}
                                            {status === 'pending_individual_migrations' && (
                                                <span className="text-warning"> (User action required!)</span>
                                            )}
                                        </>
                                    )}
                                </div>
                                {index < steps.length - 1 && (
                                    <div className={styles.arrow}>
                                        <FontAwesomeIcon icon={faArrowRight} size="lg"/>
                                    </div>
                                )}
                            </Col>
                        ))}
                    </Row>
                </div>
                {error && <Alert variant="danger" className={styles['error-alert']}>{error}</Alert>}
                <ProgressBar now={progressNow} label={`${completedMigrations}/${totalMigrations}`}
                             className={styles['progress-bar']}/>
            </Card.Body>
        </Card>
    );
};

export default MigrationStatusDisplay;
