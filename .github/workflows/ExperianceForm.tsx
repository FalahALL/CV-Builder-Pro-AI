"use client";

import { useState } from 'react';
import { useCvStore } from '@/lib/store';
import { useLanguage } from '@/hooks/use-language';
import { InputField } from '@/components/shared/InputField';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Wand2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AIHelperModal } from '@/components/modals/AIHelperModal';
import type { Experience } from '@/lib/types';

export function ExperienceForm() {
    const { experiences, addExperience, updateExperience, removeExperience, addExperiencePoint, updateExperiencePoint, removeExperiencePoint } = useCvStore();
    const { t } = useLanguage();
    const [aiHelperState, setAiHelperState] = useState<{ isOpen: boolean; expIndex: number | null }>({ isOpen: false, expIndex: null });
    const isStaticBuild = process.env.NEXT_PUBLIC_IS_STATIC_BUILD === 'true';

    const openAiHelper = (expIndex: number) => setAiHelperState({ isOpen: true, expIndex });
    
    const expForModal = aiHelperState.expIndex !== null ? experiences[aiHelperState.expIndex] : null;

    return (
        <div className="space-y-6">
            {experiences.map((exp, index) => (
                <div key={exp.id} className="p-4 bg-muted/50 rounded-lg border relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label={t('jobTitle')} value={exp.jobTitle} onChange={(e) => updateExperience(index, 'jobTitle', e.target.value)} />
                        <InputField label={t('company')} value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)} />
                        <InputField label={t('city')} value={exp.city} onChange={(e) => updateExperience(index, 'city', e.target.value)} />
                        <div className="grid grid-cols-2 gap-2">
                            <InputField label={t('startDate')} value={exp.startDate} onChange={(e) => updateExperience(index, 'startDate', e.target.value)} placeholder="e.g. Jan 2022" />
                            <InputField label={t('endDate')} value={exp.endDate} onChange={(e) => updateExperience(index, 'endDate', e.target.value)} placeholder="e.g. Present" />
                        </div>
                    </div>
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between items-center">
                            <Label className="font-medium">{t('descriptionPoints')}</Label>
                            <Button variant="link" size="sm" onClick={() => openAiHelper(index)} disabled={isStaticBuild}>
                                <Wand2 size={14} /> {t('aiHelper')}
                            </Button>
                        </div>
                        {exp.points.map((point, pIndex) => (
                            <div key={`${exp.id}-${pIndex}`} className="flex items-center gap-2">
                                <span className="text-muted-foreground mt-1">•</span>
                                <Input type="text" value={point} onChange={(e) => updateExperiencePoint(index, pIndex, e.target.value)} placeholder="Describe achievement or responsibility" />
                                <Button variant="ghost" size="icon" onClick={() => removeExperiencePoint(index, pIndex)} className="text-muted-foreground hover:text-destructive shrink-0">
                                    <Trash2 size={16} />
                                </Button>
                            </div>
                        ))}
                        <Button variant="link" size="sm" onClick={() => addExperiencePoint(index)}>
                            <Plus size={16} /> {t('addPoint')}
                        </Button>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => removeExperience(index)} className="absolute top-1 right-1 text-muted-foreground hover:text-destructive">
                        <Trash2 size={18} />
                    </Button>
                </div>
            ))}
            <Button onClick={addExperience} variant="secondary" className="w-full">
                <Plus size={20} /> {t('addExperience')}
            </Button>
            {aiHelperState.isOpen && expForModal && (
                <AIHelperModal 
                    onClose={() => setAiHelperState({ isOpen: false, expIndex: null})} 
                    onTextGenerated={(text) => {
                        const points = text.split('\n').map(p => p.replace(/^- /,'').trim()).filter(p => p);
                        updateExperience(aiHelperState.expIndex as number, 'points', points);
                    }} 
                    initialText={expForModal.points.join('\n')}
                    aiContext={{
                        type: 'experience',
                        jobTitle: expForModal.jobTitle,
                        company: expForModal.company,
                    }}
                />
            )}
        </div>
    );
}
