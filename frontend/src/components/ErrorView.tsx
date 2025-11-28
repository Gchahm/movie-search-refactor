

type ErrorViewProps = {
    message: string;
}

export const ErrorView = ({message}: ErrorViewProps) => {

    return (
        <div className="text-center py-12">
            <p className="text-xl text-muted-foreground">{message}</p>
        </div>
    )
}