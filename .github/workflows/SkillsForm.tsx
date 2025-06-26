"use client";

import { useState } from 'react';
import { useCvStore } from '@/lib/store';
import { useLanguage } from '@/hooks/use-language';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Target, Wand2 } from 'lucide-react';
import { AIHelperModal } from '@/components/modals/AIHelperModal';
import { KeywordOptimizerModal } from '@/components/modals/KeywordOptimizerModal';

export function SkillsForm() {
    const { skills, setSkillSection, profile } = useCvStore();
    const { t } = useLanguage();
    const [isAiHelperOpen, setAiHelperOpen] = useState<{ isOpen: boolean; type: 'hardSkills' | 'softSkills' | null }>({ isOpen: false, type: null });
    const [isOptimizerOpen, setIsOptimizerOpen] = useState(false);
    const isStaticBuild = process.env.NEXT_PUBLIC_IS_STATIC_BUILD === 'true';

    const openAiHelper = (type: 'hardSkills' | 'softSkills') => setAiHelperOpen({ isOpen: true, type });

    return (
        <div className="space-y-4">
            <div>
                <div className="flex justify-between items-center">
                    <Label className="font-medium">{t('hardSkills')}</Label>
                    <Button variant="link" size="sm" onClick={() => openAiHelper('hardSkills')} disabled={isStaticBuild}>
                        <Wand2 size={14} /> {t('aiHelper')}
                    </Button>
                </div>
                <Textarea 
                    value={skills.hardSkills.join(', ')} 
                    onChange={e => setSkillSection('hardSkills', e.target.value)} 
                    className="mt-1" 
                    placeholder="e.g. React, Data Analysis, ..."
                />
            </div>
            <div>
                <div className="flex justify-between items-center">
                    <Label className="font-medium">{t('softSkills')}</Label>
                    <Button variant="link" size="sm" onClick={() => openAiHelper('softSkills')} disabled={isStaticBuild}>
                        <Wand2 size={14} /> {t('aiHelper')}
                    </Button>
                </div>
                <Textarea 
                    value={skills.softSkills.join(', ')} 
                    onChange={e => setSkillSection('softSkills', e.target.value)} 
                    className="mt-1" 
                    placeholder="e.g. Communication, Teamwork, ..."
                />
            </div>
            <Button onClick={() => setIsOptimizerOpen(true)} variant="secondary" className="w-full" disabled={isStaticBuild}>
                <Target size={20} /> {isStaticBuild ? 'AI Optimizer Disabled' : t('optimizeSkills')}
            </Button>
            {isAiHelperOpen.isOpen && (
                <AIHelperModal 
                    onClose={() => setAiHelperOpen({isOpen: false, type: null})} 
                    onTextGenerated={(text) => setSkillSection(isAiHelperOpen.type!, text.split(',').map(s=>s.trim()))}
                    initialText={skills[isAiHelperOpen.type!]?.join(', ') || ''} 
                    aiContext={{
                        type: 'skills',
                        jobTitle: profile.jobTitle,
                        skillType: isAiHelperOpen.type!,
                    }}
                />
            )}
            {isOptimizerOpen && <KeywordOptimizerModal onClose={() => setIsOptimizerOpen(false)} />}
        </div>
    );
}
