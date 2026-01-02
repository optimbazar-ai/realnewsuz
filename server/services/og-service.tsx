import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { Article } from '@shared/schema';
import React from 'react';

// Fetch font lazily
let fontData: ArrayBuffer | null = null;
async function getFontData() {
    if (fontData) return fontData;
    // Fetch Roboto Bold
    const response = await fetch('https://fonts.gstatic.com/s/roboto/v30/KFOlCnqEu92Fr1MmWUlfBBc4.woff2');
    fontData = await response.arrayBuffer();
    return fontData;
}

export async function generateOgImage(article: Article): Promise<Buffer> {
    const font = await getFontData();

    // Create the element structure
    // Note: Satori supports a subset of CSS. Flexbox is robust.
    const element = (
        <div
            style={{
                height: '100%',
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#0f172a', // Dark background matching site theme
                backgroundImage: article.imageUrl ? `url(${article.imageUrl})` : 'linear-gradient(135deg, #dc2626 0%, #7c3aed 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.7)', // Overlay for readability
                    padding: '40px 60px',
                    justifyContent: 'space-between',
                }}
            >
                {/* Header / Logo Area */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '60px',
                            height: '60px',
                            borderRadius: '12px',
                            background: 'linear-gradient(135deg, #dc2626 0%, #7c3aed 100%)',
                            color: 'white',
                            fontSize: '24px',
                            fontWeight: 700,
                            marginRight: '20px',
                        }}
                    >
                        RN
                    </div>
                    <div style={{ color: 'white', fontSize: '32px', fontWeight: 700 }}>Real News UZ</div>
                </div>

                {/* Content Area */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {article.category && (
                        <div
                            style={{
                                backgroundColor: '#dc2626',
                                color: 'white',
                                padding: '10px 24px',
                                borderRadius: '50px',
                                fontSize: '24px',
                                fontWeight: 600,
                                alignSelf: 'flex-start',
                                marginBottom: '20px',
                            }}
                        >
                            {article.category}
                        </div>
                    )}

                    <div
                        style={{
                            fontSize: '60px',
                            fontWeight: 800,
                            color: 'white',
                            lineHeight: 1.2,
                            marginBottom: '20px',
                            display: '-webkit-box',
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {article.title}
                    </div>

                    <div style={{ fontSize: '24px', color: '#cbd5e1' }}>
                        {article.publishedAt ? new Date(article.publishedAt).toLocaleDateString('uz-UZ', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Hozirda'}
                    </div>
                </div>
            </div>
        </div>
    );

    // Convert to SVG
    const svg = await satori(element, {
        width: 1200,
        height: 630,
        fonts: [
            {
                name: 'Roboto',
                data: font,
                weight: 700,
                style: 'normal',
            },
        ],
    });

    // Convert to PNG using Resvg
    const resvg = new Resvg(svg, {
        fitTo: {
            mode: 'width',
            value: 1200,
        },
    });

    const pngData = resvg.render();
    return pngData.asPng();
}
