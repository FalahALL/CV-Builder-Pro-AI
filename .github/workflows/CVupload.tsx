"use client";

import { useRef, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useCvStore } from '@/lib/store';
import { runCvParsing } from '@/lib/actions';
import { loadScript } from '@/lib/pdf';
import { Button } from '@/components/ui/button';
import { UploadCloud, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CVUploader() {
    const { t } = useLanguage();
    const { hydrateFromParsedCV, meta } = useCvStore();
    const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();
    const isStaticBuild = process.env.NEXT_PUBLIC_IS_STATIC_BUILD === 'true';

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Reset file input to allow re-uploading the same file
        event.target.value = '';

        const apiKey = meta.apiKeys[meta.selectedAiProvider];
        if (!apiKey && !isStaticBuild) {
            toast({
                variant: 'destructive',
                title: 'API Key Missing',
                description: t('apiKeyPrompt'),
            });
            setStatus('error');
            return;
        }

        setStatus('parsing');
        try {
            await loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js');
            // @ts-ignore
            window.pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js`;

            const fileReader = new FileReader();
            fileReader.onload = async (e) => {
                const typedarray = new Uint8Array(e.target?.result as ArrayBuffer);
                // @ts-ignore
                const pdf = await window.pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    fullText += textContent.items.map((item: any) => item.str).join(' ');
                }
                
                const result = await runCvParsing(fullText);
                if (result.success && result.data) {
                    hydrateFromParsedCV(result.data);
                    setStatus('success');
                    toast({ title: 'Success', description: t('parseSuccess') });
                } else {
                    throw new Error(result.error);
                }
            };
            fileReader.readAsArrayBuffer(file);
        } catch (err: any) {
            console.error(err);
            setStatus('error');
            toast({
                variant: 'destructive',
                title: 'Parsing Failed',
                description: `${t('parseError')} ${err.message}`,
            });
        }
    };

    return (
        <div className="text-center p-4 border-2 border-dashed rounded-lg">
            <input type="file" accept=".pdf" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            <UploadCloud className="mx-auto text-muted-foreground" size={40} />
            <p className="text-sm font-semibold mt-2">{t('uploadCV')}</p>
            <Button onClick={() => fileInputRef.current?.click()} disabled={status === 'parsing' || isStaticBuild} className="mt-3">
                {status === 'parsing' && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                {isStaticBuild ? 'AI Parsing Disabled' : 'Select File & Parse'}
            </Button>
            <p className="text-xs text-muted-foreground mt-2">{isStaticBuild ? 'AI features require a server and are disabled in this version.' : t('uploadDescription')}</p>
        </div>
    );
}
