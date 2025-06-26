"use client";

import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useCvStore } from '@/lib/store';
import { runGenerateInterviewQuestions } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { BrainCircuit, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function InterviewPrep() {
    const { t, language } = useLanguage();
    const cvData = useCvStore();
    const { interviewQuestions, setInterviewQuestions, meta } = cvData;
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const isStaticBuild = process.env.NEXT_PUBLIC_IS_STATIC_BUILD === 'true';

    const handleGenerate = async () => {
        const apiKey = meta.apiKeys[meta.selectedAiProvider];
        if (!apiKey) {
            toast({
                variant: 'destructive',
                title: 'API Key Missing',
                description: t('apiKeyPrompt'),
            });
            return;
        }

        setIsLoading(true);

        const result = await runGenerateInterviewQuestions(cvData, language);

        if (result.success && result.data) {
            setInterviewQuestions(result.data);
        } else {
             toast({
                variant: 'destructive',
                title: 'Generation Failed',
                description: result.error,
            });
        }
        setIsLoading(false);
    };
    
    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{isStaticBuild ? 'AI features require a server and are disabled in this version.' : t('interviewPrepDesc')}</p>
            <Button onClick={handleGenerate} disabled={isLoading || isStaticBuild} className="w-full">
                {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
                {isLoading ? t('generating') : (isStaticBuild ? 'AI Prep Disabled' : t('generateInterviewQuestions'))}
            </Button>
            
            {interviewQuestions.length > 0 && (
                <div className="space-y-3 mt-4">
                    <h4 className="font-semibold">{t('interviewQuestions')}</h4>
                    <ul className="space-y-2 list-decimal list-inside bg-muted/50 p-4 rounded-md border">
                        {interviewQuestions.map((q, i) => (
                            <li key={i} className="text-sm text-foreground">{q}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
