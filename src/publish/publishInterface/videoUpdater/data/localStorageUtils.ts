import {KalturaMigrationsState} from "@publish/publishInterface/videoUpdater/data/types";

export const saveMigrationsToLocalStorage = (migrations: KalturaMigrationsState) => {
    localStorage.setItem('migrations', JSON.stringify(migrations));
};

export const getMigrationsFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem('migrations') ?? '[]') || [];
};