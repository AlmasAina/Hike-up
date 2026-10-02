'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';

interface ConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  destructive?: boolean;
}

/** Promise-based confirmation dialog: `if (await confirm({...})) …` */
export function useConfirm() {
  const [state, setState] = React.useState<(ConfirmOptions & { resolve: (v: boolean) => void }) | null>(null);
  const confirm = React.useCallback((options: ConfirmOptions) => new Promise<boolean>((resolve) => setState({ ...options, resolve })), []);
  const close = (value: boolean) => {
    state?.resolve(value);
    setState(null);
  };
  const dialog = (
    <Dialog open={Boolean(state)} onOpenChange={(open) => !open && close(false)}>
      {state && (
        <DialogContent title={state.title} description={state.description}>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => close(false)}>
              Cancel
            </Button>
            <Button variant={state.destructive ? 'danger' : 'navy'} onClick={() => close(true)} autoFocus>
              {state.confirmLabel ?? 'Confirm'}
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
  return { confirm, dialog };
}
