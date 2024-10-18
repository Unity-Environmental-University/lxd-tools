// MigrationStatusDisplay.test.tsx
import React from 'react';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import MigrationStatusDisplay from '../MigrationStatusDisplay';
import { KalturaMigrationDetails } from "@publish/publishInterface/videoUpdater/data/types";

describe('MigrationStatusDisplay', () => {
    // Use a defined structure based on the KalturaMigrationDetails interface
    const mockMigrations: Record<string, KalturaMigrationDetails> = {
        migration1: { status: 'successful' } as KalturaMigrationDetails,
        migration2: { status: 'failed' } as KalturaMigrationDetails,
        migration3: { status: 'pending' } as KalturaMigrationDetails,
    };

    test('renders migration status with no errors', () => {
        render(<MigrationStatusDisplay status="scan_succeeded" migrations={mockMigrations} />);

        // Check the heading
        expect(screen.getByText(/Migration Status/i)).toBeInTheDocument();

        // Check the steps
        expect(screen.getByText(/Scan Pages or Assignments/i)).toBeInTheDocument();
        expect(screen.getByText(/Scanning in Progress/i)).toBeInTheDocument();
        expect(screen.getByText(/Scan Succeeded/i)).toBeInTheDocument();
        expect(screen.getByText(/Pending Individual Migrations/i)).toBeInTheDocument();
        expect(screen.getByText(/Migrations Finished/i)).toBeInTheDocument();

        // Check the progress bar
        expect(screen.getByText('1/3')).toBeInTheDocument();
    });

    test('renders error message when provided', () => {
        const errorMessage = "Migration failed due to an unexpected error.";
        render(<MigrationStatusDisplay status="pending_individual_migrations" error={errorMessage} migrations={mockMigrations} />);

        // Check for the error alert
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    test('shows spinner for current status', () => {
        render(<MigrationStatusDisplay status="initial_scan" migrations={mockMigrations} />);

        // Check for the spinner in the first step
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    test('shows the correct classes for each step based on status', () => {
        const { container } = render(<MigrationStatusDisplay status="scanning" migrations={mockMigrations} />);
        console.log(container.innerHTML)
        console.log(Array.from(container.getElementsByClassName('statusBox')).map(a => a.innerHTML));
        // Check that the second step is in progress
        expect(container.getElementsByClassName('statusBox').item(1)).toHaveClass('inProgress');

        // Check that the first step is completed
        expect(container.getElementsByClassName('statusBox').item(0)).toHaveClass('completed');

        // Check that the rest are pending
        expect(container.getElementsByClassName('statusBox').item(2)).toHaveClass('pending');
        expect(container.getElementsByClassName('statusBox').item(3)).toHaveClass('pending');
        expect(container.getElementsByClassName('statusBox').item(4)).toHaveClass('pending');
    });

    test('renders correctly with no migrations', () => {
        render(<MigrationStatusDisplay status="migrations_finished" migrations={{}} />);

        // Check that the progress bar shows 0/0
        expect(screen.getByText('0/0')).toBeInTheDocument();
    });
});
