import React, { createContext, useContext, useState } from 'react';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface NotesContextType {
  notes: Note[];
  addNote: (title: string, content: string) => void;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export function NotesProvider({ children }: { children: React.ReactNode }) {
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', title: 'Sample Field Note', content: 'Checking baseline telemetry parameters.', createdAt: new Date().toLocaleDateString() }
  ]);

  const addNote = (title: string, content: string) => {
    const newNote: Note = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toLocaleDateString(),
    };
    setNotes((prev) => [newNote, ...prev]);
  };

  return (
    <NotesContext.Provider value={{ notes, addNote }}>
      {children}
    </NotesContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
}