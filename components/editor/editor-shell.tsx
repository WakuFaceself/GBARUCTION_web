import React from "react";
import type { ReactNode } from "react";

type EditorShellProps = {
  title?: string;
  description?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
};

function joinClassNames(...parts: Array<string | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function EditorShell({
  title,
  description,
  toolbar,
  footer,
  children,
  className,
}: EditorShellProps) {
  return (
    <section
      data-editor-shell
      className={joinClassNames("editor-shell", className)}
    >
      {(title || description || toolbar) && (
        <header className="editor-shell__header">
          <div>
            {title ? <h2 className="editor-shell__title">{title}</h2> : null}
            {description ? (
              <p className="editor-shell__description">{description}</p>
            ) : null}
          </div>
          {toolbar ? (
            <div className="editor-shell__toolbar">{toolbar}</div>
          ) : null}
        </header>
      )}
      <div className="editor-shell__content">{children}</div>
      {footer ? <footer className="editor-shell__footer">{footer}</footer> : null}
    </section>
  );
}
