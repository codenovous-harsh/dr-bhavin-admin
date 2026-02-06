'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SkinAnalysisQuestionnaire } from '@/types/skinAnalysis';

interface QuestionnaireDisplayProps {
  questionnaire: SkinAnalysisQuestionnaire;
}

export default function QuestionnaireDisplay({
  questionnaire,
}: QuestionnaireDisplayProps) {
  const sections = [
    {
      title: 'Skin Moisture Patterns',
      key: 'skinMoisture',
      data: questionnaire.skinMoisture,
      icon: '💧',
    },
    {
      title: 'Skin Sebum/Oiliness',
      key: 'skinSebum',
      data: questionnaire.skinSebum,
      icon: '✨',
    },
    {
      title: 'Skin Inflammation',
      key: 'skinInflammation',
      data: questionnaire.skinInflammation,
      icon: '🔥',
    },
    {
      title: 'Pigmentation Concerns',
      key: 'pigmentation',
      data: questionnaire.pigmentation ? [questionnaire.pigmentation] : [],
      icon: '🎨',
    },
    {
      title: 'Lifestyle Habits',
      key: 'lifestyleHabits',
      data: questionnaire.lifestyleHabits,
      icon: '🏃',
    },
    {
      title: 'Suncare Habits',
      key: 'suncareHabits',
      data: questionnaire.suncareHabits,
      icon: '☀️',
    },
    {
      title: 'Eye Area Concerns',
      key: 'eyeConcerns',
      data: questionnaire.eyeConcerns,
      icon: '👁️',
    },
    {
      title: 'Other Concerns',
      key: 'otherConcerns',
      data: questionnaire.otherConcerns,
      icon: '📋',
    },
    {
      title: 'Treatment Goals',
      key: 'addressConcerns',
      data: questionnaire.addressConcerns,
      icon: '🎯',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questionnaire Responses</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="multiple" className="w-full">
          {sections.map((section) => {
            const hasData =
              section.data && Array.isArray(section.data) && section.data.length > 0;
            const responseCount = hasData ? section.data.length : 0;

            return (
              <AccordionItem key={section.key} value={section.key}>
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex items-center gap-3 text-left">
                    <span className="text-2xl">{section.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium">{section.title}</p>
                      {hasData && (
                        <p className="text-sm text-muted-foreground">
                          {responseCount}{' '}
                          {responseCount === 1 ? 'response' : 'responses'}
                        </p>
                      )}
                    </div>
                    {!hasData && (
                      <Badge variant="secondary" className="ml-auto mr-4">
                        Not answered
                      </Badge>
                    )}
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  {hasData ? (
                    <ul className="space-y-2 pl-11">
                      {section.data.map((item, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2 text-sm"
                        >
                          <span className="text-green-600 mt-0.5">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="pl-11 text-sm text-muted-foreground">
                      No responses provided for this section
                    </p>
                  )}
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>
    </Card>
  );
}
