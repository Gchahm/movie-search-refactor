import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import {replaceSearchParams} from "@/lib/url";

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

    useEffect(() => {
        replaceSearchParams(router, (params) => {
            if (currentPage && currentPage > 0) {
                params.set('page', String(currentPage));
            } else {
                params.delete('page');
            }
        });
         
    }, [currentPage, pathname, router]);

    return [currentPage, setCurrentPage];
}