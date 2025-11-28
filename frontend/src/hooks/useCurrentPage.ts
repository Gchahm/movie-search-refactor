import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";


export const useCurrentPage = (): [number, Dispatch<SetStateAction<number>>] => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [currentPage, setCurrentPage] = useState(1);

    // Sync local state from URL (supports back/forward navigation)
    useEffect(() => {
        const pageParam = searchParams?.get('page');
        const pageFromUrl = pageParam ? parseInt(pageParam, 10) : 1;

        if (Number.isFinite(pageFromUrl) && pageFromUrl >= 1 && pageFromUrl !== currentPage) {
            setCurrentPage(pageFromUrl);
        }
    }, [searchParams, currentPage]);

    // Push local state to URL when page changes
    useEffect(() => {
        const params = new URLSearchParams(searchParams?.toString());

        if (currentPage && currentPage > 0) {
            params.set('page', String(currentPage));
        } else {
            params.delete('page');
        }

        const next = params.toString();
        const current = searchParams?.toString() ?? '';
        if (next !== current) {
            const url = next ? `${pathname}?${next}` : pathname;
            router.replace(url);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, pathname, router]);

    return [currentPage, setCurrentPage];
}