"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Edit2, Trash2, Eye, Calendar, Tag } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { usePlatformStore } from "@/stores/platform-store";
import { formatDate, slugify } from "@/lib/utils";
import { toast } from "sonner";
import { nanoid } from "nanoid";

export function AdminBlog() {
  const posts = usePlatformStore((s) => s.blogPosts);
  const saveBlogPost = usePlatformStore((s) => s.saveBlogPost);
  const deleteBlogPost = usePlatformStore((s) => s.deleteBlogPost);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<string | null>(null);
  const [draft, setDraft] = React.useState({
    id: "",
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    category: "Engineering",
    status: "draft" as "draft" | "published" | "scheduled",
    tags: "",
    readTime: 5,
  });

  function openNew() {
    setEditing(null);
    setDraft({ id: "", title: "", slug: "", excerpt: "", content: "", category: "Engineering", status: "draft", tags: "", readTime: 5 });
    setOpen(true);
  }
  function openEdit(id: string) {
    const post = posts.find((p) => p.id === id);
    if (!post) return;
    setEditing(id);
    setDraft({
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      status: post.status,
      tags: post.tags.join(", "),
      readTime: post.readTime,
    });
    setOpen(true);
  }

  function save() {
    const id = editing ?? `p_${nanoid(6)}`;
    const slug = draft.slug || slugify(draft.title);
    saveBlogPost({
      id,
      slug,
      title: draft.title,
      excerpt: draft.excerpt,
      content: draft.content,
      category: draft.category,
      status: draft.status,
      tags: draft.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      authorId: "u_admin",
      readTime: draft.readTime,
      publishedAt: draft.status === "published" ? Date.now() : undefined,
      views: 0,
    });
    setOpen(false);
    toast.success(editing ? "Post updated" : "Post created");
  }

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Blog CMS</h2>
          <p className="text-sm text-muted-foreground">Drafts, scheduling, and publishing.</p>
        </div>
        <Button variant="gradient" size="sm" onClick={openNew}>
          <Plus /> New post
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
        {posts.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className="p-5">
              <div className="flex items-center justify-between">
                <Badge variant="outline">{p.category}</Badge>
                <Badge
                  variant="secondary"
                  className={
                    p.status === "published"
                      ? "bg-success/15 text-success border-0"
                      : p.status === "scheduled"
                        ? "bg-primary/15 text-primary border-0"
                        : "border-0"
                  }
                >
                  {p.status}
                </Badge>
              </div>
              <h3 className="mt-3 line-clamp-2 text-base font-semibold">{p.title}</h3>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{p.excerpt}</p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {p.publishedAt ? formatDate(p.publishedAt) : "Unpublished"}
                </span>
                <span>·</span>
                <span>{p.readTime} min read</span>
                {p.tags.length > 0 ? (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {p.tags[0]}
                    </span>
                  </>
                ) : null}
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Button asChild variant="glass" size="sm">
                  <Link href={`/blog/${p.slug}`} target="_blank">
                    <Eye /> Preview
                  </Link>
                </Button>
                <Button variant="glass" size="sm" onClick={() => openEdit(p.id)}>
                  <Edit2 /> Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="ml-auto text-destructive"
                  onClick={() => {
                    deleteBlogPost(p.id);
                    toast.success("Post deleted");
                  }}
                >
                  <Trash2 />
                </Button>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit post" : "New post"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Title</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value, slug: draft.slug || slugify(e.target.value) })}
                placeholder="How we built Linkmint"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Slug</Label>
                <Input
                  value={draft.slug}
                  onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
                  placeholder="how-we-built-linkmint"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Category</Label>
                <Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Engineering", "Design", "Product", "Monetization"].map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Excerpt</Label>
              <Textarea
                rows={2}
                value={draft.excerpt}
                onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Content (markdown)</Label>
              <Textarea
                rows={8}
                value={draft.content}
                onChange={(e) => setDraft({ ...draft, content: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Tags (comma-separated)</Label>
                <Input
                  value={draft.tags}
                  onChange={(e) => setDraft({ ...draft, tags: e.target.value })}
                  placeholder="engineering, motion"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select value={draft.status} onValueChange={(v) => setDraft({ ...draft, status: v as typeof draft.status })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button variant="gradient" onClick={save}>
                {editing ? "Save changes" : "Create post"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
