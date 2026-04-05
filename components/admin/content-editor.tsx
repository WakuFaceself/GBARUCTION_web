import {
  archiveAdminContentAction,
  publishAdminContentAction,
  saveDraftAdminContentAction,
} from "@/lib/actions/admin/content";
import { EditorShell } from "@/components/editor/editor-shell";
import type { AdminMediaAsset } from "@/lib/queries/admin/media";
import type {
  AdminCollectionConfig,
  AdminContentRecord,
  AdminContentType,
} from "@/lib/queries/admin/content";

function fieldValue(record: AdminContentRecord | null | undefined, name: string, fallback = "") {
  return record?.fields[name] ?? fallback;
}

function fieldWrapperClassName(kind: string) {
  return kind === "textarea" || kind === "datetime" ? "md:col-span-2" : "";
}

function formatBodyBlocks(value: string | undefined) {
  if (value && value.trim()) {
    return value;
  }

  return JSON.stringify(
    [
      {
        id: "body-intro",
        type: "richText",
        data: {
          content: "",
        },
      },
    ],
    null,
    2,
  );
}

export function ContentEditor({
  type,
  config,
  record,
  mode,
  mediaAssets,
  errorMessage,
  actionPath,
}: {
  type: AdminContentType;
  config: AdminCollectionConfig;
  record: AdminContentRecord | null;
  mode: "create" | "edit";
  mediaAssets: AdminMediaAsset[];
  errorMessage?: string | null;
  actionPath: string;
}) {
  const mediaOptions = mediaAssets.map((asset) => ({
    value: asset.id,
    label: asset.altText?.trim() ? `${asset.fileName} — ${asset.altText}` : asset.fileName,
  }));

  return (
    <section className="space-y-6">
      <div className="space-y-2 border-b border-[var(--line)] pb-6">
        <p className="text-xs uppercase tracking-[0.35em] text-[var(--muted)]">
          {mode === "create" ? "Create record" : "Edit record"}
        </p>
        <h1 className="text-4xl font-black uppercase leading-none">
          {mode === "create" ? config.newLabel : `Edit ${config.singularLabel.toLowerCase()}`}
        </h1>
        <p className="max-w-3xl text-sm leading-6 text-[var(--muted)]">
          This editor now keeps bilingual metadata separate from the single-language body so the admin flow
          matches the v1 content model before we wire it into the database-backed CMS.
        </p>
      </div>

      <form action={saveDraftAdminContentAction} className="space-y-6">
        <input type="hidden" name="type" value={type} />
        <input type="hidden" name="returnPath" value={actionPath} />
        {record ? <input type="hidden" name="id" value={record.id} /> : null}

        {errorMessage ? (
          <p className="rounded-2xl border border-[#ff8a63]/30 bg-[#ff8a63]/10 px-4 py-3 text-sm text-[#ffd5c4]">
            {errorMessage}
          </p>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          {config.fields.map((field) => {
            const value = fieldValue(record, field.name, field.defaultValue ?? "");
            const options =
              field.name === "coverAssetId"
                ? [{ value: "", label: "None" }, ...mediaOptions]
                : (field.options ?? []).map((option) => ({ value: option, label: option }));

            return (
              <label key={field.name} className={`space-y-2 ${fieldWrapperClassName(field.kind)}`}>
                <span className="block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">
                  {field.label}
                </span>
                {field.kind === "textarea" ? (
                  <textarea
                    name={field.name}
                    defaultValue={value}
                    rows={5}
                    className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                    placeholder={field.label}
                  />
                ) : field.kind === "select" ? (
                  <select
                    name={field.name}
                    defaultValue={value}
                    className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none transition-colors focus:border-[var(--accent)]"
                  >
                    {options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    name={field.name}
                    defaultValue={value}
                    type={field.kind === "datetime" ? "datetime-local" : field.kind === "url" ? "url" : "text"}
                    className="w-full rounded-3xl border border-[var(--line)] bg-black/20 px-4 py-3 text-sm outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
                    placeholder={field.label}
                  />
                )}
                {field.helpText ? <p className="text-xs text-[var(--muted)]">{field.helpText}</p> : null}
              </label>
            );
          })}
        </div>

        <EditorShell
          title="Body blocks"
          description="V1 keeps one body per record. Use rich-text blocks JSON here so admin and public rendering stay on the same contract."
          className="rounded-[2rem] border border-[var(--line)] bg-black/20 p-5"
        >
          <label className="space-y-2">
            <span className="block text-xs uppercase tracking-[0.3em] text-[var(--muted)]">bodyBlocks</span>
            <textarea
              name="bodyBlocks"
              defaultValue={formatBodyBlocks(fieldValue(record, "bodyBlocks"))}
              rows={12}
              className="w-full rounded-[1.5rem] border border-[var(--line)] bg-black/30 px-4 py-3 font-mono text-xs leading-6 outline-none transition-colors placeholder:text-[var(--muted)] focus:border-[var(--accent)]"
              placeholder='[{"id":"body-intro","type":"richText","data":{"content":"..."}}]'
            />
            <p className="text-xs text-[var(--muted)]">
              English and Chinese titles stay separate, but the article body is stored once and tagged with
              `bodyLanguage`.
            </p>
          </label>
        </EditorShell>

        <div className="flex flex-wrap gap-3 border-t border-[var(--line)] pt-6">
          <button
            type="submit"
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold transition-colors hover:bg-white/5"
          >
            Save draft
          </button>
          <button
            type="submit"
            formAction={publishAdminContentAction}
            className="rounded-full border border-[var(--accent)] bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-[#120a06] transition-colors hover:bg-[#ff7b53]"
          >
            Publish
          </button>
          <button
            type="submit"
            formAction={archiveAdminContentAction}
            className="rounded-full border border-[var(--line)] px-4 py-2 text-sm font-semibold text-[var(--muted)] transition-colors hover:bg-white/5 hover:text-[var(--text)]"
          >
            Archive
          </button>
        </div>
      </form>
    </section>
  );
}
