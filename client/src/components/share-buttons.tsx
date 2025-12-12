import {
    FacebookShareButton,
    TwitterShareButton,
    TelegramShareButton,
    WhatsappShareButton,
    FacebookIcon,
    TwitterIcon,
    TelegramIcon,
    WhatsappIcon
} from 'react-share';

interface ShareButtonsProps {
    url: string;
    title: string;
    description?: string;
}

export function ShareButtons({ url, title, description }: ShareButtonsProps) {
    const shareUrl = typeof window !== 'undefined' ? window.location.origin + url : url;

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground mr-2">Ulashish:</span>

            <TelegramShareButton url={shareUrl} title={title}>
                <TelegramIcon size={32} round className="hover:opacity-80 transition-opacity" />
            </TelegramShareButton>

            <FacebookShareButton url={shareUrl} hashtag="#RealNewsUZ">
                <FacebookIcon size={32} round className="hover:opacity-80 transition-opacity" />
            </FacebookShareButton>

            <TwitterShareButton url={shareUrl} title={title}>
                <TwitterIcon size={32} round className="hover:opacity-80 transition-opacity" />
            </TwitterShareButton>

            <WhatsappShareButton url={shareUrl} title={title}>
                <WhatsappIcon size={32} round className="hover:opacity-80 transition-opacity" />
            </WhatsappShareButton>

            <button
                onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    alert('Havola nusxalandi!');
                }}
                className="w-8 h-8 rounded-full bg-gray-600 hover:bg-gray-500 flex items-center justify-center transition-colors"
                title="Havolani nusxalash"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                </svg>
            </button>
        </div>
    );
}
