"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Link2,
  Plus,
  Search,
  Copy,
  MoreHorizontal,
  Edit2,
  Trash2,
  Pause,
  Play,
  Filter,
  Download,
  Check,
  X,
  ExternalLink,
  Tag,
  Globe,
  Lock,
  Sparkles,
} from "lucide-react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useLinksStore, type Link } from "@/stores/links-store";
import { formatCompact, formatCurrency, formatRelativeTime, cn } from "@/lib/utils";
import { toast } from "sonner";

const STATUSES: Array<{ value: Link["status"]; label: string; color: string }> = [
  { value: "active", label: "Active", color: "bg-success/15 text-success" },
  { value: "paused", label: "Paused", color: "bg-warning/15 text-warning" },
  { value: "expired", label: "Expired", color: "bg-muted text-muted-foreground" },
  { value: "disabled", label: "Disabled", color: "bg-destructive/15 text-destructive" },
];

export function LinksClient() {
  const links = useLinksStore((s) => s.links);
  const deleteLink = useLinksStore((s) => s.deleteLink);
  const deleteLinks = useLinksStore((s) => s.deleteLinks);
  const toggleStatus = useLinksStore((s) => s.toggleStatus);
  const updateLink = useLinksStore((s) => s.updateLink);
  const createLink = useLinksStore((s) => s.createLink);
  const isCreating = useLinksStore((s) => s.isCreating);

  const [globalFilter, setGlobalFilter] = React.useState("");
  const [sorting, setSorting] = React.useState<SortingState>([{ id: "clicks", desc: true }]);
  const [statusFilter, setStatusFilter] = React.useState<Set<Link["status"]>>(new Set());
  const [selection, setSelection] = React.useState<Set<string>>(new Set());
  const [createOpen, setCreateOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<Link | null>(null);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("new") === "1") setCreateOpen(true);
  }, []);

  const filtered = React.useMemo(
    () => links.filter((l) => statusFilter.size === 0 || statusFilter.has(l.status)),
    [links, statusFilter],
  );

  const columns: ColumnDef<Link>[] = React.useMemo(
    () => [
      {
        id: "select",
        header: () => (
        <Checkbox
          checked={selection.size === filtered.length && filtered.length > 0}
          ref={(el) => {
            if (el && "indeterminate" in el) {
              (el as unknown as { indeterminate: boolean }).indeterminate =
                selection.size > 0 && selection.size < filtered.length;
            }
          }}
          onCheckedChange={(v) => {
            setSelection(v ? new Set(filtered.map((l) => l.id)) : new Set());
          }}
        />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selection.has(row.original.id)}
            onCheckedChange={(v) => {
              const next = new Set(selection);
              if (v) next.add(row.original.id);
              else next.delete(row.original.id);
              setSelection(next);
            }}
          />
        ),
        size: 36,
      },
      {
        id: "title",
        header: "Link",
        cell: ({ row }) => {
          const l = row.original;
          return (
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="truncate text-sm font-medium">{l.title ?? l.destination}</p>
                {l.passwordHash ? <Lock className="h-3 w-3 text-muted-foreground" /> : null}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-muted-foreground">
                <span className="truncate">/r/{l.shortCode}</span>
                <span>·</span>
                <span className="truncate">{l.destination}</span>
              </div>
            </div>
          );
        },
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const s = STATUSES.find((x) => x.value === row.original.status)!;
          return (
            <Badge variant="secondary" className={cn("border-0", s.color)}>
              {s.label}
            </Badge>
          );
        },
        size: 110,
      },
      {
        id: "tags",
        header: "Tags",
        cell: ({ row }) => (
          <div className="flex max-w-[200px] flex-wrap gap-1">
            {row.original.tags.slice(0, 2).map((t) => (
              <Badge key={t} variant="outline" className="text-[10px]">
                {t}
              </Badge>
            ))}
            {row.original.tags.length > 2 ? (
              <span className="text-[10px] text-muted-foreground">+{row.original.tags.length - 2}</span>
            ) : null}
          </div>
        ),
      },
      {
        id: "clicks",
        header: "Clicks",
        cell: ({ row }) => <span className="font-mono text-sm">{formatCompact(row.original.clicks)}</span>,
        size: 90,
      },
      {
        id: "earnings",
        header: "Earnings",
        cell: ({ row }) => <span className="font-mono text-sm">{formatCurrency(row.original.earnings)}</span>,
        size: 110,
      },
      {
        id: "lastClickedAt",
        header: "Last click",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.lastClickedAt ? formatRelativeTime(row.original.lastClickedAt) : "—"}
          </span>
        ),
        size: 120,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const l = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Copy"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/r/${l.shortCode}`);
                  toast.success("Copied to clipboard");
                }}
              >
                <Copy />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Open"
                onClick={() => window.open(`/r/${l.shortCode}`, "_blank")}
              >
                <ExternalLink />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" aria-label="More">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                  <DropdownMenuItem onSelect={() => setEditing(l)}>
                    <Edit2 /> Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => toggleStatus(l.id)}>
                    {l.status === "active" ? <Pause /> : <Play />}
                    {l.status === "active" ? "Pause" : "Resume"}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    destructive
                    onSelect={() => {
                      deleteLink(l.id);
                      toast.success("Link deleted");
                    }}
                  >
                    <Trash2 /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
        size: 130,
      },
    ],
    [filtered, selection, deleteLink, toggleStatus],
  );

  const table = useReactTable({
    data: filtered,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 12 } },
  });

  function exportCsv() {
    const rows = filtered.filter((l) => selection.size === 0 || selection.has(l.id));
    const csv = [
      ["Short code", "Destination", "Title", "Clicks", "Earnings", "Status", "Created"],
      ...rows.map((l) => [
        l.shortCode,
        l.destination,
        l.title ?? "",
        String(l.clicks),
        l.earnings.toFixed(2),
        l.status,
        new Date(l.createdAt).toISOString(),
      ]),
    ]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "linkmint-links.csv";
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`Exported ${rows.length} links`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:max-w-sm">
          <Input
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            placeholder="Search links…"
            leftIcon={<Search className="h-4 w-4" />}
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="glass" size="sm">
              <Filter />
              Status
              {statusFilter.size > 0 ? (
                <Badge variant="secondary" className="ml-1 h-4 px-1 text-[10px]">
                  {statusFilter.size}
                </Badge>
              ) : null}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-44">
            <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {STATUSES.map((s) => (
              <DropdownMenuCheckboxItem
                key={s.value}
                checked={statusFilter.has(s.value)}
                onCheckedChange={(v) => {
                  const next = new Set(statusFilter);
                  if (v) next.add(s.value);
                  else next.delete(s.value);
                  setStatusFilter(next);
                }}
              >
                {s.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="glass" size="sm" onClick={exportCsv}>
            <Download />
            Export CSV
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="gradient">
                <Plus />
                New link
              </Button>
            </DialogTrigger>
            <CreateLinkDialog
              onClose={() => setCreateOpen(false)}
              onCreate={async (input) => {
                try {
                  await createLink(input);
                  setCreateOpen(false);
                  toast.success("Link created");
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : "Could not create link");
                }
              }}
              loading={isCreating}
            />
          </Dialog>
        </div>
      </div>

      <AnimatePresence>
        {selection.size > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3"
          >
            <span className="text-sm font-medium">{selection.size} selected</span>
            <Separator orientation="vertical" className="h-5" />
            <Button
              variant="glass"
              size="sm"
              onClick={() => {
                Array.from(selection).forEach(toggleStatus);
                toast.success("Toggled status");
              }}
            >
              <Pause /> Pause
            </Button>
            <Button
              variant="glass"
              size="sm"
              onClick={() => {
                Array.from(selection).forEach(toggleStatus);
                toast.success("Resumed");
              }}
            >
              <Play /> Resume
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                deleteLinks(Array.from(selection));
                setSelection(new Set());
                toast.success("Links deleted");
              }}
            >
              <Trash2 /> Delete
            </Button>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSelection(new Set())}>
              <X /> Clear
            </Button>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/40 backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-border/60 bg-card/60 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((h) => (
                    <th
                      key={h.id}
                      style={{ width: h.getSize() }}
                      className="px-3 py-3 font-medium"
                      onClick={h.column.getToggleSortingHandler()}
                    >
                      {flexRender(h.column.columnDef.header, h.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-3 py-12 text-center text-sm text-muted-foreground">
                    <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-secondary/50">
                      <Link2 className="h-5 w-5" />
                    </div>
                    <p className="mt-3">No links match your search.</p>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, i) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.2 }}
                    className="border-b border-border/40 transition-colors hover:bg-secondary/30"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-3 py-3 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
          <span>
            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}-
            {Math.min(
              (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
              filtered.length,
            )}{" "}
            of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              Previous
            </Button>
            <span>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount() || 1}
            </span>
            <Button variant="ghost" size="sm" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
              Next
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={Boolean(editing)} onOpenChange={(v) => !v && setEditing(null)}>
        {editing ? (
          <EditLinkDialog
            link={editing}
            onClose={() => setEditing(null)}
            onSave={(patch) => {
              updateLink(editing.id, patch);
              setEditing(null);
              toast.success("Link updated");
            }}
          />
        ) : null}
      </Dialog>
    </div>
  );
}

