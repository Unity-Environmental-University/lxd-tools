export type UiHandlerProps = {
    popUp: (title: string, body: string) => any,
    popClose: () => any,
    showError: (e: ErrorEvent) => any,
}