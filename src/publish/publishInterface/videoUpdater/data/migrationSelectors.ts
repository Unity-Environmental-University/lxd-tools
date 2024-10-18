import {KalturaMigrationsState} from "@publish/publishInterface/videoUpdater/data/types";


export const selectKalturaStatus = (state: { kaltura: KalturaMigrationsState }) => {
    return {
        status: state.kaltura.status,
        error: state.kaltura.error,
        migrations: state.kaltura.migrations
    };
};