function CreateLinkDialog({
  onClose,
  onCreate,
  loading,
}: {
  onClose: () => void;
  onCreate: (input: { destination: string; customAlias?: string; title?: string; tags?: string[]; password?: string }) => Promise<void>;
  loading: boolean;
}) {
  const [destination, setDestination] = React.useState("");
  const [alias, setAlias] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [tags, setTags] = React.useState("");
  const [password, setPassword] = React.useState("");

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Create a short link</DialogTitle>
        <p className="text-sm text-muted-foreground">Paste a long URL &mdash; we&apos;ll do the rest.</p>
      </DialogHeader>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          await onCreate({
            destination,
            customAlias: alias || undefined,
            title: title || undefined,
            tags: tags
              ? tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
              : undefined,
            password: password || undefined,
          });
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label htmlFor="dest">Destination URL</Label>
          <Input
            id="dest"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="https://your-domain.com/very/long/url"
            leftIcon={<Globe className="h-4 w-4" />}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="alias">Custom alias (optional)</Label>
          <Input
            id="alias"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
            placeholder="launch"
            leftIcon={<span className="text-xs text-muted-foreground">/r/</span>}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="title">Title (optional)</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="My launch page" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="tags">Tags (comma-separated)</Label>
          <Input
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="launch, dev"
            leftIcon={<Tag className="h-4 w-4" />}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password (optional)</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••"
            leftIcon={<Lock className="h-4 w-4" />}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient" loading={loading}>
            <Sparkles />
            Create link
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}

function EditLinkDialog({
  link,
  onClose,
  onSave,
}: {
  link: Link;
  onClose: () => void;
  onSave: (patch: Partial<Link>) => void;
}) {
  const [title, setTitle] = React.useState(link.title ?? "");
  const [destination, setDestination] = React.useState(link.destination);
  const [tags, setTags] = React.useState(link.tags.join(", "));
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Edit link</DialogTitle>
        <p className="text-sm text-muted-foreground">/r/{link.shortCode}</p>
      </DialogHeader>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave({
            title: title || undefined,
            destination,
            tags: tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean),
          });
        }}
        className="space-y-4"
      >
        <div className="space-y-1.5">
          <Label>Destination URL</Label>
          <Input value={destination} onChange={(e) => setDestination(e.target.value)} leftIcon={<Globe />} />
        </div>
        <div className="space-y-1.5">
          <Label>Title</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label>Tags</Label>
          <Input value={tags} onChange={(e) => setTags(e.target.value)} leftIcon={<Tag />} />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="gradient">
            <Check /> Save changes
          </Button>
        </div>
      </form>
    </DialogContent>
  );
}
