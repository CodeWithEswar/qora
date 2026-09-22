"use client";

import * as React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { AtSign, Search, User } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface MentionMemberItem {
  id: string;
  name: string;
  email: string;
  role?: string;
}

interface MentionPopoverProps {
  members: MentionMemberItem[];
  onSelectMember: (member: MentionMemberItem) => void;
  trigger?: React.ReactNode;
}

export function MentionPopover({
  members,
  onSelectMember,
  trigger,
}: MentionPopoverProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const filteredMembers = React.useMemo(() => {
    if (!search.trim()) return members.slice(0, 8);
    const q = search.toLowerCase();
    return members
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          m.email.toLowerCase().includes(q) ||
          m.role?.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [members, search]);

  const handleSelect = (member: MentionMemberItem) => {
    onSelectMember(member);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs font-mono text-muted-foreground hover:text-foreground gap-1"
          >
            <AtSign className="w-3.5 h-3.5 text-[#CC785C]" />
            <span>Mention</span>
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-64 p-2 bg-background border-border text-xs font-mono">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-muted/30 border border-border/50 rounded mb-2">
          <Search className="w-3 h-3 text-muted-foreground shrink-0" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search member..."
            className="h-6 border-0 bg-transparent p-0 text-xs focus-visible:ring-0 placeholder:text-muted-foreground/60"
            autoFocus
          />
        </div>

        <div className="max-h-48 overflow-y-auto space-y-0.5">
          {filteredMembers.length === 0 ? (
            <p className="text-[11px] text-muted-foreground px-2 py-3 text-center">
              No matching members
            </p>
          ) : (
            filteredMembers.map((member) => (
              <button
                key={member.id}
                type="button"
                onClick={() => handleSelect(member)}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-muted/50 flex items-center justify-between gap-2 transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-bold text-foreground shrink-0">
                    {member.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground truncate text-xs font-sans">
                      {member.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {member.email}
                    </p>
                  </div>
                </div>
                {member.role && (
                  <span className="text-[9px] px-1 py-0.2 rounded bg-muted text-muted-foreground uppercase shrink-0">
                    {member.role}
                  </span>
                )}
              </button>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
