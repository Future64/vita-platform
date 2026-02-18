"use client";

import { useState, useCallback, useRef } from "react";

interface ProfileEditorReturn<T> {
  data: T;
  setData: React.Dispatch<React.SetStateAction<T>>;
  isEditing: boolean;
  isSaving: boolean;
  hasChanges: boolean;
  startEditing: (initialData: T) => void;
  cancel: () => void;
  save: (onSave: (data: T) => void) => Promise<void>;
  updateField: <K extends keyof T>(key: K, value: T[K]) => void;
}

export function useProfileEditor<T extends Record<string, unknown>>(
  defaultData: T
): ProfileEditorReturn<T> {
  const [data, setData] = useState<T>(defaultData);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const originalData = useRef<T>(defaultData);

  const hasChanges = isEditing && JSON.stringify(data) !== JSON.stringify(originalData.current);

  const startEditing = useCallback((initialData: T) => {
    originalData.current = initialData;
    setData(initialData);
    setIsEditing(true);
  }, []);

  const cancel = useCallback(() => {
    setData(originalData.current);
    setIsEditing(false);
  }, []);

  const save = useCallback(async (onSave: (data: T) => void) => {
    setIsSaving(true);
    // Simulated 500ms delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    onSave(data);
    setIsSaving(false);
    setIsEditing(false);
  }, [data]);

  const updateField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  }, []);

  return {
    data,
    setData,
    isEditing,
    isSaving,
    hasChanges,
    startEditing,
    cancel,
    save,
    updateField,
  };
}
