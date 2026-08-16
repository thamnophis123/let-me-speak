"use client";

import { useEffect, useState } from "react";

import { AddEvidenceForm } from "@/components/project/add-evidence-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const OPEN_EVENT = "ltps:open-add-evidence";

export function openAddEvidenceForm() {
  window.dispatchEvent(new Event(OPEN_EVENT));
  document.getElementById("add-evidence")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

export function AddEvidenceControls({ projectId }: { projectId: string }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const response = await fetch("/api/admin/session");
        const payload = (await response.json()) as { admin?: boolean };
        if (!cancelled) {
          setIsAdmin(Boolean(payload.admin));
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
        }
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener(OPEN_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_EVENT, onOpen);
  }, []);

  if (!isAdmin) {
    return null;
  }

  return (
    <div id="add-evidence" className="grid gap-4">
      {open ? (
        <Card>
          <CardHeader>
            <CardTitle>Add evidence</CardTitle>
            <CardDescription>
              Upload a PDF or DOCX, or paste a public URL. This item is added to
              the evidence baseline Grok will read.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddEvidenceForm
              projectId={projectId}
              onCancel={() => setOpen(false)}
            />
          </CardContent>
        </Card>
      ) : (
        <div>
          <Button type="button" onClick={() => setOpen(true)}>
            Add Evidence
          </Button>
        </div>
      )}
    </div>
  );
}
