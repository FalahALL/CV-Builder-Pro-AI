"use client";

import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useCvStore } from '@/lib/store';
import { runAnalyzeCv } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Activity, LoaderCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function CVAnalysis() {
    const { t } = useLanguage();
    const cvData = useCvStore();
    const { analysisResult, setAnalysisResult, meta } = useCvStore();
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const isStaticBuild = process.env.NEXT_PUBLIC_IS_STATIC_BUILD === 'true';

    const handleAnalyze = async () => {
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
        setAnalysisResult(null);

        const result = await runAnalyzeCv(cvData);
        if (result.success && result.data) {
            setAnalysisResult(result.data);
        } else {
            toast({
                variant: 'destructive',
                title: 'Analysis Failed',
                description: result.error,
            });
        }
        setIsLoading(false);
    };

    return (
        <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{isStaticBuild ? 'AI features require a server and are disabled in this version.' : t('cvAnalysisDesc')}</p>
            <Button onClick={handleAnalyze} disabled={isLoading || isStaticBuild} className="w-full">
                {isLoading ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Activity className="mr-2 h-4 w-4" />}
                {isStaticBuild ? 'AI Analysis Disabled' : t('analyzeCV')}
            </Button>
            
            {analysisResult && (
                <div className="space-y-4 mt-4">
                    <h3 className="text-lg font-bold font-headline">{t('analysisResult')}</h3>
                    <div className="text-center bg-primary/10 p-4 rounded-lg border border-primary/20">
                        <p className="text-sm font-semibold text-primary">{t('overallScore')}</p>
                        <p className="text-5xl font-bold text-primary">{analysisResult.score}<span className="text-xl">/100</span></p>
                    </div>
                    <div className="space-y-2">
                        <h4 className="font-semibold">{t('suggestions')}</h4>
                        {analysisResult.suggestions.map((item, index) => (
                             <div key={index} className="bg-muted/50 p-3 rounded-md border">
                                 <p className="font-bold text-sm text-foreground">{item.section}</p>
                                 <p className="text-sm text-muted-foreground">{item.feedback}</p>
                             </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
