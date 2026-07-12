import { Q as QRISData, C as ConvertOptions } from '../types-CarXk00x.js';
import React from 'react';

declare function useQris(): {
    staticQris: string | null;
    parsedData: QRISData | null;
    error: string | null;
    isProcessing: boolean;
    processImageFile: (file: File) => Promise<{
        qrisString: string;
        parsed: QRISData;
    }>;
    setRawString: (qrisString: string) => void;
    generateDynamic: (options: ConvertOptions) => string;
};

interface QrisUploaderProps {
    onSuccess: (qrisString: string) => void;
    onError?: (error: Error) => void;
    className?: string;
    buttonText?: string;
    loadingText?: string;
}
declare function QrisUploader({ onSuccess, onError, className, buttonText, loadingText }: QrisUploaderProps): React.JSX.Element;

export { QrisUploader, type QrisUploaderProps, useQris };
