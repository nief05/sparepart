"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wrench, Plus } from "lucide-react";

export function CreateTicketDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="gap-2"><Plus className="size-4" /> New Ticket</Button>} />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wrench className="size-5 text-primary" />
            Create Repair Ticket
          </DialogTitle>
          <DialogDescription>
            Register device inspection and repair order into the Beres.in system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Customer Name
            </label>
            <Input placeholder="e.g. Budi Santoso" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Device Brand
              </label>
              <Input placeholder="Apple, Samsung, Xiaomi" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground block mb-1">
                Device Model
              </label>
              <Input placeholder="iPhone 14 Pro, S23" />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Initial Status
            </label>
            <Select defaultValue="RECEIVED">
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="RECEIVED">RECEIVED</SelectItem>
                <SelectItem value="DIAGNOSIS">DIAGNOSIS</SelectItem>
                <SelectItem value="PROGRESS">PROGRESS</SelectItem>
                <SelectItem value="QC">QC</SelectItem>
                <SelectItem value="READY">READY</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground block mb-1">
              Complaint / Problem Description
            </label>
            <Input placeholder="e.g. Broken screen, battery drain" />
          </div>
        </div>

        <DialogFooter showCloseButton>
          <Button onClick={() => setOpen(false)}>Save Ticket</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
