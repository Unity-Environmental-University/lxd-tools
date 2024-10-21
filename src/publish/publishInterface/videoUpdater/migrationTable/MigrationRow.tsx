// MigrationRow.tsx
import React, { useState } from 'react';
import { MigrationRowData } from './MigrationRowData'; // Adjust import path as needed
import styles from './MigrationRow.module.css';
import { IAssignmentData } from "@canvas/content/assignments/types";
import { IPageData } from "@canvas/content/pages/types";
import { KalturaMigrationDetails } from "@publish/publishInterface/videoUpdater/data/types";
import { migrationStart } from "@publish/publishInterface/videoUpdater/data/actions/migrationStarts";
import { useDispatch } from "react-redux";
import transformToMigrationRowData from "@publish/publishInterface/videoUpdater/migrationTable/transformToMigrationRowData";
import { KalturaAppDispatch } from "@publish/publishInterface/videoUpdater/data/store";

// Define the props interface for MigrationRow
interface MigrationRowProps {
    rowData: IAssignmentData | IPageData | KalturaMigrationDetails;
}

const MigrationRow: React.FC<MigrationRowProps> = ({ rowData }) => {
    const [isAccordionOpen, setAccordionOpen] = useState(false);
    const dispatch = useDispatch<KalturaAppDispatch>();
    const migrationData = transformToMigrationRowData(rowData);

    const toggleAccordion = () => setAccordionOpen(prev => !prev);

    const formatDate = (date: Date | undefined) => {
        if (!date) return 'N/A';
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        };
        return date.toLocaleDateString(undefined, options);
    };

    return (
        <div className={styles.migrationRow}>
            <div className={styles.gridContainer}>
                <div className={styles.gridItem}><strong>Short Name:</strong> {migrationData.shortName}</div>
                <div className={styles.gridItem}><strong>Status:</strong> {migrationData.status}</div>
                <div className={styles.gridItem}>
                    <strong>Progress:</strong>
                    <div className={styles.progressBarContainer}>
                        <div className={styles.progressBar} style={{ width: `${migrationData.progress}%` }} />
                    </div>
                    <span>{migrationData.progress}%</span>
                </div>
                <div className={styles.gridItem}><strong>Start Time:</strong> {formatDate(migrationData.startTime)}</div>
                {migrationData.endTime && (
                    <div className={styles.gridItem}><strong>End Time:</strong> {formatDate(migrationData.endTime)}</div>
                )}
                {migrationData.error && (
                    <div className={styles.gridItem}><strong>Error:</strong> {migrationData.error}</div>
                )}
                <div className={styles.gridItem}>
                    <strong>Source URL:</strong>
                    <a href={migrationData.sourceUrl} target="_blank" rel="noopener noreferrer">{migrationData.sourceUrl}</a>
                </div>
                <div className={styles.gridItem}>
                    {/*<strong>Destination URL:</strong>*/}
                    {/*<a href={migrationData.destinationUrl} target="_blank" rel="noopener noreferrer">{migrationData.destinationUrl}</a>*/}
                </div>
                {migrationData.additionalInfo && (
                    <div className={styles.gridItem}>
                        <strong>Additional Info:</strong> {migrationData.additionalInfo}
                    </div>
                )}
            </div>
            <button onClick={toggleAccordion} className={styles.accordionToggle} aria-expanded={isAccordionOpen}>
                {isAccordionOpen ? 'Hide Details' : 'Show Details'}
            </button>
            {isAccordionOpen && (
                <div className={styles.accordionContent}>
                    <h5>Detailed Migration Information</h5>
                    <p>Here you can put additional details relevant to the migration.</p>
                </div>
            )}
            <button onClick={() => dispatch(migrationStart(rowData))} className={styles.migrateButton}>
                Start Migration
            </button>
        </div>
    );
};

export default MigrationRow;
