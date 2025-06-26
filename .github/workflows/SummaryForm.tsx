"use client";

import { useState } from 'react';
import { useCvStore } from '@/lib/store';
import { useLanguage } from '@/hooks/use-language';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import { AIHelperModal } from '@/components/modals/AIHelperModal';

export function SummaryForm() {
    const { summary, setSummary, profile, skills } = useCvStore();
    const { t } = useLanguage();
    const [isAiHelperOpen, setAiHelperOpen] = useState(false);
    const isStaticBuild = process.env.NEXT_PUBLIC_IS_STATIC_BUILD === 'true';

    const promptContext = {
      jobTitle: profile.jobTitle || 'professional',
      keySkills: skills.hardSkills.join(', '),
      prompt: `Create a professional summary for a CV of a ${profile.jobTitle || 'professional'}.`
    }

    return (
        <div className="space-y-2">
            <div className="flex justify-between items-center">
                <Label htmlFor="summary" className="font-medium">{t('summary')}</Label>
                <Button variant="link" size="sm" onClick={() => setAiHelperOpen(true)} disabled={isStaticBuild}>
                    <Wand2 size={14} /> {t('aiHelper')}
                </Button>
            </div>
            <Textarea 
                id="summary"
                value={summary} 
                onChange={e => setSummary(e.target.value)} 
                rows={5}
                placeholder="Write a brief summary about yourself..."
            />
            {isAiHelperOpen && (
                <AIHelperModal 
                    onClose={() => setAiHelperOpen(false)} 
                    onTextGenerated={setSummary} 
                    initialText={summary} 
                    aiContext={{
                      type: 'summary',
                      jobTitle: profile.jobTitle,
                      skills: skills.hardSkills.join(', '),
                    }}
                />
            )}
        </div>
    );
}
