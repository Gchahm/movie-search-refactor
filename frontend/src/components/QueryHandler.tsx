import {UseQueryResult} from "@tanstack/react-query";
import {ErrorView} from "@/components/ErrorView";
import {JSX} from "react";


export type QueryHandlerProps<T> = {
    queryResult: UseQueryResult<T>;
    loadingText: string;
    pendingTitle: string;
    pendingDescription: string;
    errorTitle: string;
    children: (data: T) => JSX.Element;
}

export function QueryHandler<T>(props: QueryHandlerProps<T>) {
    const {queryResult, loadingText, pendingTitle, pendingDescription, errorTitle, children} = props;

    const {isLoading, isPending, isError, data} = queryResult;

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div
                    className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-primary border-r-transparent"/>
                <p className="mt-4 text-muted-foreground">{loadingText}</p>
            </div>
        )
    }

    if (isPending) {
        return (
            <div className="text-center py-12">
                <h2 className="text-2xl font-semibold mb-2">{pendingTitle}</h2>
                <p className="text-muted-foreground">
                    {pendingDescription}
                </p>
            </div>
        )
    }

    if (isError) {
        return <ErrorView message={errorTitle}/>
    }

    return children(data);

}