import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function DevNotesPanel() {
  return (
    <Card className="flex-1 overflow-y-auto">
      <CardHeader>
        <CardTitle>ðŸ§ª Dev Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Notes, TODOs, and observations will go here.</p>
      </CardContent>
    </Card>
  );
}
