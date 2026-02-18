"use client";

import { type ReactNode } from "react";
import { Edit, Save, X, Loader2 } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PermissionGate } from "@/components/auth/PermissionGate";

interface EditableSectionProps {
  title: string;
  icon?: LucideIcon;
  children: ReactNode;
  editForm?: ReactNode;
  isEditing?: boolean;
  onEdit?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  canEdit?: boolean;
  saving?: boolean;
  permission?: "edit_own_profile";
}

export function EditableSection({
  title,
  icon: Icon,
  children,
  editForm,
  isEditing = false,
  onEdit,
  onSave,
  onCancel,
  canEdit = true,
  saving = false,
  permission = "edit_own_profile",
}: EditableSectionProps) {
  return (
    <Card
      style={
        isEditing
          ? { borderColor: "#8b5cf6", borderWidth: 2 }
          : undefined
      }
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          {Icon && (
            <Icon
              className="h-4 w-4"
              style={{ color: isEditing ? "#8b5cf6" : "var(--text-muted)" }}
            />
          )}
          <CardTitle>{title}</CardTitle>
        </div>
        {canEdit && editForm && (
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={onCancel}
                  disabled={saving}
                >
                  <X className="h-3.5 w-3.5" />
                  Annuler
                </Button>
                <Button
                  size="sm"
                  onClick={onSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                  {saving ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </>
            ) : (
              <PermissionGate permission={permission} hide>
                <Button variant="ghost" size="sm" onClick={onEdit}>
                  <Edit className="h-3.5 w-3.5" />
                  Modifier
                </Button>
              </PermissionGate>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isEditing && editForm ? editForm : children}
      </CardContent>
    </Card>
  );
}
