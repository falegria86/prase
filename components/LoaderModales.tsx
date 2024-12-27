import { SyncLoader } from "react-spinners"

export const LoaderModales = () => {
    return (
        <div className="w-full h-[300px] flex justify-center items-center">
            <SyncLoader size={8} color="#9ca3af" />
        </div>
    )
}
