
import { useState, useRef } from "react";
import CustomImage from "@/components/Utility/CustomImage";
import Bookmark from "@/components/Card/Bookmark";
import { dateFormate } from "@/lib/helpers";


interface BingeWatchCardProps {
    key: any;
    blogID?: any;
    duration?: string;
    coverImg: any;
    videoId: string;
    title: string;
    date: string;
    initialBookmarked?: boolean;
    onBookmarkToggle?: (bookmarked: boolean) => void;
}

export default function BingeWatchCard({
    key,
    coverImg,
    blogID,
    videoId,
    duration,
    title,
    date,
    initialBookmarked = false,
    onBookmarkToggle,
}: BingeWatchCardProps) {
    const [bookmarked, setBookmarked] = useState(initialBookmarked);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const handleBookmarkClick = () => {
        setBookmarked((prev) => {
            const next = !prev;
            if (onBookmarkToggle) onBookmarkToggle(next);
            return next;
        });
    };
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const videoBase = `https://www.youtube.com/embed/${videoId}`;
    const handleMouseEnter = () => {
        if (iframeRef.current) {
            iframeRef.current.src = `${videoBase}?autoplay=1&controls=0&mute=1&enablejsapi=1&origin=${origin}`;
        }
    };
    const handleMouseLeave = () => {
        if (iframeRef.current) {
            iframeRef.current.src = `${videoBase}?controls=0&mute=1&enablejsapi=1&origin=${origin}`;
        }
    };

    return (
        <div className="w-full max-w-full overflow-hidden rounded bg-white shadow-sm binge-watch-card">
            {/* Image Section */}
            <div
                className="relative cursor-pointer card-thubnail"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
            >
                <div className="cover-img-wraper relative z-1">
                    <CustomImage
                        src={coverImg}
                        width={400}
                        height={190}
                        alt={"Cover Image"}
                        className="w-full !h-[190px] object-cover cover-img"
                    />
                    <div className="absolute !right-3 bottom-3">
                        <div className=" h-13 w-13">
                            <CustomImage
                                src='/images/play-icon.png'
                                width={53}
                                height={53}
                                alt={"Play Icon"}
                                className="w-13 h-13"
                            />
                        </div>
                    </div>
                </div>
                <iframe
                    ref={iframeRef}
                    className="w-full h-[190px] ifram-video absolute top-0 left-0"
                    width="560"
                    height="315"
                    src={`${videoBase}?controls=0&mute=1&enablejsapi=1&origin=${origin}`}
                    title="YouTube video player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                ></iframe>
            </div>
            {/* Content */}
            <div className="p-4 bg-[#EDEDED]">
                <h3 className="text-base font-semibold text-black line-clamp-2 text-left min-h-12">
                    {title}
                </h3>
                <div className="mt-2 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                        {(() => {
                            const formattedDate = dateFormate(date);
                            const isInvalidDate = formattedDate.toLowerCase().includes('invalid') || formattedDate.toLowerCase().includes('nan');

                            return (
                                <>
                                    {!isInvalidDate && <span>{formattedDate}&nbsp;</span>}
                                    {duration && (
                                        <div className="flex items-center gap-1" style={{ color: '#9D9D9D', fontFamily: 'Manrope, sans-serif', fontWeight: 400, fontSize: '14px' }}>
                                            {!isInvalidDate && <span>•</span>}
                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M8.5 4.66602C8.5 4.53341 8.44732 4.40623 8.35355 4.31246C8.25979 4.21869 8.13261 4.16602 8 4.16602C7.86739 4.16602 7.74022 4.21869 7.64645 4.31246C7.55268 4.40623 7.5 4.53341 7.5 4.66602V7.99935C7.49996 8.08412 7.52148 8.16751 7.56253 8.24168C7.60358 8.31585 7.66282 8.37836 7.73467 8.42335L9.73467 9.67335C9.84712 9.74372 9.98292 9.76654 10.1122 9.73678C10.1762 9.72205 10.2367 9.69485 10.2902 9.65674C10.3437 9.61864 10.3892 9.57036 10.424 9.51468C10.4588 9.459 10.4824 9.397 10.4933 9.33223C10.5041 9.26745 10.5022 9.20117 10.4874 9.13716C10.4727 9.07314 10.4455 9.01266 10.4074 8.95916C10.3693 8.90566 10.321 8.86019 10.2653 8.82535L8.5 7.72202V4.66602Z" fill="#919191" />
                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M8.0013 2.16602C6.45421 2.16602 4.97047 2.7806 3.87651 3.87456C2.78255 4.96852 2.16797 6.45225 2.16797 7.99935C2.16797 9.54645 2.78255 11.0302 3.87651 12.1241C4.97047 13.2181 6.45421 13.8327 8.0013 13.8327C9.5484 13.8327 11.0321 13.2181 12.1261 12.1241C13.2201 11.0302 13.8346 9.54645 13.8346 7.99935C13.8346 6.45225 13.2201 4.96852 12.1261 3.87456C11.0321 2.7806 9.5484 2.16602 8.0013 2.16602ZM3.16797 7.99935C3.16797 7.36463 3.29299 6.73612 3.53588 6.14971C3.77878 5.56331 4.1348 5.03048 4.58362 4.58167C5.03244 4.13285 5.56526 3.77683 6.15167 3.53393C6.73807 3.29103 7.36658 3.16602 8.0013 3.16602C8.63602 3.16602 9.26453 3.29103 9.85094 3.53393C10.4373 3.77683 10.9702 4.13285 11.419 4.58167C11.8678 5.03048 12.2238 5.56331 12.4667 6.14971C12.7096 6.73612 12.8346 7.36463 12.8346 7.99935C12.8346 9.28123 12.3254 10.5106 11.419 11.417C10.5126 12.3235 9.28318 12.8327 8.0013 12.8327C6.71942 12.8327 5.49005 12.3235 4.58362 11.417C3.67719 10.5106 3.16797 9.28123 3.16797 7.99935Z" fill="#919191" />
                                            </svg>
                                            {duration} mins watch
                                        </div>
                                    )}
                                </>
                            );
                        })()}
                    </div>
                    {/* <button className="bookmark-icon" onClick={handleBookmarkClick}>
                        {bookmarked ? (
                            <>
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" color="#00B2ED" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M2 2v13.5a.5.5 0 0 0 .74.439L8 13.069l5.26 2.87A.5.5 0 0 0 14 15.5V2a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path></svg>
                            </>
                        ) : (
                            <span className="cursor-pointer">
                                <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 16 16" color="#00B2ED" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5V2zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1H4z"></path></svg>
                            </span>
                        )}
                    </button> */}
                    <div className="ml-auto">
                        <Bookmark blogId={blogID} isBingewatchMark={true} />
                    </div>
                </div>
            </div>
        </div>
    );
}
