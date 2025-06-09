import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import type { NoteFormHeaderProps } from './types';

export default function NoteFormHeader({ title, onBack }: NoteFormHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="rounded-full"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Powrót</span>
        </Button>
        <h1 className="text-2xl font-semibold">{title}</h1>
      </div>
    </div>
  );
} 